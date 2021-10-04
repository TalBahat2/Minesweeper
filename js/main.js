'use strict'

// global vars
var gBoard;
var gLevel;
var gGame;
var gIntervalId;

const MINE = '💣';
const FLAG = '🎏';

function initGame() {

    gLevel = {
        SIZE: 4,
        MINES: 2
    }

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    gBoard = buildBoard(gLevel.SIZE);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    changeDefaultOfRightClick(gBoard);
    console.table(gBoard);

}

function restart() {

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

    board = locateMines(board, gLevel.MINES);
    return board;
}

function locateMines(board, minesCount) {
    var allLocations = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
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
            var cell = board[i][j];
            var cellContent = (cell.isMine) ? MINE : cell.minesAroundCount;
            // add case for cell.minesAroundCount === 0;
            var tdId = `cell-${i}-${j}`;
            strHTML += `<td id="${tdId}" class="cell" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j}, event)"></td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
    console.log(elContainer);
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

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function cellClicked(elCell, cellI, cellJ, ev) {
    checkFirstClick();
    var cell = gBoard[cellI][cellJ];
    if(cell.isMarked) return;
    if (!cell.isMine) {
        // model
        cell.isShown = true;
        // dom
        elCell.innerText = cell.minesAroundCount;
        checkVictory();
    } else {
        // handle a bomb 
    }
}

function cellMarked(elCell, cellI, cellJ) {
    checkFirstClick();
    var cell = gBoard[cellI][cellJ];
    // if (the cell is revealed) return;
    if (!cell.isMarked) {
        //model
        cell.isMarked = true;
        // dom
        elCell.innerText = FLAG;
        checkVictory();
    } else {
        //model
        gBoard[cellI][cellJ].isMarked = false;
        // dom
        elCell.innerText = '';
    }
}

function checkFirstClick() {
    if(!gGame.isOn) {
        gGame.isOn = true;
        startTimer();
    }
}

function startTimer() {
    var elTimer = document.querySelector('.timer');
    var startTime = Date.now();
    gIntervalId = setInterval(function() {
        var currTime = Math.floor((Date.now() - startTime) / 1000);
        // console.log('currTime', currTime);
        elTimer.innerText = currTime;
    }, 1000);
}

function checkVictory() {
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
            
        }
}
