/**
 * Texas Hold'em Poker Probability Engine
 * 核心牌型评估与概率计算引擎
 */

// ============ 基础定义 ============
const SUITS = ['♠', '♥', '♣', '♦'];
const SUIT_NAMES = { '♠': 'spade', '♥': 'heart', '♣': 'club', '♦': 'diamond' };
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// 点数数值化: 2=0, 3=1, ..., A=12
function rankValue(rank) {
    return RANKS.indexOf(rank);
}

// 牌型名称（从弱到强）——通过 i18n 获取，保留回退
const HAND_NAMES_FALLBACK = {
    0: '高牌',
    1: '一对',
    2: '两对',
    3: '三条',
    4: '顺子',
    5: '同花',
    6: '葫芦',
    7: '四条',
    8: '同花顺',
    9: '皇家同花顺'
};

function getHandName(rank) {
    if (typeof t === 'function') {
        return t('handNames.' + rank) || HAND_NAMES_FALLBACK[rank];
    }
    return HAND_NAMES_FALLBACK[rank];
}

// 保留兼容：HAND_NAMES[rank] 仍然可用
const HAND_NAMES = new Proxy(HAND_NAMES_FALLBACK, {
    get(target, prop) {
        if (typeof t === 'function') {
            return t('handNames.' + prop) || target[prop];
        }
        return target[prop];
    }
});

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.value = rankValue(rank);
    }

    toString() {
        return this.suit + this.rank;
    }

    static fromString(str) {
        const suit = str[0];
        const rank = str.slice(1);
        return new Card(suit, rank);
    }
}

// ============ 牌型评估核心 ============

function evaluate5Cards(cards) {
    cards.sort((a, b) => b.value - a.value);
    
    const values = cards.map(c => c.value);
    const suits = cards.map(c => c.suit);
    
    const freq = {};
    values.forEach(v => freq[v] = (freq[v] || 0) + 1);
    
    const isFlush = suits.every(s => s === suits[0]);
    
    let isStraight = true;
    for (let i = 1; i < 5; i++) {
        if (values[i] !== values[0] - i) {
            isStraight = false;
            break;
        }
    }
    
    let isWheel = false;
    if (values[0] === 12 && values[1] === 3 && values[2] === 2 && values[3] === 1 && values[4] === 0) {
        isWheel = true;
        isStraight = true;
    }
    
    if (isFlush && isStraight) {
        if (isWheel) {
            return { handRank: 8, kickers: [3], isRoyal: false };
        }
        if (values[0] === 12) {
            return { handRank: 9, kickers: [12], isRoyal: true };
        }
        return { handRank: 8, kickers: [values[0]], isRoyal: false };
    }
    
    const fourOfAKind = Object.entries(freq).find(([k, v]) => v === 4);
    if (fourOfAKind) {
        const quadVal = parseInt(fourOfAKind[0]);
        const kicker = values.find(v => v !== quadVal);
        return { handRank: 7, kickers: [quadVal, kicker] };
    }
    
    const threeOfAKind = Object.entries(freq).find(([k, v]) => v === 3);
    const pair = Object.entries(freq).find(([k, v]) => v === 2);
    if (threeOfAKind && pair) {
        return { handRank: 6, kickers: [parseInt(threeOfAKind[0]), parseInt(pair[0])] };
    }
    
    if (isFlush) {
        return { handRank: 5, kickers: [...values] };
    }
    
    if (isStraight) {
        const highCard = isWheel ? 3 : values[0];
        return { handRank: 4, kickers: [highCard] };
    }
    
    if (threeOfAKind) {
        const tripVal = parseInt(threeOfAKind[0]);
        const kickers = values.filter(v => v !== tripVal);
        return { handRank: 3, kickers: [tripVal, ...kickers.slice(0, 2)] };
    }
    
    const pairs = Object.entries(freq).filter(([k, v]) => v === 2).map(([k, v]) => parseInt(k)).sort((a, b) => b - a);
    if (pairs.length === 2) {
        const kicker = values.find(v => v !== pairs[0] && v !== pairs[1]);
        return { handRank: 2, kickers: [pairs[0], pairs[1], kicker] };
    }
    
    if (pairs.length === 1) {
        const pairVal = pairs[0];
        const kickers = values.filter(v => v !== pairVal);
        return { handRank: 1, kickers: [pairVal, ...kickers.slice(0, 3)] };
    }
    
    return { handRank: 0, kickers: [...values] };
}

function compareHands(a, b) {
    if (a.handRank !== b.handRank) {
        return a.handRank > b.handRank ? 1 : -1;
    }
    for (let i = 0; i < a.kickers.length; i++) {
        if (a.kickers[i] !== b.kickers[i]) {
            return a.kickers[i] > b.kickers[i] ? 1 : -1;
        }
    }
    return 0;
}

function evaluate7Cards(cards) {
    let bestHand = null;
    
    for (let i = 0; i < 7; i++) {
        for (let j = i + 1; j < 7; j++) {
            const fiveCards = [];
            for (let k = 0; k < 7; k++) {
                if (k !== i && k !== j) {
                    fiveCards.push(cards[k]);
                }
            }
            const result = evaluate5Cards(fiveCards);
            if (!bestHand || compareHands(result, bestHand) > 0) {
                bestHand = result;
            }
        }
    }
    
    return bestHand;
}

// ============ 牌堆与概率计算 ============

function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(new Card(suit, rank));
        }
    }
    return deck;
}

function removeCards(deck, cardsToRemove) {
    const removeSet = new Set(cardsToRemove.map(c => c.toString()));
    return deck.filter(c => !removeSet.has(c.toString()));
}

function calculateExactProbabilities(holeCards, communityCards) {
    const knownCards = [...holeCards, ...communityCards];
    const deck = removeCards(createDeck(), knownCards);
    const remainingToDraw = 5 - communityCards.length;
    
    const counts = {};
    let total = 0;
    
    const combinations = getCombinations(deck, remainingToDraw);
    
    for (const extraCards of combinations) {
        const allCards = [...holeCards, ...communityCards, ...extraCards];
        const result = evaluate7Cards(allCards);
        counts[result.handRank] = (counts[result.handRank] || 0) + 1;
        total++;
    }
    
    return { counts, total, exact: true };
}

function calculateMonteCarloProbabilities(holeCards, communityCards, iterations = 100000) {
    const knownCards = [...holeCards, ...communityCards];
    const deck = removeCards(createDeck(), knownCards);
    const remainingToDraw = 5 - communityCards.length;
    
    const counts = {};
    
    for (let i = 0; i < iterations; i++) {
        const shuffled = [...deck];
        for (let j = shuffled.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        const extraCards = shuffled.slice(0, remainingToDraw);
        const allCards = [...holeCards, ...communityCards, ...extraCards];
        const result = evaluate7Cards(allCards);
        counts[result.handRank] = (counts[result.handRank] || 0) + 1;
    }
    
    return { counts, total: iterations, exact: false };
}

function calculateProbabilities(holeCards, communityCards) {
    const remainingToDraw = 5 - communityCards.length;
    let result;
    
    const deckSize = 52 - holeCards.length - communityCards.length;
    let comboCount = 1;
    if (remainingToDraw > 0) {
        comboCount = combinations(deckSize, remainingToDraw);
    }
    
    if (comboCount <= 2000000) {
        result = calculateExactProbabilities(holeCards, communityCards);
    } else {
        result = calculateMonteCarloProbabilities(holeCards, communityCards, 200000);
    }
    
    const probabilities = [];
    const topHandRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (const rank of topHandRanks) {
        const count = result.counts[rank] || 0;
        const prob = result.total > 0 ? (count / result.total * 100) : 0;
        probabilities.push({
            handRank: rank,
            name: HAND_NAMES[rank],
            count: count,
            probability: prob,
            total: result.total
        });
    }
    
    probabilities.sort((a, b) => b.probability - a.probability);
    
    return {
        exact: result.exact,
        total: result.total,
        handCount: result.counts,
        top7: probabilities.slice(0, 7)
    };
}

function combinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 0; i < k; i++) {
        res = res * (n - i) / (i + 1);
    }
    return Math.round(res);
}

function getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length < k) return [];
    if (arr.length === k) return [[...arr]];
    if (k === 1) return arr.map(e => [e]);
    
    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
        const first = arr[i];
        const rest = arr.slice(i + 1);
        const subCombos = getCombinations(rest, k - 1);
        for (const combo of subCombos) {
            result.push([first, ...combo]);
        }
    }
    return result;
}

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

// ============ 13×13 翻前手牌矩阵 ============

/**
 * 翻前矩阵位置定义
 */
const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const POSITION_NAMES_FALLBACK = {
    'UTG': '枪口位 (Under the Gun)',
    'MP': '中间位 (Middle Position)',
    'CO': '关煞位 (Cut Off)',
    'BTN': '按钮位 (Button)',
    'SB': '小盲位 (Small Blind)',
    'BB': '大盲位 (Big Blind)'
};

function getPositionName(pos) {
    if (typeof t === 'function') {
        return t('position.' + pos) || POSITION_NAMES_FALLBACK[pos] || pos;
    }
    return POSITION_NAMES_FALLBACK[pos] || pos;
}

const POSITION_NAMES = new Proxy(POSITION_NAMES_FALLBACK, {
    get(target, prop) {
        return getPositionName(prop);
    }
});

// 手牌类型标识
// s = 同花 (suited), o = 不同花 (off-suit), p = 对子 (pair)
// action: R=Raise, C=Call, F=Fold, 3=3-bet, L=Limp

const PREFLOP_MATRIX = {
    'UTG': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'QJs': 'R', 'QTs': 'R', 'JTs': 'R', 'T9s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'KQo': 'R',
        'A7s': 'C', 'A6s': 'C', 'A5s': 'C', 'K9s': 'C', 'Q9s': 'C', 'J9s': 'C', 'T8s': 'C', '98s': 'C',
        'ATo': 'C', 'KJo': 'C', 'KTo': 'C', 'QJo': 'C',
        'A4s': 'F', 'A3s': 'F', 'A2s': 'F', 'K8s': 'F', 'K7s': 'F', 'Q8s': 'F', 'J8s': 'F', 'T7s': 'F',
        '97s': 'F', '87s': 'F', '76s': 'F', '65s': 'F', '54s': 'F',
        'A9o': 'F', 'A8o': 'F', 'A7o': 'F', 'A6o': 'F', 'A5o': 'F', 'A4o': 'F', 'A3o': 'F', 'A2o': 'F',
        'K9o': 'F', 'K8o': 'F', 'Q9o': 'F', 'Q8o': 'F', 'J9o': 'F', 'J8o': 'F', 'T9o': 'F', 'T8o': 'F',
        '98o': 'F', '97o': 'F', '87o': 'F', '86o': 'F', '76o': 'F', '75o': 'F', '65o': 'F', '64o': 'F',
        '54o': 'F', '53o': 'F', '43o': 'F', '42o': 'F', '32o': 'F'
    },
    'MP': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R', '77': 'R', '66': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R', 'A7s': 'R', 'A6s': 'R', 'A5s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'K9s': 'R', 'QJs': 'R', 'QTs': 'R', 'Q9s': 'R', 'JTs': 'R', 'J9s': 'R', 'T9s': 'R', 'T8s': 'R', '98s': 'R', '87s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'ATo': 'R', 'KQo': 'R', 'KJo': 'R', 'KTo': 'R', 'QJo': 'R',
        'A4s': 'C', 'A3s': 'C', 'A2s': 'C', 'K8s': 'C', 'K7s': 'C', 'Q8s': 'C', 'J8s': 'C', 'T7s': 'C', '97s': 'C', '76s': 'C', '65s': 'C',
        'K9o': 'C', 'Q9o': 'C', 'J9o': 'C', 'T9o': 'C',
        'A9o': 'F', 'A8o': 'F', 'A7o': 'F', 'A6o': 'F', 'A5o': 'F', 'A4o': 'F', 'A3o': 'F', 'A2o': 'F',
        'K8o': 'F', 'Q8o': 'F', 'J8o': 'F', 'T8o': 'F', '98o': 'F', '97o': 'F', '87o': 'F', '86o': 'F',
        '76o': 'F', '75o': 'F', '65o': 'F', '64o': 'F', '54o': 'F', '53o': 'F', '43o': 'F', '42o': 'F', '32o': 'F'
    },
    'CO': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R', '77': 'R', '66': 'R', '55': 'R', '44': 'R', '33': 'R', '22': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R', 'A7s': 'R', 'A6s': 'R', 'A5s': 'R', 'A4s': 'R', 'A3s': 'R', 'A2s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'K9s': 'R', 'K8s': 'R', 'K7s': 'R', 'K6s': 'R', 'K5s': 'R', 'K4s': 'R',
        'QJs': 'R', 'QTs': 'R', 'Q9s': 'R', 'Q8s': 'R', 'Q7s': 'R', 'Q6s': 'R',
        'JTs': 'R', 'J9s': 'R', 'J8s': 'R', 'J7s': 'R',
        'T9s': 'R', 'T8s': 'R', 'T7s': 'R', '98s': 'R', '97s': 'R', '87s': 'R', '76s': 'R', '65s': 'R', '54s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'ATo': 'R', 'A9o': 'R', 'A8o': 'R', 'KQo': 'R', 'KJo': 'R', 'KTo': 'R', 'K9o': 'R', 'QJo': 'R', 'QTo': 'R', 'JTo': 'R', 'T9o': 'R',
        'A7o': 'C', 'A6o': 'C', 'A5o': 'C', 'K8o': 'C', 'Q9o': 'C', 'J9o': 'C', 'T8o': 'C', '98o': 'C', '87o': 'C',
        'A4o': 'F', 'A3o': 'F', 'A2o': 'F', 'K7o': 'F', 'K6o': 'F', 'Q8o': 'F', 'J8o': 'F', 'T7o': 'F', '97o': 'F', '86o': 'F', '76o': 'F', '75o': 'F', '65o': 'F', '64o': 'F', '54o': 'F', '53o': 'F', '43o': 'F', '42o': 'F', '32o': 'F'
    },
    'BTN': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R', '77': 'R', '66': 'R', '55': 'R', '44': 'R', '33': 'R', '22': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R', 'A7s': 'R', 'A6s': 'R', 'A5s': 'R', 'A4s': 'R', 'A3s': 'R', 'A2s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'K9s': 'R', 'K8s': 'R', 'K7s': 'R', 'K6s': 'R', 'K5s': 'R', 'K4s': 'R', 'K3s': 'R', 'K2s': 'R',
        'QJs': 'R', 'QTs': 'R', 'Q9s': 'R', 'Q8s': 'R', 'Q7s': 'R', 'Q6s': 'R', 'Q5s': 'R', 'Q4s': 'R', 'Q3s': 'R', 'Q2s': 'R',
        'JTs': 'R', 'J9s': 'R', 'J8s': 'R', 'J7s': 'R', 'J6s': 'R', 'J5s': 'R', 'J4s': 'R',
        'T9s': 'R', 'T8s': 'R', 'T7s': 'R', 'T6s': 'R', 'T5s': 'R',
        '98s': 'R', '97s': 'R', '96s': 'R', '95s': 'R',
        '87s': 'R', '86s': 'R', '85s': 'R',
        '76s': 'R', '75s': 'R', '74s': 'R',
        '65s': 'R', '64s': 'R', '63s': 'R',
        '54s': 'R', '53s': 'R', '52s': 'R',
        '43s': 'R', '42s': 'R',
        '32s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'ATo': 'R', 'A9o': 'R', 'A8o': 'R', 'A7o': 'R', 'A6o': 'R', 'A5o': 'R', 'A4o': 'R', 'A3o': 'R', 'A2o': 'R',
        'KQo': 'R', 'KJo': 'R', 'KTo': 'R', 'K9o': 'R', 'K8o': 'R', 'K7o': 'R', 'K6o': 'R', 'K5o': 'R', 'K4o': 'R', 'K3o': 'R', 'K2o': 'R',
        'QJo': 'R', 'QTo': 'R', 'Q9o': 'R', 'Q8o': 'R', 'Q7o': 'R', 'Q6o': 'R', 'Q5o': 'R', 'Q4o': 'R', 'Q3o': 'R',
        'JTo': 'R', 'J9o': 'R', 'J8o': 'R', 'J7o': 'R', 'J6o': 'R',
        'T9o': 'R', 'T8o': 'R', 'T7o': 'R', 'T6o': 'R',
        '98o': 'R', '97o': 'R', '96o': 'R',
        '87o': 'R', '86o': 'R', '85o': 'R',
        '76o': 'R', '75o': 'R', '74o': 'R',
        '65o': 'R', '64o': 'R', '63o': 'R',
        '54o': 'R', '53o': 'R', '52o': 'R',
        '43o': 'R', '42o': 'R',
        '32o': 'C'
    },
    'SB': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R', '77': 'R', '66': 'R', '55': 'R', '44': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R', 'A7s': 'R', 'A6s': 'R', 'A5s': 'R', 'A4s': 'R', 'A3s': 'R', 'A2s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'K9s': 'R', 'K8s': 'R', 'K7s': 'R', 'K6s': 'R', 'K5s': 'R', 'K4s': 'R',
        'QJs': 'R', 'QTs': 'R', 'Q9s': 'R', 'Q8s': 'R', 'Q7s': 'R', 'Q6s': 'R',
        'JTs': 'R', 'J9s': 'R', 'J8s': 'R', 'J7s': 'R',
        'T9s': 'R', 'T8s': 'R', 'T7s': 'R', '98s': 'R', '97s': 'R', '87s': 'R', '76s': 'R', '65s': 'R', '54s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'ATo': 'R', 'A9o': 'R', 'A8o': 'R', 'A7o': 'R', 'KQo': 'R', 'KJo': 'R', 'KTo': 'R', 'K9o': 'R', 'QJo': 'R', 'QTo': 'R', 'JTo': 'R', 'T9o': 'R',
        'A6o': 'C', 'A5o': 'C', 'A4o': 'C', 'K8o': 'C', 'Q9o': 'C', 'J9o': 'C', 'T8o': 'C', '98o': 'C', '87o': 'C', '76o': 'C', '65o': 'C',
        'A3o': 'F', 'A2o': 'F', 'K7o': 'F', 'K6o': 'F', 'Q8o': 'F', 'J8o': 'F', 'T7o': 'F', '97o': 'F', '86o': 'F', '75o': 'F', '64o': 'F', '54o': 'F', '53o': 'F', '43o': 'F', '42o': 'F', '32o': 'F'
    },
    'BB': {
        'AA': 'R', 'KK': 'R', 'QQ': 'R', 'JJ': 'R', 'TT': 'R', '99': 'R', '88': 'R', '77': 'R', '66': 'R', '55': 'R', '44': 'R', '33': 'R', '22': 'R',
        'AKs': 'R', 'AQs': 'R', 'AJs': 'R', 'ATs': 'R', 'A9s': 'R', 'A8s': 'R', 'A7s': 'R', 'A6s': 'R', 'A5s': 'R', 'A4s': 'R', 'A3s': 'R', 'A2s': 'R',
        'KQs': 'R', 'KJs': 'R', 'KTs': 'R', 'K9s': 'R', 'K8s': 'R', 'K7s': 'R', 'K6s': 'R', 'K5s': 'R', 'K4s': 'R', 'K3s': 'R', 'K2s': 'R',
        'QJs': 'R', 'QTs': 'R', 'Q9s': 'R', 'Q8s': 'R', 'Q7s': 'R', 'Q6s': 'R', 'Q5s': 'R', 'Q4s': 'R', 'Q3s': 'R', 'Q2s': 'R',
        'JTs': 'R', 'J9s': 'R', 'J8s': 'R', 'J7s': 'R', 'J6s': 'R', 'J5s': 'R', 'J4s': 'R', 'J3s': 'R', 'J2s': 'R',
        'T9s': 'R', 'T8s': 'R', 'T7s': 'R', 'T6s': 'R', 'T5s': 'R', 'T4s': 'R', 'T3s': 'R', 'T2s': 'R',
        '98s': 'R', '97s': 'R', '96s': 'R', '95s': 'R', '94s': 'R', '93s': 'R', '92s': 'R',
        '87s': 'R', '86s': 'R', '85s': 'R', '84s': 'R', '83s': 'R', '82s': 'R',
        '76s': 'R', '75s': 'R', '74s': 'R', '73s': 'R', '72s': 'R',
        '65s': 'R', '64s': 'R', '63s': 'R', '62s': 'R',
        '54s': 'R', '53s': 'R', '52s': 'R',
        '43s': 'R', '42s': 'R',
        '32s': 'R',
        'AKo': 'R', 'AQo': 'R', 'AJo': 'R', 'ATo': 'R', 'A9o': 'R', 'A8o': 'R', 'A7o': 'R', 'A6o': 'R', 'A5o': 'R', 'A4o': 'R', 'A3o': 'R', 'A2o': 'R',
        'KQo': 'R', 'KJo': 'R', 'KTo': 'R', 'K9o': 'R', 'K8o': 'R', 'K7o': 'R', 'K6o': 'R', 'K5o': 'R', 'K4o': 'R', 'K3o': 'R', 'K2o': 'R',
        'QJo': 'R', 'QTo': 'R', 'Q9o': 'R', 'Q8o': 'R', 'Q7o': 'R', 'Q6o': 'R', 'Q5o': 'R', 'Q4o': 'R', 'Q3o': 'R', 'Q2o': 'R',
        'JTo': 'R', 'J9o': 'R', 'J8o': 'R', 'J7o': 'R', 'J6o': 'R', 'J5o': 'R', 'J4o': 'R', 'J3o': 'R', 'J2o': 'R',
        'T9o': 'R', 'T8o': 'R', 'T7o': 'R', 'T6o': 'R', 'T5o': 'R', 'T4o': 'R', 'T3o': 'R', 'T2o': 'R',
        '98o': 'R', '97o': 'R', '96o': 'R', '95o': 'R', '94o': 'R', '93o': 'R', '92o': 'R',
        '87o': 'R', '86o': 'R', '85o': 'R', '84o': 'R', '83o': 'R', '82o': 'R',
        '76o': 'R', '75o': 'R', '74o': 'R', '73o': 'R', '72o': 'R',
        '65o': 'R', '64o': 'R', '63o': 'R', '62o': 'R',
        '54o': 'R', '53o': 'R', '52o': 'R',
        '43o': 'R', '42o': 'R',
        '32o': 'R'
    }
};

// 行动含义——通过 i18n 获取
function getActionMeaning(action) {
    if (typeof t !== 'function') {
        const fallback = {
            'R': { text: '加注 (Raise)', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', desc: '主动加注，建立底池或获取价值' },
            'C': { text: '跟注 (Call)', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', desc: '跟注看翻牌，控制投入' },
            'F': { text: '弃牌 (Fold)', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', desc: '手牌太弱，不值得投入' },
            '3': { text: '3-bet', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', desc: '再加注，对抗对方加注' },
            'L': { text: '溜入 (Limp)', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', desc: '只跟注大盲，不主动加注' }
        };
        return fallback[action] || fallback['F'];
    }
    return {
        text: t('action.' + action),
        color: ['R','3'].includes(action) ? '#22c55e' : action === 'C' ? '#3b82f6' : action === 'L' ? '#f59e0b' : '#ef4444',
        bg: ['R','3'].includes(action) ? 'rgba(34,197,94,0.15)' : action === 'C' ? 'rgba(59,130,246,0.12)' : action === 'L' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)',
        desc: t('action.desc.' + action)
    };
}

const ACTION_MEANINGS = new Proxy({}, {
    get(target, prop) {
        return getActionMeaning(prop);
    }
});

const RANKS_MATRIX = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * 获取指定位置的翻前矩阵数据
 * @param {string} position - 位置: UTG/MP/CO/BTN/SB/BB
 * @returns {Object} {matrix, positionName}
 */
function getPreflopMatrix(position) {
    const data = PREFLOP_MATRIX[position] || PREFLOP_MATRIX['UTG'];
    const matrix = [];
    
    for (let i = 0; i < 13; i++) {
        const row = [];
        for (let j = 0; j < 13; j++) {
            let handKey;
            if (i === j) {
                // 对子
                handKey = RANKS_MATRIX[i] + RANKS_MATRIX[j];
            } else if (i < j) {
                // 同花 (上方三角形)
                handKey = RANKS_MATRIX[i] + RANKS_MATRIX[j] + 's';
            } else {
                // 不同花 (下方三角形)
                handKey = RANKS_MATRIX[j] + RANKS_MATRIX[i] + 'o';
            }
            
            const action = data[handKey] || 'F';
            row.push({
                hand: handKey,
                action: action,
                ...ACTION_MEANINGS[action]
            });
        }
        matrix.push(row);
    }
    
    return {
        matrix,
        positionName: POSITION_NAMES[position] || position
    };
}

/**
 * 获取指定手牌在所有位置的建议
 * @param {string} hand - 手牌如 "AA", "AKs", "AKo"
 * @returns {Array} 各位置建议
 */
function getHandAdviceAllPositions(hand) {
    return POSITIONS.map(pos => {
        const data = PREFLOP_MATRIX[pos];
        const action = data[hand] || 'F';
        return {
            position: pos,
            positionName: POSITION_NAMES[pos],
            action,
            ...ACTION_MEANINGS[action]
        };
    });
}

// ============ AI 教练知识库（中英双语）============

const AI_COACH_KNOWLEDGE = [
    {
        keywords: ['资金', 'bankroll', 'brm', '买入', 'buyin', '降级', '升级'],
        response: {zh: '资金管理是德州扑克的生存基础。Cash Game建议保持20-50个买入。如果资金<20买入，建议降级；<10买入必须降级。使用本应用的「资金管理建议」模块，输入你的资金和买入额，可以获得自动评估。',
                   en: 'Bankroll management is the foundation of Texas Hold\'em survival. For Cash Games, maintain 20-50 buy-ins. If you have <20 buy-ins, consider moving down; <10 buy-ins, you must move down. Use the Bankroll Management module in this app for automatic assessment.'}
    },
    {
        keywords: ['kelly', '凯利', '下注比例', '下注', 'bet size'],
        response: {zh: 'Kelly公式帮你计算最优下注比例：f* = (bp - q) / b。但实战中建议用「半凯利」(Half Kelly)，即Kelly结果的一半。这样虽然长期收益降低，但大幅降低破产风险。资金紧张时甚至用四分之一凯利。',
                   en: 'The Kelly Criterion calculates optimal bet sizing: f* = (bp - q) / b. In practice, use Half Kelly (half of the Kelly result). This reduces long-term returns but significantly lowers risk of ruin. When funds are tight, even Quarter Kelly is advisable.'}
    },
    {
        keywords: ['破产', 'risk of ruin', 'ror', '输光', '破产风险'],
        response: {zh: '破产风险(Risk of Ruin) = ((1-edge)/(1+edge))^buyIns。edge是你的优势边缘（胜率-败率）。买入越多、edge越大，破产风险越低。如果只有10个买入，即使edge=5%，破产风险也有约25%！所以保持充足资金是首要任务。',
                   en: 'Risk of Ruin = ((1-edge)/(1+edge))^buyIns. Edge is your advantage (win rate - loss rate). More buy-ins and higher edge means lower risk. With only 10 buy-ins, even a 5% edge gives about 25% risk of ruin! Maintaining adequate bankroll is priority one.'}
    },
    {
        keywords: ['ev', '期望值', 'expected value', '正ev', '负ev'],
        response: {zh: 'EV = (Equity × 赢) - ((1-Equity) × 输)。正EV意味着长期盈利，负EV意味着长期亏损。注意：单次结果可能偏离EV，但样本足够大时结果趋近期望值。在资金管理模块输入你的数据，可以计算当前决策的EV。',
                   en: 'EV = (Equity × Win) - ((1-Equity) × Loss). Positive EV means long-term profit; negative EV means long-term loss. Note: single results may deviate from EV, but with large samples results converge to expectation. Enter your data in the Bankroll Management module to calculate current EV.'}
    },
    {
        keywords: ['位置', 'position', 'btn', 'button', '枪口', 'utg', '盲注', 'blind'],
        response: {zh: '位置是德州扑克最重要的概念之一。越靠后的位置信息优势越大：BTN（按钮位）可以最后行动，看到所有人的决策后再做决定；UTG（枪口位）最先行动，需要最紧的范围。翻前矩阵里每个位置的范围都不同，建议先从按钮位学起，再扩展到其他位置。',
                   en: 'Position is one of the most important concepts in Texas Hold\'em. The later your position, the greater your informational advantage: BTN (Button) acts last, seeing all decisions before yours; UTG (Under the Gun) acts first and needs the tightest range. Each position has different ranges in the preflop matrix. Start learning from the Button (widest range) and expand to other positions.'}
    },
    {
        keywords: ['起手牌', '开始牌', '翻前', 'preflop', '范围', 'range', '矩阵', 'matrix'],
        response: {zh: '翻前起手牌范围是区分盈利玩家和亏损玩家的关键。13×13矩阵展示了169种起手牌在不同位置的建议：绿色=加注，黄色=跟注，红色=弃牌。严格遵循范围比凭感觉打牌强得多。建议从按钮位最宽的范围开始记忆，再逐步扩展到其他位置。',
                   en: 'Preflop starting hand ranges are what separate winning players from losing ones. The 13×13 matrix shows recommendations for 169 starting hands by position: Green=Raise, Yellow=Call, Red=Fold. Strictly following ranges is far better than playing by feel. Memorize the widest range (Button) first, then expand to other positions.'}
    },
    {
        keywords: ['aa', 'kk', 'qq', 'jj', 'tt', '口袋', '对子', 'pair'],
        response: {zh: '口袋对子（Pocket Pair）在翻前是强牌。AA和KK永远加注，QQ和JJ通常也加注。中小对子（22-77）在有利位置可以跟注看翻牌，希望中三条（Set）。注意：翻后如果没能中三条，通常不要继续投入太多。',
                   en: 'Pocket pairs are strong preflop hands. Always raise with AA and KK; QQ and JJ should also usually be raised. Small-to-medium pairs (22-77) can be called from favorable positions to see the flop, hoping to hit a set. Note: if you don\'t hit a set postflop, usually don\'t continue investing too much.'}
    },
    {
        keywords: ['ak', 'aq', 'aj', 'at', 'kq', 'kj', 'broadway', '大牌'],
        response: {zh: 'Broadway牌（两张T以上的牌）通常翻前 playable。AK是同花+顺子双重听牌潜力，是最强的非对子起手牌。AQo、AJo在有利位置可以玩，但注意在不利位置要适当收紧。同花版本（s）比不同花版本（o）更有价值。',
                   en: 'Broadway cards (two cards T or higher) are generally playable preflop. AK has both flush and straight draw potential, making it the strongest non-pair starting hand. AQo and AJo can be played from favorable positions, but tighten up in unfavorable positions. Suited versions (s) are more valuable than offsuit (o).'}
    },
    {
        keywords: ['同花', 'flush', '顺子', 'straight', '听牌', 'draw', 'outs'],
        response: {zh: '听牌是德州扑克的核心概念。翻后如果你有4张同花或4张顺子，叫「听牌」(Draw)。计算outs（出牌数）：同花听牌通常有9个outs，两端顺子听牌有8个outs。使用2-4法则估算：翻牌圈概率 ≈ outs × 4%，转牌圈概率 ≈ outs × 2%。如果赔率大于概率，数学上跟注正确。',
                   en: 'Draws are a core concept in Texas Hold\'em. Postflop, having 4 cards to a flush or straight is called a "draw." Count outs: flush draws usually have 9 outs, open-ended straight draws have 8 outs. Use the 2-4 rule: flop probability ≈ outs × 4%, turn probability ≈ outs × 2%. If pot odds exceed probability, calling is mathematically correct.'}
    },
    {
        keywords: ['赔率', 'pot odds', '底池', '赔率', '隐含赔率', 'implied odds'],
        response: {zh: '底池赔率 = 需跟注金额 / (底池 + 需跟注金额)。如果赔率 < 你的胜率，跟注是正EV的。隐含赔率则考虑如果击中了你还能从对手身上赢多少。例如，手持小对子中三条后，如果对手有强牌，你可能赢一个大底池。',
                   en: 'Pot odds = Amount to call / (Pot + Amount to call). If odds < your equity, calling is +EV. Implied odds consider how much more you can win from opponents if you hit. For example, hitting a set with a small pocket pair against a strong hand could win a large pot.'}
    },
    {
        keywords: ['bluff', '诈唬', '偷鸡', '诈唬频率'],
        response: {zh: '诈唬是德州扑克不可分割的一部分。数学上，如果你的下注是底池的1/2，你只需要有33%的诈唬频率就能让对手跟注无利可图。但注意：只在合适的场景诈唬——有位置优势、有对手读、有牌面结构。不要在多人底池频繁诈唬。',
                   en: 'Bluffing is an integral part of Texas Hold\'em. Mathematically, if your bet is 1/2 pot, you only need 33% bluff frequency to make opponent\'s calls unprofitable. But bluff only in suitable spots: position advantage, opponent reads, and board texture. Don\'t bluff frequently in multiway pots.'}
    },
    {
        keywords: ['tilt', '上头', '情绪', '控制情绪', '情绪管理'],
        response: {zh: 'Tilt（情绪失控）是德州扑克最大的敌人。输钱后想「赢回来」是人之常情，但在情绪下决策质量会严重下降。建议：设定止损线（如5个买入），达到后立即离场；短休息、喝水、深呼吸；记住：好决策和坏结果可以同时发生。',
                   en: 'Tilt (emotional loss of control) is the biggest enemy in poker. Wanting to "win it back" after losing is natural, but decision quality severely drops under emotion. Tips: Set a stop-loss (e.g., 5 buy-ins), leave immediately when reached; take short breaks, hydrate, deep breaths; remember: good decisions and bad results can happen simultaneously.'}
    },
    {
        keywords: ['hello', 'hi', '你好', '在吗', '开始', '帮助', 'help'],
        response: {zh: '你好！我是你的德州扑克学习助手。我可以帮你：\n1. 理解资金管理（Kelly、BRM、RoR）\n2. 学习翻前起手牌范围\n3. 解释核心扑克概念（位置、赔率、听牌）\n4. 提供策略建议\n\n你可以问任何关于德州扑克的问题！',
                   en: 'Hi! I\'m your Texas Hold\'em learning assistant. I can help you:\n1. Understand bankroll management (Kelly, BRM, RoR)\n2. Learn preflop starting hand ranges\n3. Explain core poker concepts (position, odds, draws)\n4. Provide strategy advice\n\nAsk me anything about Texas Hold\'em!'}
    }
];

/**
 * AI 教练回复
 * @param {string} userInput - 用户输入
 * @returns {string} AI回复
 */
function getAICoachResponse(userInput) {
    if (!userInput || userInput.trim().length === 0) {
        return t('alert.emptyInput');
    }
    
    const input = userInput.toLowerCase().trim();
    const lang = getCurrentLang();
    
    // 匹配关键词
    for (const item of AI_COACH_KNOWLEDGE) {
        for (const keyword of item.keywords) {
            if (input.includes(keyword.toLowerCase())) {
                const resp = item.response;
                return (typeof resp === 'object' && resp[lang]) ? resp[lang] : (resp.zh || resp.en || resp);
            }
        }
    }
    
    // 默认回复
    const defaultResponses = {
        zh: [
            '这是个好问题！我可以帮你解答资金管理、翻前策略、赔率计算等。你具体想了解哪个方面？',
            '建议你先看看翻前矩阵模块，了解不同位置应该玩什么牌。然后再用胜率计算器实战练习。',
            '如果你想提高实战决策能力，可以：1）严格遵循翻前范围 2）用资金管理模块控制投入 3）多复盘每手牌。有什么具体想深入的吗？'
        ],
        en: [
            'Great question! I can help with bankroll management, preflop strategy, odds calculation, etc. What specifically would you like to know?',
            'Start with the preflop matrix to learn what hands to play in each position. Then practice with the equity calculator.',
            'To improve your game: 1) Strictly follow preflop ranges 2) Use the bankroll module to control investment 3) Review every hand. Anything specific you want to dive deeper into?'
        ]
    };
    
    const responses = defaultResponses[lang] || defaultResponses.zh;
    return responses[Math.floor(Math.random() * responses.length)];
}

// ============ 短筹码全压决策引擎（Short-Stack Push/Fold Engine）============

// 对手范围预设（Top % 范围）
const OPPONENT_RANGE_PRESETS = {
    'tight': {
        name: '紧手 (Top 10%)',
        hands: ['AA','KK','QQ','JJ','TT','AKs','AQs','AKo']
    },
    'standard': {
        name: '标准 (Top 20%)',
        hands: ['AA','KK','QQ','JJ','TT','99','88','77','66',
                'AKs','AQs','AJs','ATs','A9s','KQs','KJs','KTs','QJs','QTs','JTs',
                'AKo','AQo','AJo','ATo','KQo','KJo']
    },
    'loose': {
        name: '松手 (Top 30%)',
        hands: ['AA','KK','QQ','JJ','TT','99','88','77','66','55',
                'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','KQs','KJs','KTs','K9s','QJs','QTs','QTs','JTs','T9s',
                'AKo','AQo','AJo','ATo','A9o','KQo','KJo','KTo','QJo']
    },
    'crazy': {
        name: '疯狂 (Top 50%)',
        hands: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
                'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
                'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','QJs','QTs','Q9s','Q8s','JTs','J9s','T9s','T8s','98s','87s','76s','65s','54s',
                'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
                'KQo','KJo','KTo','K9o','QJo','QTo','JTo','T9o']
    }
};

// 手牌到所有具体组合的映射（用于范围计算）
const HAND_COMBINATIONS = {};

function initHandCombinations() {
    const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    const suits = ['♠','♥','♣','♦'];
    
    for (let i = 0; i < ranks.length; i++) {
        for (let j = i; j < ranks.length; j++) {
            const r1 = ranks[i], r2 = ranks[j];
            if (i === j) {
                // 对子: 6种组合
                const key = r1 + r2;
                const combos = [];
                for (let s1 = 0; s1 < 4; s1++) {
                    for (let s2 = s1 + 1; s2 < 4; s2++) {
                        combos.push([new Card(suits[s1], r1), new Card(suits[s2], r2)]);
                    }
                }
                HAND_COMBINATIONS[key] = combos;
            } else {
                // 同花: 4种组合
                const keySuited = r1 + r2 + 's';
                const combosSuited = [];
                for (const suit of suits) {
                    combosSuited.push([new Card(suit, r1), new Card(suit, r2)]);
                }
                HAND_COMBINATIONS[keySuited] = combosSuited;
                
                // 不同花: 12种组合
                const keyOffsuit = r1 + r2 + 'o';
                const combosOffsuit = [];
                for (let s1 = 0; s1 < 4; s1++) {
                    for (let s2 = 0; s2 < 4; s2++) {
                        if (s1 !== s2) {
                            combosOffsuit.push([new Card(suits[s1], r1), new Card(suits[s2], r2)]);
                        }
                    }
                }
                HAND_COMBINATIONS[keyOffsuit] = combosOffsuit;
            }
        }
    }
}

initHandCombinations();

// 将手牌键标准化（如 'AKs' -> 'AKs', 'KAo' -> 'AKo'）
function normalizeHandKey(handKey) {
    if (handKey.length === 2) return handKey; // 对子
    const r1 = handKey[0], r2 = handKey[1], type = handKey[2];
    const rankOrder = {'A':0,'K':1,'Q':2,'J':3,'T':4,'9':5,'8':6,'7':7,'6':8,'5':9,'4':10,'3':11,'2':12};
    if (rankOrder[r1] <= rankOrder[r2]) {
        return r1 + r2 + type;
    }
    return r2 + r1 + (type === 's' ? 's' : 'o');
}

// Range 类：对手范围建模
class Range {
    constructor(handKeys) {
        this.handKeys = [];
        this.combinations = [];
        for (const key of handKeys) {
            const normKey = normalizeHandKey(key);
            if (HAND_COMBINATIONS[normKey]) {
                this.handKeys.push(normKey);
                this.combinations.push(...HAND_COMBINATIONS[normKey]);
            }
        }
    }
    
    static fromPreset(presetKey) {
        const preset = OPPONENT_RANGE_PRESETS[presetKey];
        return preset ? new Range(preset.hands) : new Range([]);
    }
    
    static fromMatrix(matrix) {
        // matrix: 13x13 布尔数组，true 表示选中
        const hands = [];
        const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
        for (let i = 0; i < 13; i++) {
            for (let j = 0; j < 13; j++) {
                if (matrix[i][j]) {
                    let key;
                    if (i === j) key = ranks[i] + ranks[j];
                    else if (i < j) key = ranks[i] + ranks[j] + 's';
                    else key = ranks[j] + ranks[i] + 'o';
                    hands.push(key);
                }
            }
        }
        return new Range(hands);
    }
    
    getRandomHand() {
        if (this.combinations.length === 0) return null;
        return this.combinations[Math.floor(Math.random() * this.combinations.length)];
    }
    
    getComboCount() {
        return this.combinations.length;
    }
    
    contains(handKey) {
        return this.handKeys.includes(normalizeHandKey(handKey));
    }
}

// 计算手牌 vs 对手范围的 Equity（蒙特卡洛）
function calculateEquityVsRange(holeCards, opponentRange, communityCards = [], numSimulations = 20000) {
    if (holeCards.length !== 2) return 0;
    if (opponentRange.combinations.length === 0) return 1;
    
    const knownCards = [...holeCards, ...communityCards];
    const deck = removeCards(createDeck(), knownCards);
    const remainingToDraw = 5 - communityCards.length;
    
    let wins = 0;
    let ties = 0;
    
    // 过滤掉对手范围中已知的牌
    const availableOpponentCombos = opponentRange.combinations.filter(combo => {
        const comboStr = combo.map(c => c.toString()).join(',');
        const knownStr = knownCards.map(c => c.toString()).join(',');
        return !combo.some(c => knownCards.some(k => k.toString() === c.toString()));
    });
    
    if (availableOpponentCombos.length === 0) return 1;
    
    for (let i = 0; i < numSimulations; i++) {
        // 随机选择对手手牌
        const oppCombo = availableOpponentCombos[Math.floor(Math.random() * availableOpponentCombos.length)];
        
        // 从剩余牌堆中构建 board
        const remainingDeck = removeCards(deck, oppCombo);
        const shuffled = [...remainingDeck];
        for (let j = shuffled.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        
        const board = [...communityCards];
        let idx = 0;
        while (board.length < 5) {
            board.push(shuffled[idx++]);
        }
        
        const myBest = evaluate7Cards([...holeCards, ...board]);
        const oppBest = evaluate7Cards([...oppCombo, ...board]);
        const cmp = compareHands(myBest, oppBest);
        
        if (cmp > 0) wins++;
        else if (cmp === 0) ties++;
    }
    
    return (wins + ties * 0.5) / numSimulations;
}

// 计算手牌 vs 多个对手范围的 Equity
function calculateEquityVsMultipleRanges(holeCards, opponentRanges, communityCards = [], numSimulations = 20000) {
    if (holeCards.length !== 2) return 0;
    if (!opponentRanges || opponentRanges.length === 0) return 1;
    
    const knownCards = [...holeCards, ...communityCards];
    let deck = removeCards(createDeck(), knownCards);
    
    let wins = 0;
    let ties = 0;
    
    for (let i = 0; i < numSimulations; i++) {
        let currentDeck = [...deck];
        const opponentHands = [];
        let valid = true;
        
        for (const range of opponentRanges) {
            const availableCombos = range.combinations.filter(combo => {
                return combo.every(c => !opponentHands.flat().some(oc => oc.toString() === c.toString()))
                    && !knownCards.some(k => k.toString() === c.toString());
            });
            
            if (availableCombos.length === 0) { valid = false; break; }
            
            const oppCombo = availableCombos[Math.floor(Math.random() * availableCombos.length)];
            opponentHands.push(oppCombo);
            currentDeck = removeCards(currentDeck, oppCombo);
        }
        
        if (!valid) continue;
        
        // 补齐公共牌
        const shuffled = [...currentDeck];
        for (let j = shuffled.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }
        
        const board = [...communityCards];
        let idx = 0;
        while (board.length < 5) {
            board.push(shuffled[idx++]);
        }
        
        const myBest = evaluate7Cards([...holeCards, ...board]);
        
        let bestOpp = null;
        for (const oppHand of opponentHands) {
            const oppBest = evaluate7Cards([...oppHand, ...board]);
            if (!bestOpp || compareHands(oppBest, bestOpp) > 0) {
                bestOpp = oppBest;
            }
        }
        
        const cmp = compareHands(myBest, bestOpp);
        if (cmp > 0) wins++;
        else if (cmp === 0) ties++;
    }
    
    return (wins + ties * 0.5) / numSimulations;
}

// 获取手牌的标准化键（如 [A♠, K♥] -> 'AKo'）
function getHandKey(cards) {
    if (cards.length !== 2) return '';
    const r1 = cards[0].rank, r2 = cards[1].rank;
    const rankOrder = {'A':0,'K':1,'Q':2,'J':3,'T':4,'9':5,'8':6,'7':7,'6':8,'5':9,'4':10,'3':11,'2':12};
    
    if (r1 === r2) return r1 + r2;
    
    const isSuited = cards[0].suit === cards[1].suit;
    const type = isSuited ? 's' : 'o';
    
    if (rankOrder[r1] <= rankOrder[r2]) {
        return r1 + r2 + type;
    }
    return r2 + r1 + type;
}

// 短筹码推荐全压范围（基于位置 + 筹码深度，纯 ChipEV 近似）
// 返回: 'P' = 全压(Push), 'F' = 弃牌(Fold), 'M' = 边缘(Marginal)
const SHORT_STACK_RANGES = {
    'UTG': {
        1: ['AA','KK','QQ','JJ','TT','99','88','AKs','AQs','AJs','AKo','AQo'],
        2: ['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','ATs','AKo','AQo','AJo'],
        3: ['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','ATs','A9s','AKo','AQo','AJo','KQs'],
        5: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','KQs','KJs','QJs'],
        7: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','AKo','AQo','AJo','ATo','KQs','KJs','KTs','QJs','QTs','JTs'],
        10: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','AKo','AQo','AJo','ATo','A9o','KQs','KJs','KTs','K9s','QJs','QTs','JTs','T9s'],
        15: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s'],
        20: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','T7s','98s','97s','87s','76s','65s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','KQo','KJo','KTo','QJo','JTo']
    },
    'MP': {
        1: ['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','AKo','AQo','AJo'],
        2: ['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','ATs','AKo','AQo','AJo','KQs'],
        3: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','ATs','A9s','AKo','AQo','AJo','ATo','KQs','KJs'],
        5: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','AKs','AQs','AJs','ATs','A9s','A8s','A7s','AKo','AQo','AJo','ATo','A9o','KQs','KJs','KTs','QJs','QTs','JTs'],
        7: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','AKo','AQo','AJo','ATo','A9o','A8o','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','T9s','T8s'],
        10: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s','87s'],
        15: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','T7s','98s','97s','87s','76s','65s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','QJo','QTo','JTo'],
        20: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','JTs','J9s','J8s','J7s','T9s','T8s','T7s','98s','97s','96s','87s','86s','76s','75s','65s','64s','54s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','KQo','KJo','KTo','K9o','QJo','QTo','JTo','T9o']
    },
    'CO': {
        1: ['AA','KK','QQ','JJ','TT','99','88','77','66','AKs','AQs','AJs','AKo','AQo','AJo','ATo','KQs'],
        2: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','ATs','AKo','AQo','AJo','ATo','KQs','KJs','QJs'],
        3: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','A9o','KQs','KJs','KTs','QJs','QTs','JTs'],
        5: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','AKo','AQo','AJo','ATo','A9o','A8o','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s'],
        7: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','T7s','98s','97s','87s','76s','65s'],
        10: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','QJs','QTs','Q9s','Q8s','Q7s','JTs','J9s','J8s','J7s','T9s','T8s','T7s','T6s','98s','97s','96s','87s','86s','76s','75s','65s','64s','54s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','K9o','QJo','QTo','JTo','T9o'],
        15: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','JTs','J9s','J8s','J7s','J6s','T9s','T8s','T7s','T6s','T5s','98s','97s','96s','95s','87s','86s','85s','76s','75s','74s','65s','64s','63s','54s','53s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','KQo','KJo','KTo','K9o','K8o','QJo','QTo','Q9o','JTo','J9o','T9o','T8o'],
        20: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','T9s','T8s','T7s','T6s','T5s','98s','97s','96s','95s','87s','86s','85s','76s','75s','74s','65s','64s','63s','54s','53s','52s','43s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','QJo','QTo','Q9o','Q8o','JTo','J9o','J8o','T9o','T8o','T7o','98o','87o']
    },
    'BTN': {
        1: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','AKo','AQo','AJo','ATo','KQs','KJs','QJs','JTs'],
        2: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','AKs','AQs','AJs','ATs','AKo','AQo','AJo','ATo','A9o','KQs','KJs','KTs','QJs','QTs','JTs','T9s'],
        3: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','A9o','A8o','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s','87s'],
        5: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','T7s','98s','97s','87s','76s','65s','54s','KQo','KJo','QJo'],
        7: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','QJs','QTs','Q9s','Q8s','Q7s','JTs','J9s','J8s','J7s','T9s','T8s','T7s','T6s','98s','97s','96s','87s','86s','76s','75s','65s','64s','54s','53s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','K9o','QJo','QTo','JTo','T9o'],
        10: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','JTs','J9s','J8s','J7s','J6s','J5s','T9s','T8s','T7s','T6s','T5s','98s','97s','96s','95s','87s','86s','85s','76s','75s','74s','65s','64s','63s','54s','53s','52s','43s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','QJo','QTo','Q9o','JTo','J9o','T9o','T8o','98o','87o'],
        15: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','T9s','T8s','T7s','T6s','T5s','T4s','98s','97s','96s','95s','94s','87s','86s','85s','84s','76s','75s','74s','73s','65s','64s','63s','62s','54s','53s','52s','43s','42s','32s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','QJo','QTo','Q9o','Q8o','Q7o','JTo','J9o','J8o','T9o','T8o','T7o','98o','97o','87o','76o'],
        20: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','T9s','T8s','T7s','T6s','T5s','T4s','T3s','98s','97s','96s','95s','94s','93s','87s','86s','85s','84s','83s','76s','75s','74s','73s','72s','65s','64s','63s','62s','54s','53s','52s','43s','42s','32s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','QJo','QTo','Q9o','Q8o','Q7o','Q6o','JTo','J9o','J8o','J7o','T9o','T8o','T7o','T6o','98o','97o','96o','87o','86o','76o','75o','65o','64o','54o']
    },
    'SB': {
        1: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','AKs','AQs','AJs','AKo','AQo','AJo','ATo','KQs','KJs','QJs','JTs','T9s'],
        2: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','AKs','AQs','AJs','ATs','AKo','AQo','AJo','ATo','A9o','KQs','KJs','KTs','QJs','QTs','JTs','T9s','T8s','98s'],
        3: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','AKs','AQs','AJs','ATs','A9s','A8s','AKo','AQo','AJo','ATo','A9o','A8o','KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','J9s','T9s','T8s','98s','87s','76s'],
        5: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','KQs','KJs','KTs','K9s','K8s','QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','T7s','98s','97s','87s','76s','65s','54s','KQo','KJo','QJo'],
        7: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','QJs','QTs','Q9s','Q8s','Q7s','JTs','J9s','J8s','J7s','T9s','T8s','T7s','T6s','98s','97s','96s','87s','86s','76s','75s','65s','64s','54s','53s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','KQo','KJo','KTo','K9o','QJo','QTo','JTo','T9o'],
        10: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','JTs','J9s','J8s','J7s','J6s','J5s','T9s','T8s','T7s','T6s','T5s','98s','97s','96s','95s','87s','86s','85s','76s','75s','74s','65s','64s','63s','54s','53s','52s','43s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','QJo','QTo','Q9o','JTo','J9o','T9o','T8o','98o','87o'],
        15: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','T9s','T8s','T7s','T6s','T5s','T4s','98s','97s','96s','95s','94s','87s','86s','85s','84s','76s','75s','74s','73s','72s','65s','64s','63s','62s','54s','53s','52s','43s','42s','32s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','QJo','QTo','Q9o','Q8o','Q7o','JTo','J9o','J8o','T9o','T8o','T7o','98o','97o','87o','76o'],
        20: ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22','AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s','KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s','QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s','JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','T9s','T8s','T7s','T6s','T5s','T4s','T3s','98s','97s','96s','95s','94s','93s','87s','86s','85s','84s','83s','76s','75s','74s','73s','72s','65s','64s','63s','62s','54s','53s','52s','43s','42s','32s','AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o','KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','QJo','QTo','Q9o','Q8o','Q7o','Q6o','JTo','J9o','J8o','J7o','T9o','T8o','T7o','T6o','98o','97o','96o','87o','86o','76o','75o','65o','64o','54o']
    }
};

// BB 位置单独处理（因为 BB 已经投入了盲注，范围更宽）
function getShortStackRangeBB(stackDepth) {
    // BB 在任何短筹码深度下都更宽
    return ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22',
            'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
            'KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s','K2s',
            'QJs','QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s','Q3s','Q2s',
            'JTs','J9s','J8s','J7s','J6s','J5s','J4s','J3s','J2s',
            'T9s','T8s','T7s','T6s','T5s','T4s','T3s','T2s',
            '98s','97s','96s','95s','94s','93s','92s',
            '87s','86s','85s','84s','83s','82s',
            '76s','75s','74s','73s','72s',
            '65s','64s','63s','62s',
            '54s','53s','52s',
            '43s','42s',
            '32s',
            'AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o','A5o','A4o','A3o','A2o',
            'KQo','KJo','KTo','K9o','K8o','K7o','K6o','K5o','K4o','K3o','K2o',
            'QJo','QTo','Q9o','Q8o','Q7o','Q6o','Q5o','Q4o','Q3o','Q2o',
            'JTo','J9o','J8o','J7o','J6o','J5o','J4o','J3o','J2o',
            'T9o','T8o','T7o','T6o','T5o','T4o','T3o','T2o',
            '98o','97o','96o','95o','94o','93o','92o',
            '87o','86o','85o','84o','83o','82o',
            '76o','75o','74o','73o','72o',
            '65o','64o','63o','62o',
            '54o','53o','52o',
            '43o','42o',
            '32o'];
}

// 获取短筹码推荐行动
function getShortStackRecommendation(position, stackDepth, handKey) {
    let range;
    if (position === 'BB') {
        range = getShortStackRangeBB(stackDepth);
    } else {
        const posRanges = SHORT_STACK_RANGES[position] || SHORT_STACK_RANGES['UTG'];
        // 找到最接近的筹码深度
        const depths = Object.keys(posRanges).map(Number).sort((a, b) => a - b);
        let closestDepth = depths[0];
        for (const d of depths) {
            if (d <= stackDepth) closestDepth = d;
            else break;
        }
        range = posRanges[closestDepth] || [];
    }
    
    const normKey = normalizeHandKey(handKey);
    if (range.includes(normKey)) return 'P';
    
    // 检查是否接近范围（相邻的筹码深度）
    const posRanges = position === 'BB' ? null : (SHORT_STACK_RANGES[position] || SHORT_STACK_RANGES['UTG']);
    if (posRanges) {
        const depths = Object.keys(posRanges).map(Number).sort((a, b) => a - b);
        for (const d of depths) {
            if (posRanges[d].includes(normKey)) return 'M';
        }
    }
    return 'F';
}

// 获取推荐范围的手牌列表
function getShortStackRangeHands(position, stackDepth) {
    if (position === 'BB') return getShortStackRangeBB(stackDepth);
    const posRanges = SHORT_STACK_RANGES[position] || SHORT_STACK_RANGES['UTG'];
    const depths = Object.keys(posRanges).map(Number).sort((a, b) => a - b);
    let closestDepth = depths[0];
    for (const d of depths) {
        if (d <= stackDepth) closestDepth = d;
        else break;
    }
    return posRanges[closestDepth] || [];
}

// 计算 ChipEV（筹码期望值）
// 假设：全压后，对手按范围跟注，根据 equity 计算期望筹码变化
function calculateChipEV(equity, stackDepth, opponentCount, opponentCallProb = 0.3) {
    // 简化模型：
    // 如果所有人都弃牌，赢得盲注（约 1.5bb）
    // 如果有人跟注，根据 equity 决定赢/输
    // 假设每个对手有 opponentCallProb 的概率跟注
    
    const deadMoney = 1.5; // bb + sb
    const foldProb = Math.pow(1 - opponentCallProb, opponentCount);
    const callProb = 1 - foldProb;
    
    // 当有人跟注时，假设平均 1 个对手跟注（简化）
    // 期望收益 = equity * (stackDepth + deadMoney) - (1 - equity) * stackDepth
    const evWhenCalled = equity * (stackDepth + deadMoney) - (1 - equity) * stackDepth;
    
    // 综合 ChipEV
    const chipEV = foldProb * deadMoney + callProb * evWhenCalled;
    return chipEV;
}

// 获取手牌描述（如 "Ace-King offsuit"）
function getHandDescription(handKey) {
    const rankNames = {
        'A': 'Ace', 'K': 'King', 'Q': 'Queen', 'J': 'Jack', 'T': 'Ten',
        '9': 'Nine', '8': 'Eight', '7': 'Seven', '6': 'Six', '5': 'Five',
        '4': 'Four', '3': 'Three', '2': 'Two'
    };
    if (handKey.length === 2) {
        return `口袋对子 ${rankNames[handKey[0]]}`;
    }
    const r1 = rankNames[handKey[0]];
    const r2 = rankNames[handKey[1]];
    const type = handKey[2] === 's' ? '同花' : '非同花';
    return `${r1}-${r2} ${type}`;
}

// ============ 策略 FAQ 知识库（短筹码专题）============

const STRATEGY_FAQ = [
    {
        question: { zh: '20bb 在 BTN 为什么可以全压更宽的范围？', en: 'Why can I push a wider range on BTN with 20bb?' },
        answer: { 
            zh: 'BTN（按钮位）有两个核心优势：1）位置优势——你最后行动，能观察到前面所有玩家的决策；2）盲注压力——当所有人都弃牌到你时，你只需要击败两个盲注。20bb 在 BTN 全压，如果 SB 和 BB 弃牌，你直接赢得 1.5bb。即使被跟注，你的位置优势让你在翻后最后行动。相比 UTG 需要面对 5 个未行动的玩家，BTN 的风险大幅降低。',
            en: 'BTN has two key advantages: 1) Position — you act last after seeing all decisions; 2) Blind pressure — when everyone folds to you, you only need to beat the blinds. Pushing 20bb from BTN, if both blinds fold, you win 1.5bb immediately. Even if called, your position lets you act last postflop. Compared to UTG facing 5 unacted players, risk is much lower.'
        }
    },
    {
        question: { zh: '面对松手玩家，全压范围应该收紧还是放宽？', en: 'Should I tighten or widen my push range against loose players?' },
        answer: { 
            zh: '面对松手玩家（跟注范围宽），你应该收紧全压范围。因为松手玩家更可能用边缘牌跟注你的全压，这降低了你的 fold equity（弃牌赢率）。如果对手经常用 QJs、A9o 这种牌跟注，你需要确保自己的手牌在对抗这些范围时仍有足够的 equity。一般来说，面对跟注范围 Top 30% 的对手，你的全压范围应该比面对 Top 10% 对手时收紧约 15-20%。',
            en: 'Against loose players (wide calling range), tighten your push range. Loose players are more likely to call with marginal hands, reducing your fold equity. If opponents regularly call with hands like QJs or A9o, ensure your hand has sufficient equity against that range. Generally, against a Top 30% calling range, tighten your push range by about 15-20% compared to facing a Top 10% range.'
        }
    },
    {
        question: { zh: 'ICM 压力是什么意思？为什么决赛桌要更紧？', en: 'What is ICM pressure? Why play tighter at the final table?' },
        answer: { 
            zh: 'ICM（独立筹码模型）将筹码转化为实际的奖金期望值。在锦标赛后期，尤其是泡沫期或决赛桌，筹码的实际价值是非线性的——损失筹码的代价大于赢得同等筹码的收益。例如，从 9 人到 8 人，每个存活的玩家都锁定了更高的奖金。因此，在 ICM 压力下，即使 ChipEV 为正的全压，也可能因为奖金结构而被弃掉。决赛桌时，除非你非常短筹（<5bb），否则应该比纯 ChipEV 建议的范围更紧。',
            en: 'ICM (Independent Chip Model) converts chips into real prize equity. In tournament late stages, especially bubbles or final tables, chip value is non-linear — losing chips costs more than winning the same amount gains. From 9 players to 8, every survivor locks a higher prize. So under ICM pressure, even ChipEV-positive pushes may be folded due to payout structure. At final tables, unless very short (<5bb), play tighter than pure ChipEV suggests.'
        }
    },
    {
        question: { zh: '为什么短筹码时同花连牌比非同花大 Ace 更有价值？', en: 'Why are suited connectors more valuable than offsuit big Aces when short-stacked?' },
        answer: { 
            zh: '短筹码（<10bb）全压时，你的主要赢率来自：1）对手弃牌；2）翻后中强牌。同花连牌（如 T9s、87s）虽然翻前 equity 不如 AJo，但它们有更高的隐含赔率潜力——容易中顺子或同花，而且一旦击中，对手很难读出。相比之下，非同花大 Ace（如 AJo）在短筹码全压时，如果被跟注，往往只是 coin flip（抛硬币）对抗口袋对子。短筹码时，翻牌后操作空间有限，所以手牌的结构性和可玩性比单纯的翻前 equity 更重要。',
            en: 'When short-stacked (<10bb), your main win sources are: 1) opponent folds; 2) hitting strong hands postflop. Suited connectors like T9s or 87s have lower preflop equity than AJo, but higher implied odds — they can make straights or flushes, and when they hit, opponents struggle to read. In contrast, offsuit big Aces like AJo are often just coin flips against pocket pairs when called. With limited postflop maneuverability, hand structure and playability matter more than raw preflop equity.'
        }
    },
    {
        question: { zh: '什么时候应该用 "ChipEV" 模式，什么时候应该考虑 ICM？', en: 'When should I use ChipEV mode vs considering ICM?' },
        answer: { 
            zh: 'ChipEV 模式适用于：1）锦标赛的早期阶段（离钱圈还很远）；2）SNG 的前几级；3）日常练习和理论分析。ICM 需要考虑的情况：1）接近钱圈（泡沫期）；2）决赛桌；3）你的筹码量处于"中等"（不是最短也不是最短）。简单规则：如果你不是最短筹，而且离钱圈很近（例如 15 人剩 12 人进钱），ICM 会让你的全压范围收紧 10-30%。如果只剩 10bb 以下，ICM 影响较小，因为不行动就会被盲注耗尽。',
            en: 'ChipEV applies to: 1) early tournament stages (far from bubble); 2) early SNG levels; 3) practice and theory study. ICM matters when: 1) near the bubble; 2) at final table; 3) you have a medium stack (not shortest or chip leader). Simple rule: if not the shortest stack and near the bubble (e.g., 15 left, 12 cash), ICM tightens your push range by 10-30%. Under 10bb, ICM has less impact because inaction bleeds you out.'
        }
    },
    {
        question: { zh: '5bb 以下超短筹码时，有什么特殊策略？', en: 'What special strategies apply with under 5bb?' },
        answer: { 
            zh: '5bb 以下是" desperation mode"（绝望模式）：1）任何 A、任何对子、任何两张 10 以上的牌都可以全压；2）在 SB 位置，几乎任何两张牌都可以全压（因为只剩不到 1 轮盲注）；3）不要等待"好牌"，因为盲注会吃光你；4）优先找"有摊牌价值"的手牌，而不是听牌型。数学上，5bb 在 BTN 的理论全压范围超过 60% 的手牌。这时候"Fold equity"已经很低，主要依赖摊牌价值。',
            en: 'Under 5bb is "desperation mode": 1) Any Ace, any pair, any two Broadway cards are pushable; 2) From SB, almost any two cards can push (less than 1 orbit of blinds left); 3) Don\'t wait for "premium" hands — blinds will eat you; 4) Prioritize hands with showdown value, not drawing hands. Mathematically, 5bb from BTN pushes over 60% of hands. Fold equity is minimal — rely on showdown value.'
        }
    },
    {
        question: { zh: '为什么 BB 位置的全压范围比 BTN 还宽？', en: 'Why is the BB push range even wider than BTN?' },
        answer: { 
            zh: 'BB 位置已经投入了一个大盲注（1bb），所以你只需要再投入 (stack - 1)bb 就能看翻牌。如果所有人都弃牌到 BB，你已经"免费"看了一次翻牌。但更重要的是，在短筹码场景中，BB 面对的是最后一个行动的机会。如果前面都弃牌，你只剩 SB 和一个可能跟注的 BB。而且 BB 已经投入了 1bb，pot odds 更好。所以 BB 的理论全压范围非常宽，有时超过 70% 的手牌。',
            en: 'BB has already invested 1bb, so you only need to add (stack - 1)bb to see the flop. If everyone folds to BB, you get a "free" flop. More importantly, in short-stack scenarios, BB is the last to act. If everyone folded before, you only face SB and a potentially calling BB. And BB already has 1bb invested, giving better pot odds. So BB\'s theoretical push range is extremely wide, sometimes over 70% of hands.'
        }
    },
    {
        question: { zh: '全压时，"Fold Equity" 是什么？为什么重要？', en: 'What is Fold Equity and why does it matter when pushing?' },
        answer: { 
            zh: 'Fold Equity 指你下注/全压后，对手弃牌的概率。短筹码全压的期望值 = (对手弃牌率 × 赢得的底池死钱) + (对手跟注率 × 被跟注时的 equity × 赢得的筹码) - (对手跟注率 × 被跟注时的败率 × 输掉的筹码)。即使你的手牌被跟注时只有 40% 胜率，如果对手有 50% 概率弃牌，Fold Equity 足以让全压成为正 EV。位置越靠前（UTG/MP），Fold Equity 越低，因为后面玩家越多；位置越后（BTN/SB），Fold Equity 越高。',
            en: 'Fold Equity is the probability opponents fold to your bet/push. Short-stack push EV = (fold% × dead money) + (call% × equity × win) - (call% × (1-equity) × lose). Even if your hand only has 40% equity when called, if opponents fold 50% of the time, fold equity alone makes the push +EV. Earlier positions (UTG/MP) have lower fold equity due to more players behind; later positions (BTN/SB) have higher fold equity.'
        }
    },
    {
        question: { zh: '对手数量对全压范围有什么影响？', en: 'How does the number of opponents affect my push range?' },
        answer: { 
            zh: '对手越多，你的全压范围应该越紧。原因：1）被跟注的概率增加——每个对手都有独立概率用范围内的牌跟注；2）多人底池时，你的 equity 被稀释（即使你是 60% 的 equity，两个对手各自也有 20-30% 的 equity，你实际只有约 45% 的胜率）。1 个对手时，你可以用标准范围全压；2 个对手时，范围收紧约 20%；3 个及以上时，只全压 Premium 手牌（AA-QQ、AKs）。',
            en: 'More opponents means a tighter push range. Reasons: 1) Higher chance of being called — each opponent has independent probability of calling with their range; 2) In multiway pots, your equity is diluted (even with 60% equity vs one, two opponents each with 20-30% means you actually only win ~45%). With 1 opponent, use standard range; with 2, tighten ~20%; with 3+, only push premium hands (AA-QQ, AKs).' 
        }
    },
    {
        question: { zh: '如何在实战中快速判断是否应该全压？', en: 'How do I quickly decide whether to push in real games?' },
        answer: { 
            zh: '三步快速判断法：1）看筹码深度——<10bb 考虑全压，<5bb 几乎任何可玩手牌都全压；2）看位置——BTN > CO > MP > UTG，位置越后范围越宽；3）看手牌——在 APP 中输入手牌和筹码，2 秒内得到建议。记住：线上锦标赛节奏很快，不要过度思考。如果你的手牌在推荐范围内，而且筹码<15bb，直接全压。犹豫只会让你错过时机。',
            en: 'Three-step quick check: 1) Stack depth — consider pushing under 10bb, almost any playable hand under 5bb; 2) Position — BTN > CO > MP > UTG, wider from later positions; 3) Hand — enter your hand and stack in the app, get advice in 2 seconds. Remember: online tournaments are fast-paced, don\'t overthink. If your hand is in the recommended range and stack is under 15bb, just push. Hesitation makes you miss opportunities.'
        }
    }
];

// 策略 FAQ 获取函数
function getStrategyFAQ(lang) {
    return STRATEGY_FAQ.map(item => ({
        question: item.question[lang] || item.question.zh,
        answer: item.answer[lang] || item.answer.zh
    }));
}

// 每日一题生成器
function generateDailyChallenge() {
    const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB'];
    const depths = [1, 2, 3, 5, 7, 10, 12, 15, 20];
    const oppCounts = [1, 2];
    
    const position = positions[Math.floor(Math.random() * positions.length)];
    const stackDepth = depths[Math.floor(Math.random() * depths.length)];
    const oppCount = oppCounts[Math.floor(Math.random() * oppCounts.length)];
    
    // 随机选择手牌
    const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    const r1 = ranks[Math.floor(Math.random() * ranks.length)];
    const r2 = ranks[Math.floor(Math.random() * ranks.length)];
    const isSuited = Math.random() > 0.5;
    let handKey;
    if (r1 === r2) handKey = r1 + r2;
    else if (ranks.indexOf(r1) < ranks.indexOf(r2)) handKey = r1 + r2 + (isSuited ? 's' : 'o');
    else handKey = r2 + r1 + (isSuited ? 's' : 'o');
    
    const recommendation = getShortStackRecommendation(position, stackDepth, handKey);
    const isPush = recommendation === 'P';
    
    return {
        position,
        stackDepth,
        handKey,
        opponentCount: oppCount,
        opponentRange: 'standard',
        correctAnswer: isPush ? 'push' : 'fold',
        explanation: isPush 
            ? `在 ${position} 位置，${stackDepth}bb 筹码深度下，${handKey} 处于推荐全压范围内。对抗 ${oppCount} 个标准范围对手，此手牌有 sufficient fold equity 和摊牌价值。`
            : `在 ${position} 位置，${stackDepth}bb 筹码深度下，${handKey} 不在推荐全压范围内。对抗 ${oppCount} 个标准范围对手，此手牌的 equity 不足，且 fold equity 无法弥补。建议弃牌等待更好的机会。`,
        explanationEn: isPush
            ? `From ${position} with ${stackDepth}bb, ${handKey} is in the recommended push range. Against ${oppCount} standard-range opponents, this hand has sufficient fold equity and showdown value.`
            : `From ${position} with ${stackDepth}bb, ${handKey} is outside the recommended push range. Against ${oppCount} standard-range opponents, this hand lacks sufficient equity and fold equity cannot compensate. Fold and wait for a better spot.`
    };
}

// 导出/兼容模块（如果支持 module.exports）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Card, Range, SUITS, RANKS,
        evaluate5Cards, evaluate7Cards, compareHands,
        calculateEquity, calculateEquityVsRange, calculateEquityVsMultipleRanges,
        calculateExpectedValue, calculateChipEV,
        calculateRiskOfRuin, evaluateBankrollManagement, getBankrollActionAdvice,
        getPreflopMatrix, getHandAdviceAllPositions,
        getShortStackRecommendation, getShortStackRangeHands,
        getHandKey, getHandDescription, normalizeHandKey,
        getStrategyFAQ, generateDailyChallenge,
        OPPONENT_RANGE_PRESETS, SHORT_STACK_RANGES, HAND_COMBINATIONS
    };
}


