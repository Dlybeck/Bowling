/**
 * Pads a game array with nulls to a specified length.
 * @param {Array<number|null>} gameArray - The input game array.
 * @param {number} length - The desired length of the padded array.
 * @returns {Array<number|null>} The padded game array.
 */
function padGameArray(gameArray, length) {
    const paddedArray = new Array(length).fill(null);
    for (let i = 0; i < gameArray.length && i < length; i++) {
        paddedArray[i] = gameArray[i];
    }
    return paddedArray;
}

/**
 * Runs a single test case for the calculateScore function.
 * @param {string} testName - The name of the test.
 * @param {Array<number>} rawGameArray - The game array (actual pinfalls, not null-padded yet for strikes).
 * @param {number} expectedScore - The expected score for this game.
 */
function runTest(testName, rawGameArray, expectedScore) {
    // The calculateScore function expects a flat array of actual pinfalls, null-padded to 21.
    // The rawGameArray here represents the sequence of actual pinfalls.
    const gameForScoring = padGameArray(rawGameArray, 21);
    
    const actualScore = calculateScore(gameForScoring);
    const status = actualScore === expectedScore ? 'PASSED' : 'FAILED';
    let details = `Expected: ${expectedScore}, Got: ${actualScore}. Input Game: [${rawGameArray.join(',')}]`;
    
    if (status === 'FAILED') {
        console.error(`Test ${testName}: ${status} (Expected ${expectedScore}, Got ${actualScore}. Input: [${rawGameArray.join(',')}])`);
    } else {
        console.log(`Test ${testName}: ${status} (Expected ${expectedScore}, Got ${actualScore})`);
    }

    // This function is defined in test_runner.html
    if (typeof updateTestResultsOnPage === 'function') {
        updateTestResultsOnPage(testName, status, details);
    } else {
        console.warn("updateTestResultsOnPage function not found. Results will not be shown on HTML page.");
    }
}

// --- Define Test Cases ---

// Test 1: All Gutter Balls
const testGutterGame = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0]; // 20 rolls
runTest("All Gutter Balls", testGutterGame, 0);

// Test 2: Perfect Game
const testPerfectGame = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]; // 12 rolls
runTest("Perfect Game", testPerfectGame, 300);

// Test 3: All Spares (5,5) with a final 5
const testAllSpares = [5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5]; // 21 rolls
runTest("All Spares of 5 then 5, final 5", testAllSpares, 150);

// Test 4: Mixed Strikes, Spares, Open
// F1: X (10) -> 10 + 5+5 = 20.
// F2: 5,/ (10) -> 10 + 7 = 17.
// F3: 7,2 (9) -> 9.
// F4: X (10) -> 10 + 10+3 = 23.
// F5: X (10) -> 10 + 3+4 = 17.
// F6: 3,4 (7) -> 7.
// F7: 0,0 (0) -> 0.
// F8: 8,/ (10) -> 10 + 10 = 20.
// F9: X (10) -> 10 + 10+10 = 30.
// F10: X,X,X (30) -> 30.
// Total: 20+17+9+23+17+7+0+20+30+30 = 173
const testMixedGame = [10, 5,5, 7,2, 10, 10, 3,4, 0,0, 8,2, 10, 10,10,10];
runTest("Mixed Strikes, Spares, Open", testMixedGame, 173);

// Test 5: Specific Strike Bonus Case
// F1: X (10) -> 10 + 3+4 = 17
// F2: 3,4 (7) -> 7
// F3-F10: 0,0 each
// Total: 17 + 7 + 0*8 = 24
const testStrikeBonus = [10, 3,4, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0]; // 19 rolls for 10 frames
runTest("Specific Strike Bonus Case", testStrikeBonus, 24);

// Test 6: Specific Spare Bonus Case
// F1: 7,/ (10) -> 10 + 4 = 14
// F2: 4,2 (6) -> 6
// F3-F10: 0,0 each
// Total: 14 + 6 + 0*8 = 20
const testSpareBonus = [7,3, 4,2, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0]; // 20 rolls
runTest("Specific Spare Bonus Case", testSpareBonus, 20);

// Test 7: Game ending early (but still representing 10 frames for scoring)
// F1: X (10) -> 10 + 5+5 = 20
// F2: 5,/ (10) -> 10 + 0 = 10
// F3: 0,0 (0) -> 0
// Total: 20 + 10 + 0 = 30
const testEarlyEnd = [10, 5,5, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0]; // 19 rolls
runTest("Game Ending Early with Zeros", testEarlyEnd, 30);

// Test 8: All 9s and 0s (no spares)
const testNinesAndZeros = [9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0]; // 20 rolls
runTest("All Nines and Zeros", testNinesAndZeros, 90);

// Test 9: A game with a spare in the 10th frame
// F1-F8: 0,0 (0 points)
// F9: 0,0 (0 points)
// F10: 5,/,5 (15 points) -> 5+5+5 = 15
const testSpareInTenth = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5,5];
runTest("Spare in 10th Frame", testSpareInTenth, 15);

// Test 10: A game with a strike chain in the 10th frame
// F1-F8: 0,0
// F9: X (10) -> 10 + 10+10 = 30
// F10: X,X,X (30) -> 30
// Total: 30 + 30 = 60
const testStrikeChainTenth = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10, 10,10,10];
runTest("Strike Chain into 10th Frame", testStrikeChainTenth, 60);

// Test 11: Gutter into Strike (to check strike bonus correctly skips no-count rolls)
// F1: 0,0 (0)
// F2: X (10) -> 10 + 5+0 = 15
// F3: 5,0 (5) -> 5
// Total: 0+15+5 = 20
const testGutterThenStrike = [0,0, 10, 5,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0];
runTest("Gutter then Strike with bonus", testGutterThenStrike, 20);

// Test 12: Single roll in game (incomplete)
const testSingleRoll = [7];
runTest("Single Roll Incomplete Game", testSingleRoll, 7);

// Test 13: Incomplete strike frame at end
// F1-F8: 0,0
// F9: X
// F10: not played
const testIncompleteStrike = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10];
runTest("Incomplete Strike Frame at End", testIncompleteStrike, 10); // Score will be 10 until bonus rolls come

// Test 14: Incomplete spare frame at end
// F1-F8: 0,0
// F9: 5, /
// F10: not played
const testIncompleteSpare = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5];
runTest("Incomplete Spare Frame at End", testIncompleteSpare, 10); // Score will be 10 until bonus roll comes

console.log("All tests defined in test_game_logic.js have been queued to run.");

// If updateTestResultsOnPage is ready immediately, tests will display as they run.
// Otherwise, if it relies on window.onload in test_runner.html, results might appear after all JS is parsed.
// The current setup calls updateTestResultsOnPage directly in runTest.
