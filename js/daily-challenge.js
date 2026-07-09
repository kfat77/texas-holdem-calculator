/**
 * Daily Challenge - 每日一题
 * 使用现有引擎生成每日随机短筹码全压题目
 */

const DAILY_CHALLENGE_STORAGE_KEY = 'poker-daily-challenge';
const DAILY_DATE_KEY = 'poker-daily-date';

function getDailyChallenge() {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(DAILY_DATE_KEY);
    const savedChallenge = localStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY);
    
    if (savedDate === today && savedChallenge) {
        try { return JSON.parse(savedChallenge); } catch (e) {}
    }
    
    const challenge = generateDailyChallenge();
    localStorage.setItem(DAILY_DATE_KEY, today);
    localStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(challenge));
    return challenge;
}

function generateDailyChallenge() {
    const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB'];
    const depths = [2, 3, 5, 7, 10, 12, 15, 20];
    
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    const pos = positions[seed % positions.length];
    const stack = depths[seed % depths.length];
    
    // 生成随机手牌
    const rankIdx1 = (seed * 7) % 13;
    const rankIdx2 = (seed * 13) % 13;
    const suited = (seed % 2 === 0);
    let handKey;
    if (rankIdx1 === rankIdx2) {
        handKey = RANKS[rankIdx1] + RANKS[rankIdx2];
    } else {
        const hi = Math.max(rankIdx1, rankIdx2);
        const lo = Math.min(rankIdx1, rankIdx2);
        handKey = RANKS[hi] + RANKS[lo] + (suited ? 's' : 'o');
    }
    
    const advice = getPushFoldAdvice(pos, stack, handKey);
    const correctAnswer = advice.isInRange ? 'push' : 'fold';
    
    let explanation;
    if (correctAnswer === 'push') {
        explanation = `${handKey} 在 ${pos} 位置 ${stack}bb 深度属于推荐全压范围。` +
            `这个位置+筹码深度的全压范围包含大约 ${advice.rangeSet.size} 种手牌组合。` +
            `对抗标准对手范围(Top 20%)，这手牌有足够的 equity 支持全压决策。`;
    } else {
        explanation = `${handKey} 在 ${pos} 位置 ${stack}bb 深度不在推荐全压范围内。` +
            `这个位置+筹码深度只推荐 ${advice.rangeSet.size} 种手牌组合全压。` +
            `${handKey} 的 equity 不足以支撑全压所需的 fold equity + showdown equity。`;
    }
    
    return {
        date: new Date().toISOString().split('T')[0],
        position: pos,
        stackBB: stack,
        hand: handKey,
        correctAnswer,
        explanation,
        opponentCount: 1 + (seed % 2),
        opponentRange: 'standard'
    };
}

function checkDailyAnswer(userAnswer) {
    const challenge = getDailyChallenge();
    const isCorrect = userAnswer === challenge.correctAnswer;
    return { isCorrect, challenge };
}

// 初始化 Today's challenge on page load
document.addEventListener('DOMContentLoaded', () => {
    const dailyBtn = document.getElementById('daily-challenge-btn');
    if (dailyBtn) {
        dailyBtn.addEventListener('click', showDailyChallenge);
    }
});

function showDailyChallenge() {
    const challenge = getDailyChallenge();
    const modal = document.getElementById('daily-challenge-modal');
    if (!modal) return;
    
    document.getElementById('dc-position').textContent = challenge.position;
    document.getElementById('dc-stack').textContent = challenge.stackBB + 'bb';
    document.getElementById('dc-hand').textContent = challenge.hand;
    document.getElementById('dc-opponents').textContent = challenge.opponentCount + '人';
    document.getElementById('dc-result').style.display = 'none';
    document.getElementById('dc-buttons').style.display = 'flex';
    
    modal.style.display = 'flex';
}

function answerDaily(answer) {
    const result = checkDailyAnswer(answer);
    const challenge = result.challenge;
    
    document.getElementById('dc-buttons').style.display = 'none';
    const resultEl = document.getElementById('dc-result');
    resultEl.style.display = 'block';
    
    const isCorrect = result.isCorrect;
    resultEl.innerHTML = `
        <div style="text-align:center;margin-bottom:12px;font-size:2rem;">${isCorrect ? '✅' : '❌'}</div>
        <div style="font-weight:700;color:${isCorrect ? '#22c55e' : '#ef4444'};margin-bottom:8px;">
            ${isCorrect ? '回答正确！' : '回答错误'}
        </div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
            ${challenge.explanation}
        </div>
        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-muted);">
            正确答案：${challenge.correctAnswer === 'push' ? '全压' : '弃牌'}
        </div>
    `;
}
