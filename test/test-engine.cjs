/**
 * 德州扑克概率计算器 - 测试脚本
 * 运行方式: node test/test-engine.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 读取引擎文件并在当前上下文中执行
const engineCode = fs.readFileSync(path.join(__dirname, '../js/poker-engine.js'), 'utf8');
vm.runInThisContext(engineCode);

// 确认引擎加载成功
if (typeof Card === 'undefined') {
    console.error('引擎加载失败：Card 类未定义');
    process.exit(1);
}
console.log('引擎加载成功\n');

// ============ 测试工具 ============
let passed = 0;
let failed = 0;

function assertEqual(actual, expected, msg) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
        passed++;
        console.log(`  ✅ ${msg}`);
    } else {
        failed++;
        console.log(`  ❌ ${msg}`);
        console.log(`     期望: ${expectedStr}`);
        console.log(`     实际: ${actualStr}`);
    }
}

function makeCards(arr) {
    return arr.map(s => Card.fromString(s));
}

console.log('=================================');
console.log('  德州扑克概率计算器 - 引擎测试');
console.log('=================================\n');

// ============ 测试1: 5张牌牌型识别 ============
console.log('【测试1】5张牌牌型识别');

// 高牌
let cards = makeCards(['♠A', '♥K', '♣9', '♦5', '♠3']);
let result = evaluate5Cards(cards);
assertEqual(result.handRank, 0, '高牌 A-K-9-5-3');

// 一对
cards = makeCards(['♠A', '♥A', '♣9', '♦5', '♠3']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 1, '一对 A-A-9-5-3');

// 两对
cards = makeCards(['♠A', '♥A', '♣9', '♦9', '♠3']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 2, '两对 A-A-9-9-3');

// 三条
cards = makeCards(['♠A', '♥A', '♣A', '♦5', '♠3']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 3, '三条 A-A-A-5-3');

// 顺子
cards = makeCards(['♠5', '♥6', '♣7', '♦8', '♠9']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 4, '顺子 5-6-7-8-9');

// 小顺 A-2-3-4-5
cards = makeCards(['♠A', '♥2', '♣3', '♦4', '♠5']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 4, '小顺 A-2-3-4-5');

// 同花
cards = makeCards(['♠2', '♠6', '♠9', '♠J', '♠A']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 5, '同花 ♠2-6-9-J-A');

// 葫芦
cards = makeCards(['♠Q', '♥Q', '♣Q', '♦7', '♠7']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 6, '葫芦 Q-Q-Q-7-7');

// 四条
cards = makeCards(['♠K', '♥K', '♣K', '♦K', '♠3']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 7, '四条 K-K-K-K-3');

// 同花顺
cards = makeCards(['♥5', '♥6', '♥7', '♥8', '♥9']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 8, '同花顺 ♥5-6-7-8-9');

// 皇家同花顺
cards = makeCards(['♠A', '♠K', '♠Q', '♠J', '♠10']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 9, '皇家同花顺 ♠A-K-Q-J-10');

// ============ 测试2: 7张牌选最佳5张 ============
console.log('\n【测试2】7张牌选最佳组合');

// 7张中有同花顺，应该识别出来
cards = makeCards(['♠5', '♠6', '♠7', '♠8', '♠9', '♥A', '♦K']);
result = evaluate7Cards(cards);
assertEqual(result.handRank, 8, '7张含同花顺，应识别为同花顺');

// 7张中有四条
cards = makeCards(['♠A', '♥A', '♣A', '♦A', '♠K', '♥K', '♣K']);
result = evaluate7Cards(cards);
assertEqual(result.handRank, 7, '7张含四条A+KKK，应识别为四条');

// 7张中有同花也有顺子但不是同花顺，同花更大
cards = makeCards(['♠2', '♠5', '♠7', '♠9', '♠K', '♥3', '♦4']);
result = evaluate7Cards(cards);
assertEqual(result.handRank, 5, '7张含同花但无顺子，应为同花');

// 复杂情况：有顺子也有两对，顺子更大
cards = makeCards(['♠5', '♥6', '♣7', '♦8', '♠9', '♥9', '♣8']);
result = evaluate7Cards(cards);
assertEqual(result.handRank, 4, '7张含顺子+两对，顺子更大');

// ============ 测试3: 概率计算 ============
console.log('\n【测试3】概率计算');

// Pre-flop: AA
const holeAA = makeCards(['♠A', '♥A']);
let probResult = calculateProbabilities(holeAA, []);
assertEqual(probResult.exact, false, 'Pre-flop应使用蒙特卡洛模拟');
assertEqual(probResult.top7.length, 7, '应返回7个牌型');

// 检查一对的概率是否最高
const pairProb = probResult.top7.find(p => p.handRank === 1);
assertEqual(pairProb !== undefined, true, 'Pre-flop AA应有一对概率');

// Flop: AA on rainbow flop
const comm3 = makeCards(['♣2', '♦7', '♠K']);
probResult = calculateProbabilities(holeAA, comm3);
assertEqual(probResult.exact, true, 'Flop应使用精确计算');

// Turn
const comm4 = makeCards(['♣2', '♦7', '♠K', '♥5']);
probResult = calculateProbabilities(holeAA, comm4);
assertEqual(probResult.exact, true, 'Turn应使用精确计算');

// River: 全部5张
const comm5 = makeCards(['♣2', '♦7', '♠K', '♥5', '♣9']);
probResult = calculateProbabilities(holeAA, comm5);
assertEqual(probResult.exact, true, 'River应使用精确计算');

// ============ 测试4: 边缘情况 ============
console.log('\n【测试4】边缘情况');

// 小顺测试（A-2-3-4-5）
cards = makeCards(['♠A', '♥2', '♣3', '♦4', '♠5']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 4, 'A-2-3-4-5应识别为顺子');
assertEqual(result.kickers[0], 3, 'A-5顺子的高牌应为5(value=3)');

// 顺子中的同花小顺
cards = makeCards(['♠A', '♠2', '♠3', '♠4', '♠5']);
result = evaluate5Cards(cards);
assertEqual(result.handRank, 8, 'A-2-3-4-5同花应为同花顺');

// 高牌踢脚比较
cards = makeCards(['♠A', '♥K', '♣Q', '♦J', '♠9']);
result = evaluate5Cards(cards);
assertEqual(result.kickers[0], 12, 'A-K-Q-J-9的高牌应为A(value=12)');

// 同花顺 vs 四条：同花顺更大
cards1 = makeCards(['♥5', '♥6', '♥7', '♥8', '♥9']);
cards2 = makeCards(['♠A', '♥A', '♣A', '♦A', '♠K']);
const r1 = evaluate5Cards(cards1);
const r2 = evaluate5Cards(cards2);
assertEqual(compareHands(r1, r2) > 0, true, '同花顺应大于四条');

// ============ 测试5: 实用场景验证 ============
console.log('\n【测试5】实用场景');

// 口袋对子翻牌击中三条的概率大致验证
const pocket = makeCards(['♠8', '♥8']);
const flop = makeCards(['♣A', '♦K', '♠3']);
probResult = calculateProbabilities(pocket, flop);
const tripProb = probResult.top7.find(p => p.handRank === 3);
if (tripProb) {
    // 口袋对在翻牌后中三条+葫芦+四条的理论概率约12%左右
    assertEqual(tripProb.probability > 5, true, `88在A-K-3翻牌后三条概率${tripProb.probability.toFixed(2)}%应合理`);
}

// ============ 总结 ============
console.log('\n=================================');
console.log(`  测试完成: ${passed} 通过, ${failed} 失败`);
console.log('=================================');

if (failed > 0) {
    process.exit(1);
}
