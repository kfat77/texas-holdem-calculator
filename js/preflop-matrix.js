/**
 * Preflop Hand Matrix
 * 13×13 翻前手牌矩阵与位置建议
 * 依赖: core-engine.js (for t / getCurrentLang)
 */

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
