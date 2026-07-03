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
