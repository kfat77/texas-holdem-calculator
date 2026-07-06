/**
 * Bankroll Management Engine (BRM)
 * 资金管理：EV、Kelly、Risk of Ruin、BRM 评估
 * 依赖: core-engine.js
 */

// ============ 资金管理建议引擎 (BRM + Kelly + RoR + EV) ============

/**
 * 计算当前手牌的Equity（胜率）
 * 使用蒙特卡洛模拟：当前手牌 vs 1个随机对手手牌
 * 在已知公共牌的情况下进行
 * @param {Card[]} holeCards - 你的手牌（2张）
 * @param {Card[]} communityCards - 已知的公共牌
 * @param {number} numSimulations - 模拟次数（默认5000）
 * @returns {number} Equity值 (0-1)
 */
function calculateEquity(holeCards, communityCards, numSimulations = 5000) {
    if (holeCards.length !== 2) return 0;
    
    const knownCards = [...holeCards, ...communityCards];
    const deck = removeCards(createDeck(), knownCards);
    const remainingToDraw = 5 - communityCards.length;
    
    let wins = 0;
    let ties = 0;
    
    for (let i = 0; i < numSimulations; i++) {
        // 洗牌
        const shuffled = [...deck];
        for (let j = shuffled.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        
        // 对手手牌
        const opponentCards = [shuffled[0], shuffled[1]];
        
        // 补齐公共牌
        const board = [...communityCards];
        let idx = 2;
        while (board.length < 5) {
            board.push(shuffled[idx++]);
        }
        
        // 评估
        const myBest = evaluate7Cards([...holeCards, ...board]);
        const oppBest = evaluate7Cards([...opponentCards, ...board]);
        const cmp = compareHands(myBest, oppBest);
        
        if (cmp > 0) wins++;
        else if (cmp === 0) ties++;
    }
    
    return (wins + ties * 0.5) / numSimulations;
}

/**
 * 计算期望值 EV
 * EV = (Equity × 赢得金额) - ((1 - Equity) × 投入金额)
 * @param {number} equity - 胜率 (0-1)
 * @param {number} potSize - 当前底池大小
 * @param {number} toCall - 需要跟注的金额
 * @returns {number} EV值（可为负）
 */
function calculateExpectedValue(equity, potSize, toCall) {
    return (equity * potSize) - ((1 - equity) * toCall);
}

/**
 * Kelly Criterion（凯利公式）
 * 最优下注比例 f* = (bp - q) / b
 * b = 赔率 = 赢得金额 / 投入金额 = potSize / toCall
 * p = 胜率 = equity
 * q = 败率 = 1 - equity
 * @param {number} equity - 胜率
 * @param {number} potSize - 底池
 * @param {number} toCall - 跟注额
 * @returns {number} 最优资金比例 (0-1)，负值表示不应下注
 */
function kellyCriterion(equity, potSize, toCall) {
    if (toCall <= 0) return 0;
    const b = potSize / toCall; // 赔率
    const p = equity;
    const q = 1 - equity;
    const fStar = (b * p - q) / b;
    return fStar;
}

/**
 * Half Kelly（半凯利）- 更保守的策略
 * 扑克实战中更常用，降低方差
 */
function halfKelly(equity, potSize, toCall) {
    return kellyCriterion(equity, potSize, toCall) / 2;
}

/**
 * Quarter Kelly（四分之一凯利）- 非常保守
 * 适合波动大的环境或资金紧张时
 */
function quarterKelly(equity, potSize, toCall) {
    return kellyCriterion(equity, potSize, toCall) / 4;
}

/**
 * 计算破产风险 Risk of Ruin（简化模型）
 * 公式: R = ((1 - edge) / (1 + edge)) ^ buyIns
 * edge = 胜率 - 败率（简化的优势边缘）
 * 实际扑克中edge通常很小（1-5%），buyIns越多越安全
 * @param {number} bankroll - 总资金
 * @param {number} buyIn - 买入金额（一个买入单位）
 * @param {number} winRate - 胜率 (0-1)，默认0.52（微优势）
 * @returns {number} 破产概率 (0-1)
 */
function calculateRiskOfRuin(bankroll, buyIn, winRate = 0.52) {
    if (buyIn <= 0 || bankroll <= 0) return 1;
    const buyIns = bankroll / buyIn;
    const edge = winRate - (1 - winRate); // 优势边缘 = 胜率 - 败率
    
    if (edge <= 0) return 1.0; // 无优势或负优势，必然破产
    
    const base = (1 - edge) / (1 + edge);
    const risk = Math.pow(base, buyIns);
    return Math.min(1, Math.max(0, risk));
}

/**
 * BRM 资金管理评估
 * Cash Game 标准：20-50个买入为健康范围
 * @param {number} bankroll - 总资金
 * @param {number} buyIn - 买入金额
 * @returns {Object} {buyIns, status, color, message, level}
 */
function evaluateBankrollManagement(bankroll, buyIn) {
    if (buyIn <= 0) {
        return { buyIns: 0, status: 'unknown', color: '#888', message: t('brm.brm.unknown'), level: 0 };
    }
    const buyIns = bankroll / buyIn;
    
    let status, color, messageKey, level;
    if (buyIns >= 50) {
        status = 'safe';
        color = '#4ade80';
        messageKey = 'brm.brm.safe';
        level = 5;
    } else if (buyIns >= 30) {
        status = 'good';
        color = '#22c55e';
        messageKey = 'brm.brm.good';
        level = 4;
    } else if (buyIns >= 20) {
        status = 'warning';
        color = '#facc15';
        messageKey = 'brm.brm.warning';
        level = 3;
    } else if (buyIns >= 10) {
        status = 'danger';
        color = '#fb923c';
        messageKey = 'brm.brm.danger';
        level = 2;
    } else {
        status = 'critical';
        color = '#ef4444';
        messageKey = 'brm.brm.critical';
        level = 1;
    }
    
    const message = t(messageKey) || messageKey;
    return { buyIns: Math.round(buyIns * 10) / 10, status, color, message, level };
}

/**
 * 综合资金管理行动建议
 * 整合：EV分析、Kelly比例、破产风险、BRM状态
 * @param {number} equity - 胜率 (0-1)
 * @param {number} potSize - 底池大小
 * @param {number} toCall - 需跟注金额
 * @param {number} bankroll - 总资金
 * @param {number} buyIn - 买入金额
 * @returns {Object} 完整建议对象
 */
function getBankrollActionAdvice(equity, potSize, toCall, bankroll, buyIn) {
    // 基础计算
    const potOdds = toCall > 0 ? (toCall / (potSize + toCall)) : 0;
    const ev = calculateExpectedValue(equity, potSize, toCall);
    const kelly = kellyCriterion(equity, potSize, toCall);
    const halfK = halfKelly(equity, potSize, toCall);
    const quarterK = quarterKelly(equity, potSize, toCall);
    const brm = evaluateBankrollManagement(bankroll, buyIn);
    const risk = calculateRiskOfRuin(bankroll, buyIn, equity);
    
    // 赔率分析
    const oddsAdvantage = equity - potOdds;
    
    // 综合决策
    let action, actionKey, actionColor, actionBg, betSize, confidence, reasoning, tags = [];
    const isEn = getCurrentLang() === 'en';
    
    // ===== 决策树 =====
    
    if (ev <= 0) {
        // 负EV - 原则上弃牌
        if (equity > potOdds * 1.3) {
            action = t('brm.action.fold');
            actionKey = 'fold';
            actionColor = '#ef4444';
            actionBg = 'rgba(239,68,68,0.12)';
            betSize = 0;
            confidence = isEn ? 'High' : '高';
            reasoning = t('brm.extra.reasoning.fold');
            tags.push(t('brm.tag.negativeEV'));
        } else {
            action = t('brm.action.fold');
            actionKey = 'fold';
            actionColor = '#ef4444';
            actionBg = 'rgba(239,68,68,0.12)';
            betSize = 0;
            confidence = isEn ? 'Very High' : '极高';
            reasoning = t('brm.extra.reasoning.foldStrong');
            tags.push(t('brm.tag.negativeEV'), t('brm.tag.unfavorableOdds'));
        }
    } else {
        // 正EV - 根据胜率和资金状况细化建议
        
        if (equity < 0.35) {
            // 弱正EV
            action = t('brm.action.call');
            actionKey = 'call';
            actionColor = '#3b82f6';
            actionBg = 'rgba(59,130,246,0.12)';
            betSize = toCall;
            confidence = isEn ? 'Low' : '低';
            reasoning = t('brm.extra.reasoning.call');
            tags.push(t('brm.tag.marginalEV'));
        } else if (equity < 0.55) {
            // 中等胜率
            if (ev < buyIn * 0.03) {
                action = t('brm.action.call');
                actionKey = 'call';
                actionColor = '#3b82f6';
                actionBg = 'rgba(59,130,246,0.12)';
                betSize = toCall;
                confidence = isEn ? 'Medium' : '中';
                reasoning = t('brm.extra.reasoning.callMedium');
                tags.push(t('brm.tag.potControl'));
            } else {
                action = t('brm.action.raise');
                actionKey = 'raise';
                actionColor = '#22c55e';
                actionBg = 'rgba(34,197,94,0.12)';
                // Kelly建议下注额
                const kellyBet = Math.min(bankroll * halfK, potSize * 1.5);
                betSize = Math.max(toCall * 2, Math.round(kellyBet * 100) / 100);
                confidence = isEn ? 'Medium-High' : '中高';
                reasoning = t('brm.extra.reasoning.raise');
                tags.push(t('brm.tag.valueBet'));
            }
        } else if (equity < 0.75) {
            // 强牌
            action = t('brm.action.raise');
            actionKey = 'raise';
            actionColor = '#22c55e';
            actionBg = 'rgba(34,197,94,0.15)';
            const kellyBet = Math.min(bankroll * kelly, potSize * 2);
            betSize = Math.max(toCall * 2.5, Math.round(kellyBet * 100) / 100);
            confidence = isEn ? 'High' : '高';
            reasoning = t('brm.extra.reasoning.raiseStrong');
            tags.push(t('brm.tag.strongHand'), t('brm.tag.valueBet'));
        } else {
            // 超强牌
            action = t('brm.action.allin');
            actionKey = 'allin';
            actionColor = '#a855f7';
            actionBg = 'rgba(168,85,247,0.15)';
            betSize = Math.min(bankroll, potSize * 3);
            confidence = isEn ? 'Very High' : '极高';
            reasoning = t('brm.extra.reasoning.allin');
            tags.push(t('brm.tag.nuts'), t('brm.tag.allIn'));
        }
    }
    
    // ===== 资金紧张修正 =====
    if (brm.level <= 2) {
        // 资金紧张时降低激进程度
        if (actionKey === 'allin') {
            action = t('brm.action.raise');
            actionKey = 'raise';
            actionColor = '#fb923c';
            actionBg = 'rgba(251,146,60,0.12)';
            betSize = Math.min(betSize, bankroll * 0.25);
            reasoning += ' ' + t('brm.extra.reasoning.bankroll');
            tags.push(t('brm.tag.bankrollProtection'));
        } else if (actionKey === 'raise') {
            betSize = Math.min(betSize, bankroll * 0.2);
            reasoning += ' ' + t('brm.extra.reasoning.bankrollTight');
            tags.push(t('brm.tag.bankrollProtection'));
        } else if (actionKey === 'call' && betSize > bankroll * 0.15) {
            betSize = Math.min(betSize, bankroll * 0.15);
            reasoning += ' ' + t('brm.extra.reasoning.bankrollLimit');
            tags.push(t('brm.tag.bankrollProtection'));
        }
    }
    
    // ===== 额外建议 =====
    const extraAdvice = [];
    
    // Kelly比例建议
    if (kelly > 0) {
        extraAdvice.push(t('brm.extra.kellySuggested', (kelly * 100).toFixed(1)));
        extraAdvice.push(t('brm.extra.halfKellySuggested', (halfK * 100).toFixed(1)));
        if (quarterK > 0) {
            extraAdvice.push(t('brm.extra.quarterKellySuggested', (quarterK * 100).toFixed(1)));
        }
    }
    
    // BRM建议
    if (brm.level <= 2) {
        extraAdvice.push(t('brm.extra.lowBuyins', brm.buyIns));
    } else if (brm.level >= 4) {
        extraAdvice.push(t('brm.extra.sufficient', brm.buyIns));
    }
    
    // 方差提醒
    if (equity > 0.4 && equity < 0.6) {
        extraAdvice.push(t('brm.extra.highVariance'));
    }
    
    return {
        // 核心数据
        equity: Math.round(equity * 10000) / 10000,
        potOdds: Math.round(potOdds * 10000) / 10000,
        oddsAdvantage: Math.round(oddsAdvantage * 10000) / 10000,
        ev: Math.round(ev * 100) / 100,
        
        // Kelly
        kelly: Math.round(kelly * 10000) / 10000,
        halfKelly: Math.round(halfK * 10000) / 10000,
        quarterKelly: Math.round(quarterK * 10000) / 10000,
        
        // 风险
        riskOfRuin: Math.round(risk * 10000) / 10000,
        brm,
        
        // 建议
        action,
        actionKey,
        actionColor,
        actionBg,
        betSize: Math.round(betSize * 100) / 100,
        confidence,
        reasoning,
        tags,
        extraAdvice
    };
}
