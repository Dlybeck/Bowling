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
    let individualFrameScores = new Array(10).fill(0);
    let rollIndex = 0;

    for (let frame = 0; frame < 10; frame++) {
        if (rollIndex >= game.length || game[rollIndex] === null) {
            break; 
        }

        let roll1 = game[rollIndex];
        let frameScore = 0;

        if (roll1 === 10) { // Strike
            let bonus1 = (rollIndex + 1 < game.length && game[rollIndex + 1] !== null) ? game[rollIndex + 1] : 0;
            let bonus2 = (rollIndex + 2 < game.length && game[rollIndex + 2] !== null) ? game[rollIndex + 2] : 0;
            frameScore = 10 + bonus1 + bonus2;
            rollIndex += 1; 
        } else if (rollIndex + 1 < game.length && game[rollIndex + 1] !== null && (roll1 + game[rollIndex + 1] === 10)) { // Spare
            let bonus1 = (rollIndex + 2 < game.length && game[rollIndex + 2] !== null) ? game[rollIndex + 2] : 0;
            frameScore = 10 + bonus1;
            rollIndex += 2; 
        } else { // Open Frame
            let currentRoll1Value = (roll1 === null ? 0 : roll1);
            let roll2Value = 0;
            if (rollIndex + 1 < game.length && game[rollIndex + 1] !== null) {
                roll2Value = game[rollIndex + 1];
            }
            frameScore = currentRoll1Value + roll2Value;
            rollIndex += 2; 
        }
        individualFrameScores[frame] = frameScore;
    }

    let cumulativeFrameScores = new Array(10).fill(0);
    let currentTotalScore = 0;
    for (let i = 0; i < 10; i++) {
        currentTotalScore += individualFrameScores[i];
        cumulativeFrameScores[i] = currentTotalScore;
    }
    
    return cumulativeFrameScores;
}

function displayGame(game, cumulativeFrameScores) { 
    console.log("displayGame received game (flat rolls array):", game); 
    const gameDisplayDiv = document.getElementById('gameDisplay');
    const totalScoreDiv = document.getElementById('totalScore');

    if (gameDisplayDiv) {
        gameDisplayDiv.innerHTML = ''; // Clear previous display
        let rollIndex = 0; // Tracks current position in the 'game' array

        const createRollSpan = (text) => {
            const span = document.createElement('span');
            span.classList.add('roll');
            span.textContent = text;
            return span;
        };

        for (let frameNumber = 1; frameNumber <= 10; frameNumber++) {
            const frameDiv = document.createElement('div');
            frameDiv.classList.add('frame');

            const frameNumberDiv = document.createElement('div');
            frameNumberDiv.classList.add('frame-number');
            frameNumberDiv.textContent = frameNumber;
            frameDiv.appendChild(frameNumberDiv);

            const rollsDisplayContainer = document.createElement('div');
            rollsDisplayContainer.classList.add('rolls-display');

            let framePlayed = (rollIndex < game.length && game[rollIndex] !== null);

            if (frameNumber < 10) {
                if (framePlayed) {
                    let roll1 = game[rollIndex];
                    if (roll1 === 10) { // Strike
                        rollsDisplayContainer.appendChild(createRollSpan('')); 
                        rollsDisplayContainer.appendChild(createRollSpan('X'));
                        rollIndex += 1; 
                    } else {
                        let roll2 = (rollIndex + 1 < game.length) ? game[rollIndex + 1] : null;
                        rollsDisplayContainer.appendChild(createRollSpan(roll1)); // roll1 is not null here
                        if (roll2 !== null && roll1 + roll2 === 10) { // Spare
                            rollsDisplayContainer.appendChild(createRollSpan('/'));
                        } else {
                            rollsDisplayContainer.appendChild(createRollSpan(roll2 === null ? '-' : roll2));
                        }
                        rollIndex += 2;
                    }
                } else {
                    rollsDisplayContainer.appendChild(createRollSpan('-'));
                    rollsDisplayContainer.appendChild(createRollSpan('-'));
                }
            } else { // Frame 10
                let r1 = (rollIndex < game.length) ? game[rollIndex] : null;
                let r2 = (rollIndex + 1 < game.length) ? game[rollIndex + 1] : null;
                let r3 = (rollIndex + 2 < game.length) ? game[rollIndex + 2] : null;

                rollsDisplayContainer.appendChild(createRollSpan(r1 === 10 ? 'X' : (r1 === null ? '-' : r1)));
                
                let r2Text = '-';
                if (r2 !== null) {
                    if (r1 === 10 && r2 === 10) r2Text = 'X';       
                    else if (r1 === 10 && r2 < 10) r2Text = r2;     
                    else if (r1 < 10 && r1 + r2 === 10) r2Text = '/';
                    else r2Text = r2;                               
                }
                rollsDisplayContainer.appendChild(createRollSpan(r2Text));
                
                let r3Text = ''; 
                if (r1 === 10 || (r1 !== null && r1 < 10 && r2 !== null && r1 + r2 === 10)) { 
                    r3Text = '-'; 
                    if (r3 !== null) {
                        if (r2 === 10 && r3 === 10) r3Text = 'X'; // Covers X X X
                        else if (r2 === 10 && r3 < 10) r3Text = r3; // Covers X X 5
                        else if (r2 < 10 && r1 === 10 && r2 + r3 === 10) r3Text = '/'; // Covers X 5 /
                        else if (r2 < 10 && r1 < 10 && r1+r2 === 10 && r3 === 10) r3Text = 'X'; // Covers 5 / X
                        else if (r2 < 10 && r1 < 10 && r1+r2 === 10 && r3 < 10) r3Text = r3; // Covers 5 / 5
                        else r3Text = r3; // Covers X 5 2
                    }
                }
                rollsDisplayContainer.appendChild(createRollSpan(r3Text));
            }
            frameDiv.appendChild(rollsDisplayContainer);

            const frameScoreDiv = document.createElement('div');
            frameScoreDiv.classList.add('frame-score');
            // Display score if the frame was played (basic check: first roll of frame was not null)
            // More accurately, if cumulative score for this frame is available and meaningful
            let scoreToShow = cumulativeFrameScores[frameNumber - 1];
            let prevScore = frameNumber > 1 ? cumulativeFrameScores[frameNumber - 2] : 0;
            
            // Determine if the frame's first roll was actually processed by calculateScore
            // This is approximated by checking if rollIndex for this frame would have been valid
            let frameConsideredPlayedByScore = false;
            let tempRollIdx = 0;
            for(let k=0; k<frameNumber-1; k++){
                if(tempRollIdx >= game.length || game[tempRollIdx] === null) break;
                if(game[tempRollIdx] === 10) tempRollIdx +=1; else tempRollIdx +=2;
            }
            if(tempRollIdx < game.length && game[tempRollIdx] !== null) frameConsideredPlayedByScore = true;
            if (frameNumber === 1 && game[0] !== null) frameConsideredPlayedByScore = true;


            if (frameConsideredPlayedByScore || (scoreToShow > 0 && scoreToShow !== prevScore) || (scoreToShow === 0 && frameNumber === 1 && game[0]!==null) ) {
                frameScoreDiv.textContent = scoreToShow;
            } else {
                 // Check if all rolls for this frame in the 'game' array are null or beyond its length
                let currentFrameRollsStart = 0; 
                for(let k=0; k < frameNumber -1; k++){
                    if(frames[k] && frames[k].type === 'strike') currentFrameRollsStart +=1; else currentFrameRollsStart +=2;
                }
                if(!(currentFrameRollsStart < game.length && game[currentFrameRollsStart] !== null)){
                     frameScoreDiv.textContent = ''; // Keep empty if no rolls for this frame
                } else {
                     frameScoreDiv.textContent = scoreToShow;
                }
            }


            frameDiv.appendChild(frameScoreDiv);
            gameDisplayDiv.appendChild(frameDiv);
        }
    } else {
        console.error("gameDisplay element not found");
    }

    if (totalScoreDiv) { 
        let finalScore = 0;
        if (cumulativeFrameScores && cumulativeFrameScores.length > 0) {
            finalScore = cumulativeFrameScores[cumulativeFrameScores.length - 1]; 
        }
        totalScoreDiv.textContent = "Total Score: " + finalScore; 
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
    const cumulativeFrameScores = calculateScore(gameRolls); 
    console.log("Calculated Cumulative Scores:", cumulativeFrameScores); 
    displayGame(gameRolls, cumulativeFrameScores); 
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
