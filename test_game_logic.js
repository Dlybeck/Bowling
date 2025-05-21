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
 * @param {Array<number>} rawGameArray - The game array (actual pinfalls).
 * @param {Array<number>} expectedCumulativeScores - The expected array of 10 cumulative frame scores.
 */
function runTest(testName, rawGameArray, expectedCumulativeScores) {
    // calculateScore expects a flat array of actual pinfalls, null-padded to 21.
    const gameForScoring = padGameArray(rawGameArray, 21);
    
    const actualCumulativeScores = calculateScore(gameForScoring); // This now returns an array
    const status = JSON.stringify(actualCumulativeScores) === JSON.stringify(expectedCumulativeScores) ? 'PASSED' : 'FAILED';
    
    let details = `Expected: [${expectedCumulativeScores.join(',')}], Got: [${actualCumulativeScores.join(',')}]. Input Game: [${rawGameArray.join(',')}]`;
    
    if (status === 'FAILED') {
        console.error(`Test ${testName}: ${status} (Details: ${details})`);
    } else {
        console.log(`Test ${testName}: ${status} (Scores: [${actualCumulativeScores.join(',')}])`);
    }

    if (typeof updateTestResultsOnPage === 'function') {
        updateTestResultsOnPage(testName, status, details);
    } else {
        console.warn("updateTestResultsOnPage function not found. Results will not be shown on HTML page.");
    }
}

// --- Define Test Cases ---

// Test 1: All Gutter Balls
runTest("All Gutter Balls", 
    [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// Test 2: Perfect Game
runTest("Perfect Game", 
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], 
    [30, 60, 90, 120, 150, 180, 210, 240, 270, 300]);

// Test 3: All Spares (5,5) with a final 5
runTest("All Spares of 5 then 5, final 5", 
    [5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5,5, 5], 
    [15, 30, 45, 60, 75, 90, 105, 120, 135, 150]);

// Test 4: Mixed Game (as per prompt's example for this subtask)
const testMixedGame = [10, 5,5, 7,2, 10, 10, 3,4, 0,0, 8,2, 10, 6,3];
runTest("Mixed Strikes, Spares, Open (prompt example)", testMixedGame, 
    [20, 37, 46, 69, 86, 93, 93, 113, 132, 141]);

// Test 5: Specific Strike Bonus Case (from previous test suite)
const testStrikeBonus = [10, 3,4, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0];
runTest("Specific Strike Bonus Case", testStrikeBonus, 
    [17, 24, 24, 24, 24, 24, 24, 24, 24, 24]);

// Test 6: Specific Spare Bonus Case (from previous test suite)
const testSpareBonus = [7,3, 4,2, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0];
runTest("Specific Spare Bonus Case", testSpareBonus, 
    [14, 20, 20, 20, 20, 20, 20, 20, 20, 20]);

// Test 7: Game ending early with zeros (from previous test suite)
const testEarlyEnd = [10, 5,5, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0]; 
runTest("Game Ending Early with Zeros", testEarlyEnd, 
    [20, 30, 30, 30, 30, 30, 30, 30, 30, 30]);

// Test 8: All Nines and Zeros (from previous test suite)
const testNinesAndZeros = [9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0, 9,0];
runTest("All Nines and Zeros", testNinesAndZeros, 
    [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]);

// Test 9: A game with a spare in the 10th frame (from previous test suite)
const testSpareInTenth = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5,5];
runTest("Spare in 10th Frame", testSpareInTenth, 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 15]);

// Test 10: A game with a strike chain in the 10th frame (from previous test suite)
const testStrikeChainTenth = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10, 10,10,10];
runTest("Strike Chain into 10th Frame", testStrikeChainTenth, 
    [0, 0, 0, 0, 0, 0, 0, 0, 30, 60]);

// Test 11: Gutter into Strike (from previous test suite)
const testGutterThenStrike = [0,0, 10, 5,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0];
runTest("Gutter then Strike with bonus", testGutterThenStrike, 
    [0, 15, 20, 20, 20, 20, 20, 20, 20, 20]);

// Test 12: Single roll in game (incomplete) (from previous test suite)
const testSingleRoll = [7];
runTest("Single Roll Incomplete Game", testSingleRoll, 
    [7, 7, 7, 7, 7, 7, 7, 7, 7, 7]);

// Test 13: Incomplete strike frame at end (F9 is a strike, game ends) (from previous test suite)
const testIncompleteStrike = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10];
runTest("Incomplete Strike Frame at End", testIncompleteStrike, 
    [0,0,0,0,0,0,0,0, 10, 10]);

// Test 14: Incomplete spare frame at end (F9 is a spare, game ends) (from previous test suite)
const testIncompleteSpare = [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5];
runTest("Incomplete Spare Frame at End", testIncompleteSpare, 
    [0,0,0,0,0,0,0,0, 10, 10]);

console.log("All tests in test_game_logic.js have been updated and executed with new score format.");
