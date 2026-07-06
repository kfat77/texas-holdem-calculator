/**
 * App UI Logic
 * 前端交互逻辑：选牌、计算、BRM、矩阵、聊天、PWA
 * 依赖: core-engine.js, brm-engine.js, preflop-matrix.js, ai-coach.js
 */

// ============ PWA 支持 ============
        let deferredPrompt = null;
        
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log(t('sw.registerSuccess')))
                    .catch(err => console.log(t('sw.registerFail') + ':', err));
            });
        }
        
        // 检测设备类型
        function detectDevice() {
            const ua = navigator.userAgent.toLowerCase();
            if (/iphone|ipad|ipod/.test(ua)) return 'ios';
            if (/android/.test(ua)) return 'android';
            if (/macintosh|mac os/.test(ua)) return 'mac';
            if (/windows/.test(ua)) return 'windows';
            return 'other';
        }
        
        // 获取安装提示内容
        function getInstallGuide(device) {
            const step1 = t('pwa.guide.' + device + '.step1');
            const step2 = t('pwa.guide.' + device + '.step2');
            const step3 = t('pwa.guide.' + device + '.step3');
            
            let html = `
                <div class="pwa-guide-step">
                    <div class="pwa-guide-num">1</div>
                    <div class="pwa-guide-text">${step1}</div>
                </div>
                <div class="pwa-guide-step">
                    <div class="pwa-guide-num">2</div>
                    <div class="pwa-guide-text">${step2}</div>
                </div>
            `;
            if (step3) {
                html += `
                <div class="pwa-guide-step">
                    <div class="pwa-guide-num">3</div>
                    <div class="pwa-guide-text">${step3}</div>
                </div>
                `;
            }
            return html;
        }
        
        // 检查是否已 dismiss（7天内不重复提示）
        function isPWARecentlyDismissed() {
            const dismissedAt = localStorage.getItem('pwa-dismissed-at');
            if (!dismissedAt) return false;
            const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            return days < 7;
        }
        
        function showPWAModal() {
            if (isPWARecentlyDismissed()) return;
            
            const device = detectDevice();
            const body = document.getElementById('pwa-modal-body');
            body.innerHTML = `
                <p style="margin-bottom:12px;color:var(--text-secondary);font-size:0.85rem;">
                    ${t('pwa.desc')}
                </p>
                <div class="pwa-guide-container">
                    ${getInstallGuide(device)}
                </div>
                <p style="margin-top:12px;color:var(--text-muted);font-size:0.75rem;">
                    ${t('pwa.installed')}
                </p>
            `;
            document.getElementById('pwa-modal').style.display = 'block';
        }
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(() => {
                showPWAModal();
            }, 3000);
        });
        
        function installPWA() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log(t('pwa.accepted'));
                    }
                    deferredPrompt = null;
                    document.getElementById('pwa-modal').style.display = 'none';
                });
            } else {
                showPWAModal();
            }
        }
        
        function dismissPWA() {
            document.getElementById('pwa-modal').style.display = 'none';
            localStorage.setItem('pwa-dismissed-at', Date.now().toString());
        }
        
        if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
            document.body.classList.add('standalone');
        }
        
        // 页面加载后主动展示安装提示
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone) {
                    showPWAModal();
                }
            }, 5000);
        });

        // ============ 核心逻辑 ============
        let holeCards = [];
        let communityCards = [];
        let selectedSuit = '♠';
        let cardHistory = [];
        const RANKS_ORDER = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

        function init() {
            renderRankPicker();
            updateUI();
        }

        function renderRankPicker() {
            const container = document.getElementById('rank-picker');
            container.innerHTML = '';
            
            for (const rank of RANKS_ORDER) {
                const btn = document.createElement('button');
                btn.className = 'rank-btn';
                btn.textContent = rank;
                btn.dataset.rank = rank;
                btn.setAttribute('aria-label', 'rank' + rank);
                btn.onclick = () => onRankClick(rank);
                container.appendChild(btn);
            }
        }

        function selectSuit(suit) {
            selectedSuit = suit;
            updateSuitButtons();
            updateRankButtons();
        }

        function onRankClick(rank) {
            const cardStr = selectedSuit + rank;
            const card = new Card(selectedSuit, rank);
            
            const inHole = holeCards.find(c => c.toString() === cardStr);
            const inCommunity = communityCards.find(c => c.toString() === cardStr);
            
            if (inHole) {
                holeCards = holeCards.filter(c => c.toString() !== cardStr);
                cardHistory = cardHistory.filter(h => h !== cardStr);
            } else if (inCommunity) {
                communityCards = communityCards.filter(c => c.toString() !== cardStr);
                cardHistory = cardHistory.filter(h => h !== cardStr);
            } else {
                if (holeCards.length < 2) {
                    holeCards.push(card);
                    cardHistory.push(cardStr);
                } else if (communityCards.length < 5) {
                    communityCards.push(card);
                    cardHistory.push(cardStr);
                }
            }
            
            updateUI();
        }

        function undoLastCard() {
            if (cardHistory.length === 0) return;
            
            const lastCardStr = cardHistory[cardHistory.length - 1];
            const inHole = holeCards.find(c => c.toString() === lastCardStr);
            if (inHole) {
                holeCards = holeCards.filter(c => c.toString() !== lastCardStr);
            } else {
                communityCards = communityCards.filter(c => c.toString() !== lastCardStr);
            }
            
            cardHistory.pop();
            updateUI();
        }

        function removeHoleCard(index) {
            if (index < holeCards.length) {
                const removed = holeCards[index].toString();
                holeCards.splice(index, 1);
                cardHistory = cardHistory.filter(h => h !== removed);
                updateUI();
            }
        }

        function removeCommunityCard(index) {
            if (index < communityCards.length) {
                const removed = communityCards[index].toString();
                communityCards.splice(index, 1);
                cardHistory = cardHistory.filter(h => h !== removed);
                updateUI();
            }
        }

        function clearAll() {
            holeCards = [];
            communityCards = [];
            cardHistory = [];
            document.getElementById('result-area').classList.remove('visible');
            document.getElementById('progress-area').classList.remove('visible');
            document.getElementById('brm-results').innerHTML = '';
            document.getElementById('brm-arrow').textContent = '▶';
            document.getElementById('brm-content').style.display = 'none';
            updateUI();
        }

        function updateSuitButtons() {
            document.querySelectorAll('.suit-btn').forEach(btn => {
                const suit = btn.dataset.suit;
                btn.classList.toggle('active', suit === selectedSuit);
            });
        }

        function updateRankButtons() {
            document.querySelectorAll('.rank-btn').forEach(btn => {
                const rank = btn.dataset.rank;
                const cardStr = selectedSuit + rank;
                
                let isSelected = false;
                for (const s of SUITS) {
                    const cs = s + rank;
                    if (holeCards.find(c => c.toString() === cs) || 
                        communityCards.find(c => c.toString() === cs)) {
                        isSelected = true;
                        break;
                    }
                }
                
                const isCurrentSelected = holeCards.find(c => c.toString() === cardStr) || 
                                          communityCards.find(c => c.toString() === cardStr);
                
                btn.classList.remove('selected', 'disabled', 'other-suit');
                
                if (isCurrentSelected) {
                    btn.classList.add('selected');
                } else if (isSelected) {
                    btn.classList.add('other-suit');
                }
                
                if (holeCards.length >= 2 && communityCards.length >= 5 && !isSelected) {
                    btn.classList.add('disabled');
                }
            });
        }

        function updateStageIndicator() {
            const stages = ['preflop', 'flop', 'turn', 'river'];
            const cc = communityCards.length;
            const hc = holeCards.length;
            
            stages.forEach(s => {
                document.getElementById('stage-' + s).classList.remove('active');
            });
            
            let activeStage = 'preflop';
            let stageText = 'Pre-flop';
            
            if (cc === 0) {
                activeStage = 'preflop';
                if (hc < 2) {
                    stageText = `Pre-flop · ${t('hint.needHole', 2 - hc)}`;
                } else {
                    stageText = t('stageName.preflop');
                }
            } else if (cc < 3) {
                activeStage = 'preflop';
                stageText = `Pre-flop · ${t('hint.needFlop', 3 - cc)}`;
            } else if (cc === 3) {
                activeStage = 'flop';
                stageText = t('stageName.flop');
            } else if (cc === 4) {
                activeStage = 'turn';
                stageText = t('stageName.turn');
            } else if (cc === 5) {
                activeStage = 'river';
                stageText = t('stageName.river');
            }
            
            const activeEl = document.getElementById('stage-' + activeStage);
            activeEl.classList.add('active');
            activeEl.textContent = stageText;
            
            const originalTexts = { 'preflop': 'Pre-flop', 'flop': 'Flop', 'turn': 'Turn', 'river': 'River' };
            stages.forEach(s => {
                if (s !== activeStage) {
                    document.getElementById('stage-' + s).textContent = originalTexts[s];
                }
            });
        }

        function updateUI() {
            const holeSlots = document.getElementById('hole-slots').children;
            for (let i = 0; i < 2; i++) {
                const slot = holeSlots[i];
                if (i < holeCards.length) {
                    const c = holeCards[i];
                    slot.textContent = c.toString();
                    slot.className = 'card-slot filled ' + ((c.suit === '♥' || c.suit === '♦') ? 'red' : 'black');
                } else {
                    slot.textContent = '';
                    slot.className = 'card-slot';
                }
            }
            
            const commSlots = document.getElementById('community-slots').children;
            for (let i = 0; i < 5; i++) {
                const slot = commSlots[i];
                if (i < communityCards.length) {
                    const c = communityCards[i];
                    slot.textContent = c.toString();
                    slot.className = 'card-slot filled ' + ((c.suit === '♥' || c.suit === '♦') ? 'red' : 'black');
                } else {
                    slot.textContent = '';
                    slot.className = 'card-slot';
                }
            }
            
            updateHint();
            updateSuitButtons();
            updateRankButtons();
            updateStageIndicator();
            
            document.getElementById('calc-btn').disabled = holeCards.length !== 2;
            document.getElementById('undo-btn').disabled = cardHistory.length === 0;
        }

        function updateHint() {
            const hint = document.getElementById('picker-hint');
            const hc = holeCards.length;
            const cc = communityCards.length;
            
            let hintHTML = '';
            if (hc < 2) {
                hintHTML = `<strong data-i18n="section.pickerHint">${t('hint.pickSuitRank')}</strong> <span style="color:var(--text-secondary);margin-left:8px;">${t('hint.needHole', 2 - hc)}</span>`;
            } else if (cc < 3) {
                hintHTML = `<strong data-i18n="section.pickerHint">${t('hint.pickSuitRank')}</strong> <span style="color:var(--text-secondary);margin-left:8px;">${t('hint.needFlop', 3 - cc)}</span>`;
            } else if (cc < 5) {
                hintHTML = `<strong data-i18n="section.pickerHint">${t('hint.pickSuitRank')}</strong> <span style="color:var(--text-secondary);margin-left:8px;">${t('hint.needMore', 5 - cc)}</span>`;
            } else {
                hintHTML = `<span style="color:var(--success);">${t('hint.ready', hc + cc)}</span>`;
            }
            hint.innerHTML = hintHTML;
        }

        async function calculate() {
            if (holeCards.length !== 2) return;
            const progressArea = document.getElementById('progress-area');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            const resultArea = document.getElementById('result-area');
            
            progressArea.classList.add('visible');
            resultArea.classList.remove('visible');
            progressFill.style.width = '0%';
            
            await new Promise(r => setTimeout(r, 50));
            progressText.textContent = t('progress.calculating');
            progressFill.style.width = '30%';
            await new Promise(r => setTimeout(r, 50));
            
            setTimeout(() => {
                const result = calculateProbabilities(holeCards, communityCards);
                progressFill.style.width = '100%';
                progressText.textContent = t('progress.done');
                setTimeout(() => {
                    progressArea.classList.remove('visible');
                    showResults(result);
                }, 300);
            }, 100);
        }

        function showResults(result) {
            const resultArea = document.getElementById('result-area');
            const resultInfo = document.getElementById('result-info');
            const probList = document.getElementById('probability-list');
            
            const methodText = result.exact ? t('method.exact') : t('method.monte');
            const badgeClass = result.exact ? 'exact-badge' : 'monte-badge';
            resultInfo.innerHTML = `
                <div style="margin-bottom:4px;">${getStageName()}</div>
                <div><span class="${badgeClass}">${methodText}</span></div>
                <div style="margin-top:6px;font-size:0.8rem;color:var(--text-muted);">${t('comboCount', result.total.toLocaleString())}</div>
            `;
            
            probList.innerHTML = '';
            const maxProb = result.top7[0].probability;
            
            for (let i = 0; i < result.top7.length; i++) {
                const item = result.top7[i];
                if (item.probability <= 0) continue;
                const pct = item.probability.toFixed(2);
                const wp = maxProb > 0 ? (item.probability / maxProb * 100) : 0;
                let bc = 'very-low';
                if (item.probability > 20) bc = 'high';
                else if (item.probability > 5) bc = 'medium';
                else if (item.probability > 1) bc = 'low';
                
                const div = document.createElement('div');
                div.className = 'prob-item';
                div.innerHTML = `
                    <div class="prob-label">${item.name}</div>
                    <div class="prob-bar-container">
                        <div class="prob-bar ${bc}" style="width:0%">${pct}%</div>
                    </div>
                `;
                probList.appendChild(div);
                setTimeout(() => {
                    div.querySelector('.prob-bar').style.width = Math.max(wp, 8) + '%';
                }, 100 + i * 100);
            }
            
            resultArea.classList.add('visible');
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function getStageName() {
            const c = communityCards.length;
            if (c === 0) return t('stageName.preflop');
            if (c === 3) return t('stageName.flop');
            if (c === 4) return t('stageName.turn');
            if (c === 5) return t('stageName.river');
            return t('stageName.unknown');
        }

        // ============ 资金管理 UI 逻辑 ============
        
        let currentEquity = null;
        
        function toggleBRM() {
            const content = document.getElementById('brm-content');
            const arrow = document.getElementById('brm-arrow');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.textContent = isHidden ? '▼' : '▶';
        }
        
        async function calculateBRM() {
            if (holeCards.length !== 2) {
                alert(t('alert.selectTwoCards'));
                return;
            }
            
            const bankroll = parseFloat(document.getElementById('brm-bankroll').value) || 0;
            const buyIn = parseFloat(document.getElementById('brm-buyin').value) || 0;
            const potSize = parseFloat(document.getElementById('brm-pot').value) || 0;
            const toCall = parseFloat(document.getElementById('brm-tocall').value) || 0;
            
            if (bankroll <= 0 || buyIn <= 0) {
                alert(t('alert.validAmount'));
                return;
            }
            
            const btn = document.getElementById('brm-calc-btn');
            const resultsDiv = document.getElementById('brm-results');
            btn.disabled = true;
            btn.textContent = t('brm.loading');
            resultsDiv.innerHTML = '<div class="brm-loading">' + t('brm.loading') + '</div>';
            
            await new Promise(r => setTimeout(r, 50));
            
            const equity = calculateEquity(holeCards, communityCards, 5000);
            currentEquity = equity;
            
            const advice = getBankrollActionAdvice(equity, potSize, toCall, bankroll, buyIn);
            
            btn.disabled = false;
            btn.textContent = t('brm.btn.calc');
            
            renderBRMAdvice(advice);
        }
        
        function renderBRMAdvice(advice) {
            const resultsDiv = document.getElementById('brm-results');
            
            const tagsHtml = advice.tags.map(t => `<span class="brm-tag">${t}</span>`).join('');
            const extraHtml = advice.extraAdvice.map(e => `<div class="brm-tip">• ${e}</div>`).join('');
            
            const kellyPct = Math.max(0, advice.kelly * 100);
            const halfKellyPct = Math.max(0, advice.halfKelly * 100);
            const quarterKellyPct = Math.max(0, advice.quarterKelly * 100);
            
            resultsDiv.innerHTML = `
                <div class="brm-action-card" style="border-color:${advice.actionColor};background:${advice.actionBg}">
                    <div class="brm-action-header">
                        <div class="brm-action-title" style="color:${advice.actionColor}">${advice.action}</div>
                        <div class="brm-action-confidence">${t('brm.confidence')}: ${advice.confidence}</div>
                    </div>
                    <div class="brm-action-reason">${advice.reasoning}</div>
                    ${advice.betSize > 0 ? `<div class="brm-action-bet">${t('brm.suggestedBet')}: <strong>${advice.betSize}</strong></div>` : ''}
                    <div class="brm-action-tags">${tagsHtml}</div>
                </div>
                
                <div class="brm-metrics">
                    <div class="brm-metric">
                        <div class="brm-metric-label">${t('brm.metric.equity')}</div>
                        <div class="brm-metric-value">${(advice.equity * 100).toFixed(1)}%</div>
                    </div>
                    <div class="brm-metric">
                        <div class="brm-metric-label">${t('brm.metric.potOdds')}</div>
                        <div class="brm-metric-value">${(advice.potOdds * 100).toFixed(1)}%</div>
                    </div>
                    <div class="brm-metric">
                        <div class="brm-metric-label">${t('brm.metric.ev')}</div>
                        <div class="brm-metric-value" style="color:${advice.ev >= 0 ? '#4ade80' : '#ef4444'}">${advice.ev >= 0 ? '+' : ''}${advice.ev.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="brm-kelly-section">
                    <div class="brm-section-subtitle">📐 ${t('brm.kelly.full')} / ${t('brm.kelly.half')} / ${t('brm.kelly.quarter')}</div>
                    <div class="brm-kelly-bar">
                        <div class="brm-kelly-label">${t('brm.kelly.full')}</div>
                        <div class="brm-kelly-track">
                            <div class="brm-kelly-fill" style="width:${Math.min(kellyPct, 100)}%;background:#ef4444"></div>
                        </div>
                        <div class="brm-kelly-pct">${kellyPct.toFixed(1)}%</div>
                    </div>
                    <div class="brm-kelly-bar">
                        <div class="brm-kelly-label">${t('brm.kelly.half')}</div>
                        <div class="brm-kelly-track">
                            <div class="brm-kelly-fill" style="width:${Math.min(halfKellyPct, 100)}%;background:#22c55e"></div>
                        </div>
                        <div class="brm-kelly-pct">${halfKellyPct.toFixed(1)}%</div>
                    </div>
                    <div class="brm-kelly-bar">
                        <div class="brm-kelly-label">${t('brm.kelly.quarter')}</div>
                        <div class="brm-kelly-track">
                            <div class="brm-kelly-fill" style="width:${Math.min(quarterKellyPct, 100)}%;background:#3b82f6"></div>
                        </div>
                        <div class="brm-kelly-pct">${quarterKellyPct.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="brm-brm-section">
                    <div class="brm-section-subtitle">${t('brm.brmStatus')}</div>
                    <div class="brm-brm-status" style="color:${advice.brm.color}">
                        ${advice.brm.message} · ${advice.brm.buyIns} ${getCurrentLang() === 'zh' ? '买入' : 'buy-ins'}
                    </div>
                    <div class="brm-brm-bar">
                        <div class="brm-brm-fill" style="width:${Math.min(advice.brm.buyIns / 50 * 100, 100)}%;background:${advice.brm.color}"></div>
                    </div>
                </div>
                
                <div class="brm-risk-section">
                    <div class="brm-section-subtitle">${t('brm.risk')}</div>
                    <div class="brm-risk-value" style="color:${advice.riskOfRuin > 0.1 ? '#ef4444' : advice.riskOfRuin > 0.01 ? '#facc15' : '#4ade80'}">
                        ${(advice.riskOfRuin * 100).toFixed(3)}%
                    </div>
                    <div class="brm-risk-label">${t('brm.riskLabel')}</div>
                </div>
                
                <div class="brm-tips">
                    <div class="brm-section-subtitle">${t('brm.tips')}</div>
                    ${extraHtml}
                </div>
            `;
            
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // ============ 翻前矩阵 UI 逻辑 ============
        
        let currentMatrixPosition = 'UTG';
        
        function toggleMatrix() {
            const content = document.getElementById('matrix-content');
            const arrow = document.getElementById('matrix-arrow');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.textContent = isHidden ? '▼' : '▶';
            if (isHidden && !document.getElementById('matrix-grid').children.length) {
                renderMatrix();
            }
        }
        
        function selectMatrixPosition(pos) {
            currentMatrixPosition = pos;
            document.querySelectorAll('.matrix-pos-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.pos === pos);
            });
            renderMatrix();
        }
        
        function renderMatrix() {
            const grid = document.getElementById('matrix-grid');
            const info = document.getElementById('matrix-info');
            const result = getPreflopMatrix(currentMatrixPosition);
            
            grid.innerHTML = '';
            
            const headerRow = document.createElement('div');
            headerRow.className = 'matrix-row';
            headerRow.innerHTML = '<div class="matrix-cell matrix-header"></div>' + 
                RANKS_MATRIX.map(r => `<div class="matrix-cell matrix-header">${r}</div>`).join('');
            grid.appendChild(headerRow);
            
            for (let i = 0; i < 13; i++) {
                const row = document.createElement('div');
                row.className = 'matrix-row';
                
                const rowHeader = document.createElement('div');
                rowHeader.className = 'matrix-cell matrix-header';
                rowHeader.textContent = RANKS_MATRIX[i];
                row.appendChild(rowHeader);
                
                for (let j = 0; j < 13; j++) {
                    const cellData = result.matrix[i][j];
                    const cell = document.createElement('div');
                    cell.className = 'matrix-cell';
                    cell.style.backgroundColor = cellData.bg;
                    cell.style.color = cellData.color;
                    cell.textContent = cellData.hand;
                    cell.dataset.hand = cellData.hand;
                    cell.dataset.action = cellData.action;
                    cell.dataset.desc = cellData.desc;
                    cell.onclick = () => showMatrixCellInfo(cellData);
                    row.appendChild(cell);
                }
                
                grid.appendChild(row);
            }
            
            info.innerHTML = `<div class="matrix-info-text">${t('matrix.positionInfo', result.positionName)}</div>`;
        }
        
        function showMatrixCellInfo(cellData) {
            const info = document.getElementById('matrix-info');
            info.innerHTML = `
                <div class="matrix-info-detail">
                    <div class="matrix-info-hand" style="color:${cellData.color}">${cellData.hand}</div>
                    <div class="matrix-info-action">${cellData.text}</div>
                    <div class="matrix-info-desc">${cellData.desc}</div>
                </div>
            `;
        }

        // ============ AI 教练聊天 UI 逻辑 ============
        
        function toggleChat() {
            const content = document.getElementById('chat-content');
            const arrow = document.getElementById('chat-arrow');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.textContent = isHidden ? '▼' : '▶';
        }
        
        function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            if (!message) return;
            
            addChatMessage(message, 'user');
            input.value = '';
            
            setTimeout(() => {
                const response = getAICoachResponse(message);
                addChatMessage(response, 'coach');
            }, 600 + Math.random() * 400);
        }
        
        function sendSuggestion(text) {
            document.getElementById('chat-input').value = text;
            sendChatMessage();
        }
        
        function addChatMessage(text, sender) {
            const container = document.getElementById('chat-messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message ' + sender;
            msgDiv.innerHTML = `<div class="chat-bubble ${sender}">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
            container.appendChild(msgDiv);
            container.scrollTop = container.scrollHeight;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Listen for language change to re-render dynamic content
        document.addEventListener('languageChanged', () => {
            updateUI();
            if (document.getElementById('brm-content').style.display !== 'none') {
                const brmResults = document.getElementById('brm-results');
                if (brmResults.innerHTML) {
                    // Re-render if there's advice showing
                    const btn = document.getElementById('brm-calc-btn');
                    btn.textContent = t('brm.btn.calc');
                }
            }
            if (document.getElementById('matrix-content').style.display !== 'none') {
                renderMatrix();
            }
            // Re-render chat welcome message
            const chatContainer = document.getElementById('chat-messages');
            if (chatContainer.children.length === 1) {
                chatContainer.innerHTML = `
                    <div class="chat-message coach">
                        <div class="chat-bubble coach">${t('chat.welcome')}</div>
                    </div>
                `;
            }
        });

        init();
