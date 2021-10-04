'use strict'

// global vars
var gBoard;
var gLevel;
var gGame;

const MINE = '💣';

function initGame() {

    gLevel = {
        SIZE: 4,
        MINES: 2
    }

    gBoard = buildBoard(gLevel.SIZE);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    console.table(gBoard);

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
            allLocations.push({ i:i, j:j });
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
            strHTML += `<td id="${tdId}" class="cell" onclick="cellClicked(this, ${i}, ${j})">${cellContent}</td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
    console.log(elContainer);
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

function cellClicked(elCell, cellI, cellJ) {
    // console.log('cellClickedId: ', cellI, cellJ);
    // console.log('cellClickedId: ', elCell.id);

    if (!gBoard[cellI][cellJ].isMine) {
        // model
        gBoard[cellI][cellJ].isShown = true;

        // dom
        elCell.innerText = gBoard[cellI][cellJ].minesAroundCount;
    }
}

