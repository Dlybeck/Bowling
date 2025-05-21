// Helper function to get a random number of pins within a specified range,
// trying to center around a preferred average if possible.
function getSafeRandomPin(min, max, preferredAvg = null) {
    let actualMin = Math.max(0, min);
    let actualMax = Math.min(10, max);

    if (preferredAvg !== null) {
        let targetMin = Math.max(actualMin, preferredAvg - 1);
        let targetMax = Math.min(actualMax, preferredAvg + 1);
        actualMin = targetMin;
        actualMax = targetMax;
    }
    
    if (actualMin > actualMax) actualMin = actualMax; 
    if (actualMin < 0) actualMin = 0; 
    if (actualMax > 10) actualMax = 10;

    return Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
}

function generateGame(strikes, spares, avgFirstBallInput) {
    console.log("generateGame called with (initial values):", strikes, spares, avgFirstBallInput);

    let game = new Array(21).fill(null); // Initialize game array with nulls for padding
    let frames = []; 
    let remStrikes = strikes;
    let remSpares = spares;
    const avgFirstBall = avgFirstBallInput; 
    let currentFrame = 0; 

    // Frames 1-9 Loop
    for (let f = 0; f < 9; f++) {
        currentFrame = f; 
        let frameObj = { rolls: [], type: '' }; 
        if (remStrikes > 0) {
            frameObj.type = 'strike';
            frameObj.rolls.push(10); 
            remStrikes--;
        } else if (remSpares > 0) {
            frameObj.type = 'spare';
            let r1 = getSafeRandomPin(0, 9, avgFirstBall); 
            frameObj.rolls.push(r1);
            frameObj.rolls.push(10 - r1);
            remSpares--;
        } else { 
            frameObj.type = 'open';
            let r1 = getSafeRandomPin(0, 9, avgFirstBall); 
            frameObj.rolls.push(r1);
            frameObj.rolls.push(getSafeRandomPin(0, 9 - r1)); 
        }
        frames.push(frameObj);
    }

    // 10th Frame Logic
    currentFrame = 9; 
    let tenthFrameObj = { rolls: [], type: '' }; 
    let r1_10 = 0, r2_10 = 0; 

    if (remStrikes > 0) { 
        tenthFrameObj.type = 'strike_10th';
        r1_10 = 10;
        tenthFrameObj.rolls.push(r1_10);
        remStrikes--; 

        // Roll 2
        if (remStrikes > 0) { 
            r2_10 = 10;
            tenthFrameObj.rolls.push(r2_10);
            remStrikes--; 
        } else if (remSpares > 0) { 
            r2_10 = getSafeRandomPin(0, 9, avgFirstBall); 
            tenthFrameObj.rolls.push(r2_10);
        } else { 
            r2_10 = getSafeRandomPin(0, 10, avgFirstBall); 
            tenthFrameObj.rolls.push(r2_10);
        }

        // Roll 3 
        if (r2_10 === 10) { // Path: X, X, _ 
            if (remStrikes > 0) {
                tenthFrameObj.rolls.push(10);
                remStrikes--; 
            } else if (remSpares > 0) { 
                tenthFrameObj.rolls.push(getSafeRandomPin(0, 9, avgFirstBall)); 
            } else { 
                tenthFrameObj.rolls.push(getSafeRandomPin(0, 10, avgFirstBall));
            }
        } else { // Path: X, Y (Y < 10), _ 
            if (remSpares > 0) { 
                tenthFrameObj.rolls.push(10 - r2_10); 
                remSpares--; 
            } else { 
                tenthFrameObj.rolls.push(getSafeRandomPin(0, 10, avgFirstBall)); 
            }
        }
    } else if (remSpares > 0) { 
        tenthFrameObj.type = 'spare_10th';
        r1_10 = getSafeRandomPin(0, 9, avgFirstBall); 
        tenthFrameObj.rolls.push(r1_10);
        r2_10 = 10 - r1_10; 
        tenthFrameObj.rolls.push(r2_10);
        remSpares--;
        
        tenthFrameObj.rolls.push(getSafeRandomPin(0, 10, avgFirstBall)); // Bonus roll
    } else { 
        tenthFrameObj.type = 'open_10th';
        r1_10 = getSafeRandomPin(0, 9, avgFirstBall);
        tenthFrameObj.rolls.push(r1_10);
        tenthFrameObj.rolls.push(getSafeRandomPin(0, 9 - r1_10));
    }
    frames.push(tenthFrameObj);

    console.log("Generated Frames Data (before flattening):", JSON.parse(JSON.stringify(frames)));
    
    let flatRollIdx = 0;
    for (let i = 0; i < frames.length; i++) {
        if (flatRollIdx >= 21) break; 
        let frameData = frames[i]; 
        if (i < 9) { // Frames 1-9
            if (frameData.type === 'strike') {
                if (flatRollIdx < 21) game[flatRollIdx++] = 10; 
            } else { 
                if (flatRollIdx < 21) game[flatRollIdx++] = frameData.rolls[0] === undefined ? null : frameData.rolls[0];
                if (flatRollIdx < 21) game[flatRollIdx++] = frameData.rolls[1] === undefined ? null : frameData.rolls[1];
            }
        } else { // 10th Frame
            for (let r = 0; r < frameData.rolls.length; r++) {
                if (flatRollIdx < 21) {
                    game[flatRollIdx++] = frameData.rolls[r] === undefined ? null : frameData.rolls[r];
                }
            }
        }
    }
        
    console.log("Generated game (flat actual rolls, null-padded):", game); 
    return game; 
}

function calculateScore(game) {
    console.log("calculateScore called with game (flat rolls array):", game);
    let score = 0;
    let rollIndex = 0;

    for (let frame = 0; frame < 10; frame++) {
        if (rollIndex >= game.length || game[rollIndex] === null) {
            break; 
        }

        let roll1 = game[rollIndex];

        if (roll1 === 10) { // Strike
            let bonus1 = (rollIndex + 1 < game.length && game[rollIndex + 1] !== null) ? game[rollIndex + 1] : 0;
            let bonus2 = (rollIndex + 2 < game.length && game[rollIndex + 2] !== null) ? game[rollIndex + 2] : 0;
            score += 10 + bonus1 + bonus2;
            rollIndex += 1; 
        } else if (rollIndex + 1 < game.length && game[rollIndex + 1] !== null && (roll1 + game[rollIndex + 1] === 10)) { // Spare
            let bonus1 = (rollIndex + 2 < game.length && game[rollIndex + 2] !== null) ? game[rollIndex + 2] : 0;
            score += 10 + bonus1;
            rollIndex += 2; 
        } else { // Open Frame
            let currentRoll1Value = (roll1 === null ? 0 : roll1);
            let roll2Value = 0;
            if (rollIndex + 1 < game.length && game[rollIndex + 1] !== null) {
                roll2Value = game[rollIndex + 1];
            }
            score += currentRoll1Value + roll2Value;
            rollIndex += 2; 
        }
    }
    return score;
}

function displayGame(game, score) {
    console.log("displayGame received game (flat rolls array):", game); 
    const gameDisplayDiv = document.getElementById('gameDisplay');
    const totalScoreDiv = document.getElementById('totalScore'); // Corrected variable name

    if (gameDisplayDiv) {
        gameDisplayDiv.innerHTML = ''; // Clear previous display
        let rollIndex = 0;

        for (let frameNumber = 1; frameNumber <= 10; frameNumber++) {
            const frameDiv = document.createElement('div');
            frameDiv.classList.add('frame');

            const frameTitle = document.createElement('h3');
            frameTitle.textContent = `Frame ${frameNumber}`;
            frameDiv.appendChild(frameTitle);

            const rollsDisplayContainer = document.createElement('div');
            rollsDisplayContainer.classList.add('rolls-display');

            const createRollSpan = (text) => {
                const span = document.createElement('span');
                span.classList.add('roll');
                span.textContent = text;
                return span;
            };
            
            if (frameNumber < 10) { // Frames 1-9
                if (rollIndex >= game.length || game[rollIndex] === null) {
                    rollsDisplayContainer.appendChild(createRollSpan('-'));
                    rollsDisplayContainer.appendChild(createRollSpan('-'));
                    // rollIndex += 2; // Advance even for empty frames to show 10 frames
                } else {
                    let roll1 = game[rollIndex];
                    if (roll1 === 10) { // Strike
                        rollsDisplayContainer.appendChild(createRollSpan('')); // First box empty for strike
                        rollsDisplayContainer.appendChild(createRollSpan('X'));
                        rollIndex += 1; 
                    } else {
                        let roll2 = (rollIndex + 1 < game.length) ? game[rollIndex + 1] : null;
                        rollsDisplayContainer.appendChild(createRollSpan(roll1 === null ? '-' : roll1));
                        if (roll1 !== null && roll2 !== null && roll1 + roll2 === 10) { // Spare
                            rollsDisplayContainer.appendChild(createRollSpan('/'));
                        } else {
                            rollsDisplayContainer.appendChild(createRollSpan(roll2 === null ? '-' : roll2));
                        }
                        rollIndex += 2;
                    }
                }
            } else { // Frame 10
                let r1 = (rollIndex < game.length) ? game[rollIndex] : null;
                let r2 = (rollIndex + 1 < game.length) ? game[rollIndex + 1] : null;
                let r3 = (rollIndex + 2 < game.length) ? game[rollIndex + 2] : null;

                // Roll 1
                rollsDisplayContainer.appendChild(createRollSpan(r1 === 10 ? 'X' : (r1 === null ? '-' : r1)));
                
                // Roll 2
                let r2Display = '-';
                if (r2 !== null) {
                    if (r1 === 10 && r2 === 10) r2Display = 'X';       // Case: X X
                    else if (r1 === 10 && r2 < 10) r2Display = r2;      // Case: X Y
                    else if (r1 < 10 && r1 + r2 === 10) r2Display = '/';// Case: Y / (Spare)
                    else r2Display = r2;                                // Case: Y Z (Open)
                }
                rollsDisplayContainer.appendChild(createRollSpan(r2Display));
                
                // Roll 3 (Bonus)
                let r3Display = ''; // Empty if not applicable
                if (r1 === 10 || (r1 !== null && r1 < 10 && r2 !== null && r1 + r2 === 10)) { // Eligible for 3rd ball
                    r3Display = '-'; // Default to '-' if eligible but no roll / null
                    if (r3 !== null) {
                        if (r2 === 10 && r3 === 10) r3Display = 'X';                // Case: X X X
                        else if (r2 === 10 && r3 < 10) r3Display = r3;               // Case: X X Z
                        else if (r2 < 10 && (r1 === 10 || r1 + r2 === 10) && r2 + r3 === 10) r3Display = '/'; // Case: X Y / or Y / /
                        else r3Display = r3;                                         // Case: X Y Z or Y / Z
                    }
                }
                rollsDisplayContainer.appendChild(createRollSpan(r3Display));
                rollIndex = game.length; // Ensure we don't process past game array for 10th
            }
            frameDiv.appendChild(rollsDisplayContainer);
            gameDisplayDiv.appendChild(frameDiv);
        }
    } else {
        console.error("gameDisplay element not found");
    }

    if (totalScoreDiv) { 
        totalScoreDiv.textContent = "Total Score: " + score; 
    } else {
        console.error("totalScore element not found");
    }
}

// Input validation function
function validateInputs(strikes, spares, avgFirstBall) {
    if (isNaN(strikes) || strikes < 0 || strikes > 12) {
        alert("Number of strikes must be between 0 and 12.");
        return false;
    }
    if (isNaN(spares) || spares < 0 || spares > (12 - strikes)) { 
        alert(`Number of spares must be between 0 and ${Math.max(0, 12 - strikes)} (given ${strikes} strikes).`);
        return false;
    }
    if (isNaN(avgFirstBall) || avgFirstBall < 0 || avgFirstBall > 9) {
        alert("Average 1st ball pins must be between 0 and 9.");
        return false;
    }
    return true;
}

// Main function to generate and display the game
function generateAndDisplayGame() {
    const strikesInput = document.getElementById('strikes');
    const sparesInput = document.getElementById('spares');
    const avgFirstBallInput = document.getElementById('avgFirstBall');

    const strikes = parseInt(strikesInput.value); 
    const spares = parseInt(sparesInput.value);   
    const avgFirstBall = parseInt(avgFirstBallInput.value); 

    if (!validateInputs(strikes, spares, avgFirstBall)) {
        return; 
    }

    console.log("User Inputs -- Strikes:", strikes, "Spares:", spares, "Avg 1st Ball:", avgFirstBall);

    const gameRolls = generateGame(strikes, spares, avgFirstBall);
    const currentScore = calculateScore(gameRolls);
    console.log("Calculated Score:", currentScore); 
    displayGame(gameRolls, currentScore);
}

// Event Listener for the button
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.addEventListener('click', generateAndDisplayGame);
    } else {
        console.error("Generate button not found!");
    }
});
