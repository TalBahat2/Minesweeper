'use strict'

// global vars
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIFE: 2
};
var gGame;
var gIntervalId;
var gElHint;

const MINE = '💣';
const FLAG = '🎏';

// restart local storage:
// localStorage.removeItem('recordEasy')
// localStorage.removeItem('recordMedium')
// localStorage.removeItem('recordHard')

// TODO model:
// maybe integrate victory and lose check functions.
// integrate the init with restart (a lot of double code lines)

// TODO dom:
// cells keep size
// timer - not move
// add my name at the footer

// bonus: 
// 7 boom


function initGame() {
    gGame = {
        isOn: false,
        shownNumsCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lifeCount: gLevel.LIFE,
        isHintOn: false,
        safeClicksAvailable: 3,
        isManualPosOn: false,
        minesToPos: gLevel.MINES,
        stepsPositions: [],
        isSevenBoomOn: false
    }
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    changeDefaultOfRightClick(gBoard);
    clearInterval(gIntervalId);
    showRecord();
    // printBoard(gBoard);

}

function changeLevel(size, minesCount, lifeCount) {
    gLevel.SIZE = size;
    gLevel.MINES = minesCount;
    gLevel.LIFE = lifeCount;
    restart();
}

function restart() {
    gGame = {
        isOn: false,
        shownNumsCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lifeCount: gLevel.LIFE,
        isHintOn: false,
        safeClicksAvailable: 3,
        isManualPosOn: false,
        minesToPos: gLevel.MINES,
        stepsPositions: [],
        isSevenBoomOn: false
    }
    if (gLevel.LIFE === 3) show('.life2');
    else hide('.life2');
    show('.life1');
    show('.life0');
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 0;
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    changeDefaultOfRightClick(gBoard);
    clearInterval(gIntervalId);
    var elRestartButton = document.querySelector('.restart-button');
    elRestartButton.innerText = '🙂';
    var elHints = document.querySelectorAll('.hint');
    console.log(elHints);
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].style.display = 'inline-block';
        elHints[i].style.backgroundColor = '';

    }
    var elSafeClicksCount = document.querySelector('.safe-clicks-count');
    elSafeClicksCount.innerText = gGame.safeClicksAvailable;
    showRecord();

}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i].push(cell);
        }
    }

    return board;
}

function locateMines(board, minesCount, cellI, cellJ) {
    var allLocations = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (cellI === i && cellJ === j) continue;
            allLocations.push({ i: i, j: j });
        }
    }

    for (var i = 0; i < minesCount; i++) {
        var randomLocation = allLocations.splice(getRandomInt(0, allLocations.length), 1)[0];
        board[randomLocation.i][randomLocation.j].isMine = true;
    }

    return board;
}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var tdId = `cell-${i}-${j}`;
            strHTML += `<td id="${tdId}" class="cell" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

function changeDefaultOfRightClick(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var elCell = document.getElementById(`cell-${i}-${j}`);
            elCell.addEventListener("contextmenu", e => e.preventDefault());
        }
    }
}

function setMinesNegsCount(gBoard) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countNeighbors(i, j, gBoard);
        }
    }
}

function countNeighbors(cellI, cellJ, board) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function cellClicked(elCell, cellI, cellJ) {
    if (gGame.isManualPosOn) {
        setMineManually(cellI, cellJ);
        return;
    }
    checkFirstClick(cellI, cellJ);
    if (!gGame.isOn) return;
    if (gGame.isHintOn) {
        showNeighbors(cellI, cellJ);
        return;
    }
    var cell = gBoard[cellI][cellJ];
    if (cell.isMarked || cell.isShown) return;

    cell.isShown = true;
    gGame.stepsPositions.push({ i: cellI, j: cellJ });
    elCell.style.backgroundColor = 'lightgrey';
    if (!cell.isMine) {
        // model
        gGame.shownNumsCount++;
        // dom
        if (cell.minesAroundCount !== 0) elCell.innerText = cell.minesAroundCount;
        else expandShown(gBoard, cellI, cellJ);

    } else {
        // model
        gGame.lifeCount--;
        hideHeart();
        // dom
        elCell.innerText = MINE;
        checkLose();
    }
    checkVictory();
}

function cellMarked(elCell, cellI, cellJ) {
    checkFirstClick(cellI, cellJ);
    if (!gGame.isOn) return;
    var cell = gBoard[cellI][cellJ];
    if (cell.isShown) return;
    if (!cell.isMarked) {
        //model
        cell.isMarked = true;
        gGame.markedCount++;
        // dom
        elCell.innerText = FLAG;

        checkVictory();
    } else {
        //model
        gBoard[cellI][cellJ].isMarked = false;
        gGame.markedCount--;
        console.log(gGame.markedCount);
        // dom
        elCell.innerText = '';
    }
}

function checkFirstClick(cellI, cellJ) {
    if (!gGame.minesToPos) return; // it means we are in manual mode
    if (gGame.isSevenBoomOn) return;
    if (gGame.shownNumsCount === 0 &&
        gGame.markedCount === 0 &&
        gGame.lifeCount === gLevel.LIFE &&
        !gGame.isOn) {
        gGame.isOn = true;
        gBoard = locateMines(gBoard, gLevel.MINES, cellI, cellJ);
        setMinesNegsCount(gBoard);
        startTimer();
        printBoard(gBoard);
    }
}

function startTimer() {
    var elTimer = document.querySelector('.timer');
    var startTime = Date.now();
    gIntervalId = setInterval(function () {
        var currTime = Math.floor((Date.now() - startTime) / 1000);
        // model
        gGame.secsPassed = currTime;
        // dom
        elTimer.innerText = currTime;
    }, 1000);
}

function checkVictory() {
    var shownMinesCount = gLevel.LIFE - gGame.lifeCount;
    if (gGame.markedCount === gLevel.MINES - shownMinesCount &&
        gGame.shownNumsCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        gGame.isOn = false;
        clearInterval(gIntervalId);
        var elRestartButton = document.querySelector('.restart-button');
        elRestartButton.innerText = '😎';
        console.log('victory');
        updaterecord();
    }
}

function checkLose() {
    if (gGame.lifeCount !== 0) return;

    gGame.isOn = false;
    clearInterval(gIntervalId);
    var elRestartButton = document.querySelector('.restart-button');
    elRestartButton.innerText = '😢';
    console.log('you lost');
    revealAllMines();
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            var elCell = getCellByCoords(i, j);
            if (cell.isMine && !cell.isShown && !cell.isMarked) {
                elCell.innerText = MINE;
            } else if (cell.isMarked && !cell.isMine) {
                elCell.innerText = '❌';
            }
        }
    }
}

function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var elCurrCell = getCellByCoords(i, j);
            if (!board[i][j].isMine) cellClicked(elCurrCell, i, j);
        }
    }
}

function getCellByCoords(cellI, cellJ) {
    var id = `cell-${cellI}-${cellJ}`;
    var elCell = document.getElementById(id);
    return elCell;
}

function printBoard(board) {
    var boardToPresent = [];
    for (var i = 0; i < board.length; i++) {
        boardToPresent.push([]);
        for (var j = 0; j < board.length; j++) {
            boardToPresent[i].push(board[i][j].minesAroundCount);
            if (board[i][j].isMine) boardToPresent[i][j] = '💣';
        }
    }
    console.table(boardToPresent);
}

function hideHeart() {
    var currHeartSelector = '.life' + gGame.lifeCount;
    hide(currHeartSelector);
}

function showHeart() {
    var currHeartSelector = '.life' + gGame.lifeCount;
    show(currHeartSelector);
}

function updaterecord() {
    switch (gLevel.SIZE) {
        case 4:
            if (localStorage.recordEasy) {
                if (gGame.secsPassed < localStorage.recordEasy) {
                    localStorage.recordEasy = gGame.secsPassed;
                }
            } else localStorage.recordEasy = gGame.secsPassed;
            break;
        case 8:
            if (localStorage.recordMedium) {
                if (gGame.secsPassed < localStorage.recordMedium) {
                    localStorage.recordMedium = gGame.secsPassed;
                }
            } else localStorage.recordMedium = gGame.secsPassed;
            break;
        case 12:
            if (localStorage.recordHard) {
                if (gGame.secsPassed < localStorage.recordHard) {
                    localStorage.recordHard = gGame.secsPassed;
                }
            } else localStorage.recordHard = gGame.secsPassed;
            break;
    }
    showRecord();
}

function showRecord() {
    var elRecord = document.querySelector('.record');
    switch (gLevel.SIZE) {
        case 4:
            elRecord.innerText = (localStorage.recordEasy) ? localStorage.recordEasy : 0;
            break;
        case 8:
            elRecord.innerText = (localStorage.recordMedium) ? localStorage.recordMedium : 0;
            break;
        case 12:
            elRecord.innerText = (localStorage.recordHard) ? localStorage.recordHard : 0;
            break;
    }
}

function hintClicked(elHint) {
    gElHint = elHint;
    gElHint.style.backgroundColor = 'yellow';
    gGame.isHintOn = true;
}

function showNeighbors(cellI, cellJ) {
    var shownCellsCoords = [];
    // show self and neighbors
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var cell = gBoard[i][j];
            if (cell.isShown) continue;
            var elCell = getCellByCoords(i, j);
            if (cell.isMine) elCell.innerText = MINE;
            else elCell.innerText = cell.minesAroundCount;
            shownCellsCoords.push({ i: i, j: j });
        }
    }

    setTimeout(stopShowingNeighbors, 1000, shownCellsCoords);
    gElHint.style.display = 'none';
    gGame.isHintOn = false;
}

function stopShowingNeighbors(shownCellsCoords) {
    console.log(shownCellsCoords);
    for (var i = 0; i < shownCellsCoords.length; i++) {
        var currPos = shownCellsCoords[i];
        if (gBoard[currPos.i][currPos.j].isShown) continue;
        var elCell = getCellByCoords(currPos.i, currPos.j);
        elCell.innerText = '';
    }
}

function showSafeClick() {
    if (!gGame.safeClicksAvailable) return;
    var safePositions = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isMine && !cell.isShown) safePositions.push({ i: i, j: j });
        }
    }
    console.log(safePositions.length);
    if (!safePositions.length) return;
    gGame.safeClicksAvailable--;
    var elSafeClicksCount = document.querySelector('.safe-clicks-count');
    elSafeClicksCount.innerText = gGame.safeClicksAvailable;
    var randomIdx = getRandomInt(0, safePositions.length);
    var randomSafePos = safePositions.splice(randomIdx, 1)[0];
    var elCell = getCellByCoords(randomSafePos.i, randomSafePos.j);
    elCell.style.backgroundColor = 'yellow';
    setTimeout(function () {
        if (elCell.style.backgroundColor === 'yellow') elCell.style.backgroundColor = '';
    }, 2000, elCell);
}

function positionMinesManuallyOn() {
    restart();
    gGame.isManualPosOn = true;
    // gLevel.MINES;
}

function setMineManually(cellI, cellJ) {
    console.log('mines to pos', gGame.minesToPos)
    if (gBoard[cellI][cellJ].isMine) return;
    gBoard[cellI][cellJ].isMine = true;
    if (gGame.minesToPos === 1) {
        gGame.isManualPosOn = false;
        gGame.isOn = true;
        setMinesNegsCount(gBoard);
        startTimer();
        printBoard(gBoard);
    }
    gGame.minesToPos--;
}

function undo() {
    if (!gGame.stepsPositions.length || !gGame.isOn) return;
    var lastPos = gGame.stepsPositions.pop();
    var lastcell = gBoard[lastPos.i][lastPos.j];
    var elLastCell = getCellByCoords(lastPos.i, lastPos.j);

    if (!lastcell.isMine) gGame.shownNumsCount--;
    else {
        showHeart();
        gGame.lifeCount++;
    }

    // for all:
    elLastCell.style.backgroundColor = '';
    elLastCell.innerText = '';
    lastcell.isShown = false;

    // console.log(cell);
}

function sevenBoom() {
    restart();
    gGame.isSevenBoomOn = true;
    var positions = [];
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (count % 7 === 0 ||
                count / 10 === 7 ||
                count % 10 === 7)
                positions.push({ i: i, j: j });
            count++;
        }
    }
    console.log(positions);
    
    // place mines:
    for (var i = 0; i < positions.length; i++) {
        var currPos = positions[i];
        gBoard[currPos.i][currPos.j].isMine = true;
    }

    gLevel.MINES = positions.length;
    gGame.isOn = true;
    setMinesNegsCount(gBoard);
    startTimer();
    printBoard(gBoard);
}