/**
 * AI Poker Coach
 * AI 教练知识库与问答系统
 * 依赖: core-engine.js (for t / getCurrentLang)
 */

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
