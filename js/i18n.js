/**
 * i18n - Internationalization for Texas Hold'em Calculator
 * 中英双语国际化系统
 */
(function() {
    'use strict';
    
    const DEFAULT_LANG = 'zh';
    const STORAGE_KEY = 'poker-lang';
    
    const I18N = {
        'zh': {
            // App
            'app.title': '扑克概率计算器',
            'app.subtitle': '选花色 → 选数字，组合成牌计算概率',
            'app.footer': '仅供学习娱乐使用 · 请理性游戏',
            
            // Stages
            'stage.preflop': 'Pre-flop',
            'stage.flop': 'Flop',
            'stage.turn': 'Turn',
            'stage.river': 'River',
            
            // Sections
            'section.currentSelection': '🃏 当前选择',
            'section.holeCards': '你的手牌 (2张)',
            'section.communityCards': '公共牌 (0-5张)',
            'section.selectCards': '🎯 选择手牌',
            'section.pickerHint': '① 选一个花色 → ② 选一个数字',
            'section.probability': '📊 概率分析',
            
            // Suits
            'suit.spade': '黑桃',
            'suit.heart': '红桃',
            'suit.club': '梅花',
            'suit.diamond': '方块',
            
            // Buttons
            'btn.calc': '计算概率',
            'btn.undo': '↩️ 撤销',
            'btn.clear': '清除全部',
            'btn.send': '发送',
            'btn.notNow': '暂不安装',
            
            // Progress
            'progress.calculating': '正在计算中...',
            'progress.done': '计算完成',
            
            // Methods
            'method.exact': '精确计算',
            'method.monte': '蒙特卡洛模拟',
            'comboCount': '评估 {0} 种组合',
            
            // Hand Names
            'handNames.0': '高牌',
            'handNames.1': '一对',
            'handNames.2': '两对',
            'handNames.3': '三条',
            'handNames.4': '顺子',
            'handNames.5': '同花',
            'handNames.6': '葫芦',
            'handNames.7': '四条',
            'handNames.8': '同花顺',
            'handNames.9': '皇家同花顺',
            
            // Stage Names
            'stageName.preflop': 'Pre-flop（翻牌前）',
            'stageName.flop': 'Flop（翻牌圈）',
            'stageName.turn': 'Turn（转牌圈）',
            'stageName.river': 'River（河牌圈）',
            'stageName.unknown': '未知阶段',
            
            // BRM
            'brm.title': '💰 资金管理建议',
            'brm.desc': '基于 BRM · Kelly · RoR · EV 理论的综合行动建议',
            'brm.label.bankroll': '💵 当前资金',
            'brm.label.buyin': '🎫 买入金额',
            'brm.label.pot': '🏦 当前底池',
            'brm.label.tocall': '📥 需跟注',
            'brm.btn.calc': '获取资金行动建议',
            'brm.loading': '正在模拟对手手牌计算胜率...',
            
            // BRM Actions
            'brm.action.fold': '弃牌 (FOLD)',
            'brm.action.call': '跟注 (CALL)',
            'brm.action.raise': '加注 (RAISE)',
            'brm.action.allin': '全押 (ALL-IN)',
            'brm.confidence': '置信度',
            'brm.suggestedBet': '建议下注',
            
            // BRM Metrics
            'brm.metric.equity': '胜率 (Equity)',
            'brm.metric.potOdds': '底池赔率',
            'brm.metric.ev': '期望值 EV',
            
            // Kelly
            'brm.kelly.full': '完整凯利',
            'brm.kelly.half': '半凯利 ⭐',
            'brm.kelly.quarter': '四分之一凯利',
            
            // BRM Status
            'brm.brmStatus': '💼 资金管理状态',
            'brm.risk': '⚠️ 破产风险评估',
            'brm.riskLabel': '当前级别破产概率',
            'brm.tips': '💡 补充建议',
            
            'brm.brm.safe': '💎 资金充裕（50+买入）',
            'brm.brm.good': '✅ 资金健康（30-50买入）',
            'brm.brm.warning': '⚠️ 资金偏紧（20-30买入）',
            'brm.brm.danger': '🔶 资金紧张（10-20买入）注意降级',
            'brm.brm.critical': '🚨 资金危险（<10买入）必须降级',
            'brm.brm.unknown': '请输入有效的买入金额',
            
            // BRM Advice Tags
            'brm.tag.negativeEV': '负EV',
            'brm.tag.unfavorableOdds': '赔率不利',
            'brm.tag.marginalEV': '边缘EV',
            'brm.tag.potControl': '控制底池',
            'brm.tag.valueBet': '价值下注',
            'brm.tag.strongHand': '强牌',
            'brm.tag.nuts': '坚果',
            'brm.tag.allIn': '全力出击',
            'brm.tag.bankrollProtection': '资金保护',
            
            // BRM Extra Advice
            'brm.extra.kellySuggested': '凯利公式建议投入资金的 {0}%',
            'brm.extra.halfKellySuggested': '半凯利建议投入 {0}%（推荐）',
            'brm.extra.quarterKellySuggested': '四分之一凯利建议投入 {0}%（保守）',
            'brm.extra.lowBuyins': '当前仅 {0} 个买入，建议降低级别或补充资金',
            'brm.extra.sufficient': '资金充足（{0} 买入），可承受正常波动',
            'brm.extra.highVariance': '注意：当前处于高方差区间，短期结果可能大幅偏离期望值',
            'brm.extra.reasoning.fold': '虽然赔率表面有利，但EV为负（说明隐含赔率不足）。长期跟注会亏损，建议弃牌。',
            'brm.extra.reasoning.foldStrong': 'EV为负且赔率不利，弃牌是唯一数学上正确的选择。不要为已经投入的筹码追损。',
            'brm.extra.reasoning.call': '边缘正EV，胜率较低。小注跟注验证，但注意对手范围。如果遭遇再加注建议弃牌。',
            'brm.extra.reasoning.callMedium': '中等胜率，EV为正但收益有限。保守跟注，控制底池大小。',
            'brm.extra.reasoning.raise': '胜率不错，EV可观。建议适度加注获取价值，同时保护手牌。',
            'brm.extra.reasoning.raiseStrong': '强牌！建议主动加注建立底池，最大化价值。注意对手可能的反击范围。',
            'brm.extra.reasoning.allin': '超强牌！胜率极高，全力出击最大化收益。注意慢打（check-raise）也可能有效。',
            'brm.extra.reasoning.bankroll': '【资金修正】资金紧张（<20买入），建议降低下注额保护资金。',
            'brm.extra.reasoning.bankrollTight': '【资金修正】资金偏紧，建议控制下注在资金的20%以内。',
            'brm.extra.reasoning.bankrollLimit': '【资金修正】避免单次投入超过资金15%。',
            
            // Matrix
            'matrix.title': '🎯 13×13 翻前手牌矩阵',
            'matrix.desc': '按位置查看169种起手牌的标准化范围',
            'matrix.legend.raise': '加注',
            'matrix.legend.call': '跟注',
            'matrix.legend.fold': '弃牌',
            'matrix.info': '点击矩阵格子查看该手牌在当前位置的策略',
            'matrix.positionInfo': '当前位置: {0} · 点击格子查看策略',
            
            // Positions
            'position.UTG': '枪口位 (Under the Gun)',
            'position.MP': '中间位 (Middle Position)',
            'position.CO': '关煞位 (Cut Off)',
            'position.BTN': '按钮位 (Button)',
            'position.SB': '小盲位 (Small Blind)',
            'position.BB': '大盲位 (Big Blind)',
            
            // Actions
            'action.R': '加注 (Raise)',
            'action.C': '跟注 (Call)',
            'action.F': '弃牌 (Fold)',
            'action.3': '3-bet',
            'action.L': '溜入 (Limp)',
            'action.desc.R': '主动加注，建立底池或获取价值',
            'action.desc.C': '跟注看翻牌，控制投入',
            'action.desc.F': '手牌太弱，不值得投入',
            'action.desc.3': '再加注，对抗对方加注',
            'action.desc.L': '只跟注大盲，不主动加注',
            
            // Chat
            'chat.title': '🤖 AI 扑克教练',
            'chat.desc': '有任何问题都可以问教练，比如资金管理、起手牌策略、赔率计算等',
            'chat.placeholder': '输入问题...',
            'chat.welcome': '你好！我是你的扑克教练。有什么可以帮你的吗？可以问我关于资金管理、翻前策略、赔率计算、听牌技巧等问题。',
            'chat.suggestion1': '20买入策略',
            'chat.suggestion2': '翻前矩阵',
            'chat.suggestion3': 'Kelly公式',
            'chat.suggestion4': '破产风险',
            
            // PWA
            'pwa.title': '📱 安装到手机桌面',
            'pwa.notNow': '暂不安装',
            'pwa.desc': '安装后无需联网，随时随地学习扑克策略',
            'pwa.installed': '💡 已安装？刷新页面即可离线使用全部功能',
            'pwa.guide.ios.step1': '点击 Safari 底部中间的 <strong>分享按钮</strong> ⬆️',
            'pwa.guide.ios.step2': '在菜单中找到并点击「<strong>添加到主屏幕</strong>」',
            'pwa.guide.ios.step3': '点击右上角「添加」，桌面即出现 ♠ 图标',
            'pwa.guide.android.step1': '点击 Chrome 右上角 <strong>菜单 ⋮</strong>',
            'pwa.guide.android.step2': '选择「<strong>添加到主屏幕</strong>」或「安装应用」',
            'pwa.guide.android.step3': '点击「安装」，桌面即出现图标',
            'pwa.guide.mac.step1': '点击浏览器地址栏右侧的 <strong>安装图标</strong>',
            'pwa.guide.mac.step2': '或按 <strong>Command+Shift+A</strong> 打开应用安装',
            'pwa.guide.windows.step1': '点击浏览器地址栏右侧的 <strong>安装图标</strong>',
            'pwa.guide.windows.step2': '或点击菜单 → 应用 → 安装此站点',
            'pwa.guide.other.step1': '在浏览器菜单中查找「<strong>安装</strong>」或「<strong>添加到主屏幕</strong>」',
            'pwa.guide.other.step2': '不同浏览器操作略有不同，一般在分享或菜单中',
            
            // Alerts / Prompts
            'alert.selectTwoCards': '请先选择2张手牌',
            'alert.validAmount': '请输入有效的资金和买入金额',
            'alert.emptyInput': '你好！有什么问题可以问我，比如资金管理、起手牌范围、翻前策略等。',
            
            // Stage Hints
            'hint.needHole': '还需 {0} 张手牌',
            'hint.needFlop': '还需 {0} 张翻牌',
            'hint.needMore': '还需 {0} 张公共牌',
            'hint.ready': '✓ 已选满 {0} 张牌，可以计算了',
            'hint.pickSuitRank': '① 选花色 → ② 选数字',
            
            // Language
            'lang.selector': '🌐 语言',
            'lang.zh': '简体中文',
            'lang.en': 'English',
            
            // SW
            'sw.registerSuccess': 'SW 注册成功',
            'sw.registerFail': 'SW 注册失败',
            
            // PWA install
            'pwa.accepted': '用户接受了PWA安装',
            'pwa.install': '安装'
        },
        
        'en': {
            // App
            'app.title': 'Poker Probability Calculator',
            'app.subtitle': 'Select suit → Select rank, combine into cards and calculate probability',
            'app.footer': 'For educational and entertainment purposes only · Please play responsibly',
            
            // Stages
            'stage.preflop': 'Pre-flop',
            'stage.flop': 'Flop',
            'stage.turn': 'Turn',
            'stage.river': 'River',
            
            // Sections
            'section.currentSelection': '🃏 Current Selection',
            'section.holeCards': 'Your Hand (2 cards)',
            'section.communityCards': 'Community Cards (0-5)',
            'section.selectCards': '🎯 Select Cards',
            'section.pickerHint': '① Select a suit → ② Select a rank',
            'section.probability': '📊 Probability Analysis',
            
            // Suits
            'suit.spade': 'Spades',
            'suit.heart': 'Hearts',
            'suit.club': 'Clubs',
            'suit.diamond': 'Diamonds',
            
            // Buttons
            'btn.calc': 'Calculate Probability',
            'btn.undo': '↩️ Undo',
            'btn.clear': 'Clear All',
            'btn.send': 'Send',
            'btn.notNow': 'Not Now',
            
            // Progress
            'progress.calculating': 'Calculating...',
            'progress.done': 'Calculation Complete',
            
            // Methods
            'method.exact': 'Exact Calculation',
            'method.monte': 'Monte Carlo Simulation',
            'comboCount': 'Evaluating {0} combinations',
            
            // Hand Names
            'handNames.0': 'High Card',
            'handNames.1': 'One Pair',
            'handNames.2': 'Two Pair',
            'handNames.3': 'Three of a Kind',
            'handNames.4': 'Straight',
            'handNames.5': 'Flush',
            'handNames.6': 'Full House',
            'handNames.7': 'Four of a Kind',
            'handNames.8': 'Straight Flush',
            'handNames.9': 'Royal Flush',
            
            // Stage Names
            'stageName.preflop': 'Pre-flop',
            'stageName.flop': 'Flop',
            'stageName.turn': 'Turn',
            'stageName.river': 'River',
            'stageName.unknown': 'Unknown Stage',
            
            // BRM
            'brm.title': '💰 Bankroll Management',
            'brm.desc': 'Comprehensive advice based on BRM · Kelly · RoR · EV theory',
            'brm.label.bankroll': '💵 Bankroll',
            'brm.label.buyin': '🎫 Buy-in Amount',
            'brm.label.pot': '🏦 Current Pot',
            'brm.label.tocall': '📥 To Call',
            'brm.btn.calc': 'Get Bankroll Advice',
            'brm.loading': 'Simulating opponent hands to calculate equity...',
            
            // BRM Actions
            'brm.action.fold': 'FOLD',
            'brm.action.call': 'CALL',
            'brm.action.raise': 'RAISE',
            'brm.action.allin': 'ALL-IN',
            'brm.confidence': 'Confidence',
            'brm.suggestedBet': 'Suggested Bet',
            
            // BRM Metrics
            'brm.metric.equity': 'Equity',
            'brm.metric.potOdds': 'Pot Odds',
            'brm.metric.ev': 'EV',
            
            // Kelly
            'brm.kelly.full': 'Full Kelly',
            'brm.kelly.half': 'Half Kelly ⭐',
            'brm.kelly.quarter': 'Quarter Kelly',
            
            // BRM Status
            'brm.brmStatus': '💼 Bankroll Status',
            'brm.risk': '⚠️ Risk of Ruin',
            'brm.riskLabel': 'Probability of going broke',
            'brm.tips': '💡 Additional Tips',
            
            'brm.brm.safe': '💎 Well-funded (50+ buy-ins)',
            'brm.brm.good': '✅ Healthy (30-50 buy-ins)',
            'brm.brm.warning': '⚠️ Tight (20-30 buy-ins)',
            'brm.brm.danger': '🔶 Low (10-20 buy-ins) Consider moving down',
            'brm.brm.critical': '🚨 Critical (<10 buy-ins) Must move down',
            'brm.brm.unknown': 'Please enter a valid buy-in amount',
            
            // BRM Advice Tags
            'brm.tag.negativeEV': 'Negative EV',
            'brm.tag.unfavorableOdds': 'Unfavorable Odds',
            'brm.tag.marginalEV': 'Marginal EV',
            'brm.tag.potControl': 'Pot Control',
            'brm.tag.valueBet': 'Value Bet',
            'brm.tag.strongHand': 'Strong Hand',
            'brm.tag.nuts': 'Nuts',
            'brm.tag.allIn': 'All-In',
            'brm.tag.bankrollProtection': 'Bankroll Protection',
            
            // BRM Extra Advice
            'brm.extra.kellySuggested': 'Kelly suggests betting {0}% of bankroll',
            'brm.extra.halfKellySuggested': 'Half Kelly suggests {0}% (recommended)',
            'brm.extra.quarterKellySuggested': 'Quarter Kelly suggests {0}% (conservative)',
            'brm.extra.lowBuyins': 'Only {0} buy-ins — consider moving down or adding funds',
            'brm.extra.sufficient': 'Sufficient bankroll ({0} buy-ins), can withstand normal variance',
            'brm.extra.highVariance': 'Note: Currently in high-variance zone, short-term results may deviate significantly from expectation',
            'brm.extra.reasoning.fold': 'Odds seem favorable but EV is negative (implied odds insufficient). Calling long-term will lose money. Fold.',
            'brm.extra.reasoning.foldStrong': 'Negative EV and unfavorable odds. Folding is the only mathematically correct choice. Don\'t chase losses.',
            'brm.extra.reasoning.call': 'Marginal positive EV, low win rate. Small call to see, but beware of opponent range. Fold if re-raised.',
            'brm.extra.reasoning.callMedium': 'Medium win rate, positive EV but limited upside. Conservative call, control pot size.',
            'brm.extra.reasoning.raise': 'Good win rate, solid EV. Consider moderate raise for value while protecting your hand.',
            'brm.extra.reasoning.raiseStrong': 'Strong hand! Actively raise to build the pot and maximize value. Watch for opponent counter-ranges.',
            'brm.extra.reasoning.allin': 'Premium hand! Very high equity — go all-in to maximize expected value. Slow-play (check-raise) may also be effective.',
            'brm.extra.reasoning.bankroll': '[Bankroll] Tight funds (<20 buy-ins). Reduce bet size to protect bankroll.',
            'brm.extra.reasoning.bankrollTight': '[Bankroll] Funds tight. Keep bets within 20% of bankroll.',
            'brm.extra.reasoning.bankrollLimit': '[Bankroll] Avoid investing more than 15% of bankroll in one hand.',
            
            // Matrix
            'matrix.title': '🎯 13×13 Preflop Hand Matrix',
            'matrix.desc': 'View standardized ranges for 169 starting hands by position',
            'matrix.legend.raise': 'Raise',
            'matrix.legend.call': 'Call',
            'matrix.legend.fold': 'Fold',
            'matrix.info': 'Click a cell to see the strategy for that hand in this position',
            'matrix.positionInfo': 'Position: {0} · Click a cell for strategy',
            
            // Positions
            'position.UTG': 'UTG (Under the Gun)',
            'position.MP': 'MP (Middle Position)',
            'position.CO': 'CO (Cut Off)',
            'position.BTN': 'BTN (Button)',
            'position.SB': 'SB (Small Blind)',
            'position.BB': 'BB (Big Blind)',
            
            // Actions
            'action.R': 'Raise',
            'action.C': 'Call',
            'action.F': 'Fold',
            'action.3': '3-bet',
            'action.L': 'Limp',
            'action.desc.R': 'Active raise to build pot or extract value',
            'action.desc.C': 'Call to see the flop, control investment',
            'action.desc.F': 'Hand too weak, not worth investing',
            'action.desc.3': 'Re-raise to counter opponent\'s raise',
            'action.desc.L': 'Call the big blind only, don\'t raise',
            
            // Chat
            'chat.title': '🤖 AI Poker Coach',
            'chat.desc': 'Ask the coach anything about bankroll management, starting hand strategy, odds calculation, etc.',
            'chat.placeholder': 'Type a question...',
            'chat.welcome': 'Hi! I\'m your poker coach. How can I help? You can ask about bankroll management, preflop strategy, odds calculation, draw techniques, etc.',
            'chat.suggestion1': '20 Buy-in Strategy',
            'chat.suggestion2': 'Preflop Matrix',
            'chat.suggestion3': 'Kelly Formula',
            'chat.suggestion4': 'Risk of Ruin',
            
            // PWA
            'pwa.title': '📱 Install to Home Screen',
            'pwa.notNow': 'Not Now',
            'pwa.desc': 'Install for offline access to all poker strategy tools',
            'pwa.installed': '💡 Already installed? Refresh to use offline',
            'pwa.guide.ios.step1': 'Tap the <strong>Share button</strong> ⬆️ at the bottom of Safari',
            'pwa.guide.ios.step2': 'Find and tap "<strong>Add to Home Screen</strong>"',
            'pwa.guide.ios.step3': 'Tap "Add" in the top right — the ♠ icon appears on your home screen',
            'pwa.guide.android.step1': 'Tap the Chrome menu <strong>⋮</strong> in the top right',
            'pwa.guide.android.step2': 'Select "<strong>Add to Home Screen</strong>" or "Install app"',
            'pwa.guide.android.step3': 'Tap "Install" — the icon appears on your home screen',
            'pwa.guide.mac.step1': 'Tap the <strong>install icon</strong> in the browser address bar',
            'pwa.guide.mac.step2': 'Or press <strong>Command+Shift+A</strong> to open app install',
            'pwa.guide.windows.step1': 'Tap the <strong>install icon</strong> in the browser address bar',
            'pwa.guide.windows.step2': 'Or click Menu → Apps → Install this site',
            'pwa.guide.other.step1': 'Look for "<strong>Install</strong>" or "<strong>Add to Home Screen</strong>" in your browser menu',
            'pwa.guide.other.step2': 'Different browsers vary — usually in Share or Menu',
            
            // Alerts / Prompts
            'alert.selectTwoCards': 'Please select 2 hole cards first',
            'alert.validAmount': 'Please enter valid bankroll and buy-in amounts',
            'alert.emptyInput': 'Hi! What can I help you with? Ask about bankroll management, starting hand ranges, preflop strategy, etc.',
            
            // Stage Hints
            'hint.needHole': 'Need {0} more hole card(s)',
            'hint.needFlop': 'Need {0} more flop card(s)',
            'hint.needMore': 'Need {0} more community card(s)',
            'hint.ready': '✓ All {0} cards selected, ready to calculate',
            'hint.pickSuitRank': '① Select suit → ② Select rank',
            
            // Language
            'lang.selector': '🌐 Language',
            'lang.zh': '简体中文',
            'lang.en': 'English',
            
            // SW
            'sw.registerSuccess': 'SW registered successfully',
            'sw.registerFail': 'SW registration failed',
            
            // PWA install
            'pwa.accepted': 'User accepted PWA install',
            'pwa.install': 'Install'
        }
    };
    
    // ============ Core Functions ============
    
    function getStoredLang() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
        } catch (e) {
            return DEFAULT_LANG;
        }
    }
    
    function setStoredLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
    }
    
    window.getCurrentLang = function() {
        return getStoredLang();
    };
    
    window.i18n = function(key, ...args) {
        const lang = getStoredLang();
        let text = (I18N[lang] && I18N[lang][key]) || (I18N['en'] && I18N['en'][key]) || key;
        args.forEach((arg, i) => {
            text = text.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
        });
        return text;
    };
    
    window.t = window.i18n; // shorthand alias
    
    window.setLanguage = function(lang) {
        if (!I18N[lang]) lang = DEFAULT_LANG;
        setStoredLang(lang);
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        applyTranslations();
        updateLangSelector();
        
        // Dispatch event so poker-engine.js can re-render
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    };
    
    function applyTranslations() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const text = i18n(key);
            if (text !== key) {
                el.textContent = text;
            }
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = i18n(key);
        });
        
        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            el.title = i18n(key);
        });
        
        // Update HTML title
        const titleEl = document.querySelector('title');
        if (titleEl) {
            titleEl.textContent = i18n('app.title');
        }
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = i18n('app.subtitle');
        }
    }
    
    function updateLangSelector() {
        const current = getStoredLang();
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === current);
        });
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        applyTranslations();
        updateLangSelector();
    });
    
})();
