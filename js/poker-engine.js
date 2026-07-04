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

// 牌型名称（从弱到强）
const HAND_NAMES = {
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
        return { buyIns: 0, status: 'unknown', color: '#888', message: '请输入有效的买入金额', level: 0 };
    }
    const buyIns = bankroll / buyIn;
    
    let status, color, message, level;
    if (buyIns >= 50) {
        status = 'safe';
        color = '#4ade80';
        message = '💎 资金充裕（50+买入）';
        level = 5;
    } else if (buyIns >= 30) {
        status = 'good';
        color = '#22c55e';
        message = '✅ 资金健康（30-50买入）';
        level = 4;
    } else if (buyIns >= 20) {
        status = 'warning';
        color = '#facc15';
        message = '⚠️ 资金偏紧（20-30买入）';
        level = 3;
    } else if (buyIns >= 10) {
        status = 'danger';
        color = '#fb923c';
        message = '🔶 资金紧张（10-20买入）注意降级';
        level = 2;
    } else {
        status = 'critical';
        color = '#ef4444';
        message = '🚨 资金危险（<10买入）必须降级';
        level = 1;
    }
    
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
    
    // ===== 决策树 =====
    
    if (ev <= 0) {
        // 负EV - 原则上弃牌
        if (equity > potOdds * 1.3) {
            action = '弃牌 (FOLD)';
            actionKey = 'fold';
            actionColor = '#ef4444';
            actionBg = 'rgba(239,68,68,0.12)';
            betSize = 0;
            confidence = '高';
            reasoning = '虽然赔率表面有利，但EV为负（说明隐含赔率不足）。长期跟注会亏损，建议弃牌。';
            tags.push('负EV');
        } else {
            action = '弃牌 (FOLD)';
            actionKey = 'fold';
            actionColor = '#ef4444';
            actionBg = 'rgba(239,68,68,0.12)';
            betSize = 0;
            confidence = '极高';
            reasoning = 'EV为负且赔率不利，弃牌是唯一数学上正确的选择。不要为已经投入的筹码追损。';
            tags.push('负EV', '赔率不利');
        }
    } else {
        // 正EV - 根据胜率和资金状况细化建议
        
        if (equity < 0.35) {
            // 弱正EV
            action = '跟注 (CALL)';
            actionKey = 'call';
            actionColor = '#3b82f6';
            actionBg = 'rgba(59,130,246,0.12)';
            betSize = toCall;
            confidence = '低';
            reasoning = '边缘正EV，胜率较低。小注跟注验证，但注意对手范围。如果遭遇再加注建议弃牌。';
            tags.push('边缘EV');
        } else if (equity < 0.55) {
            // 中等胜率
            if (ev < buyIn * 0.03) {
                action = '跟注 (CALL)';
                actionKey = 'call';
                actionColor = '#3b82f6';
                actionBg = 'rgba(59,130,246,0.12)';
                betSize = toCall;
                confidence = '中';
                reasoning = '中等胜率，EV为正但收益有限。保守跟注，控制底池大小。';
                tags.push('控制底池');
            } else {
                action = '加注 (RAISE)';
                actionKey = 'raise';
                actionColor = '#22c55e';
                actionBg = 'rgba(34,197,94,0.12)';
                // Kelly建议下注额
                const kellyBet = Math.min(bankroll * halfK, potSize * 1.5);
                betSize = Math.max(toCall * 2, Math.round(kellyBet * 100) / 100);
                confidence = '中高';
                reasoning = '胜率不错，EV可观。建议适度加注获取价值，同时保护手牌。';
                tags.push('价值下注');
            }
        } else if (equity < 0.75) {
            // 强牌
            action = '加注 (RAISE)';
            actionKey = 'raise';
            actionColor = '#22c55e';
            actionBg = 'rgba(34,197,94,0.15)';
            const kellyBet = Math.min(bankroll * kelly, potSize * 2);
            betSize = Math.max(toCall * 2.5, Math.round(kellyBet * 100) / 100);
            confidence = '高';
            reasoning = '强牌！建议主动加注建立底池，最大化价值。注意对手可能的反击范围。';
            tags.push('强牌', '价值下注');
        } else {
            // 超强牌
            action = '全押 (ALL-IN)';
            actionKey = 'allin';
            actionColor = '#a855f7';
            actionBg = 'rgba(168,85,247,0.15)';
            betSize = Math.min(bankroll, potSize * 3);
            confidence = '极高';
            reasoning = '超强牌！胜率极高，全力出击最大化收益。注意慢打（check-raise）也可能有效。';
            tags.push('坚果', '全力出击');
        }
    }
    
    // ===== 资金紧张修正 =====
    if (brm.level <= 2) {
        // 资金紧张时降低激进程度
        if (actionKey === 'allin') {
            action = '加注 (RAISE)';
            actionKey = 'raise';
            actionColor = '#fb923c';
            actionBg = 'rgba(251,146,60,0.12)';
            betSize = Math.min(betSize, bankroll * 0.25);
            reasoning += ' ⚠️【资金修正】资金紧张（<20买入），建议降低下注额保护资金。';
            tags.push('资金保护');
        } else if (actionKey === 'raise') {
            betSize = Math.min(betSize, bankroll * 0.2);
            reasoning += ' ⚠️【资金修正】资金偏紧，建议控制下注在资金的20%以内。';
            tags.push('资金保护');
        } else if (actionKey === 'call' && betSize > bankroll * 0.15) {
            betSize = Math.min(betSize, bankroll * 0.15);
            reasoning += ' ⚠️【资金修正】避免单次投入超过资金15%。';
            tags.push('资金保护');
        }
    }
    
    // ===== 额外建议 =====
    const extraAdvice = [];
    
    // Kelly比例建议
    if (kelly > 0) {
        extraAdvice.push(`凯利公式建议投入资金的 ${(kelly * 100).toFixed(1)}%`);
        extraAdvice.push(`半凯利建议投入 ${(halfK * 100).toFixed(1)}%（推荐）`);
        if (quarterK > 0) {
            extraAdvice.push(`四分之一凯利建议投入 ${(quarterK * 100).toFixed(1)}%（保守）`);
        }
    }
    
    // BRM建议
    if (brm.level <= 2) {
        extraAdvice.push(`当前仅 ${brm.buyIns} 个买入，建议降低级别或补充资金`);
    } else if (brm.level >= 4) {
        extraAdvice.push(`资金充足（${brm.buyIns} 买入），可承受正常波动`);
    }
    
    // 方差提醒
    if (equity > 0.4 && equity < 0.6) {
        extraAdvice.push('注意：当前处于高方差区间，短期结果可能大幅偏离期望值');
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
