// contains helper methods used in game.js to create the reversi game

function repeat(value, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr[i] = value;
  }
  return arr;
}

// returns a one dimensional array with size equivalent to
// number of rows and columns specified, filled with initialCellValue
function generateBoard(rows, columns, initialCellValue) {
  // if no initialCellValue is given, defaults to " "
  if (initialCellValue === undefined) {
    return repeat(" ", rows * columns);
  }
  else {
    return repeat(initialCellValue, rows * columns);
  }
}

// returns index corresponding to rowNumber and columnNumber
// given, according to size of board
function rowColToIndex(board, rowNumber, columnNumber) {
  const side = Math.sqrt(board.length);
  return rowNumber * side + columnNumber;
}

// returns row and column number corresponding to index given
// according to size of board
function indexToRowCol(board, i) {
  const side = Math.sqrt(board.length);
  const rowCol = {
    row: Math.floor(i / side),
    col: i % side,
  };
  return rowCol;
}

// sets a position on the board to letter based on row and
// col given
function setBoardCell(board, letter, row, col) {
  const index = rowColToIndex(board, row, col);
  const boardCopy = [...board];
  boardCopy[index] = letter;
  return boardCopy;
}

// Returns object containing row and col properties corresponding
// to given algebraic notation
function algebraicToRowCol(algebraicNotation) {
  const stringArr = algebraicNotation.split("");
  // assumes row and column are less than or equal to 27, so
  // no two-letter column or three-digit row
  if (stringArr.length !== 2 && stringArr.length !== 3) {
    return undefined;
  }

  // checks if row is numeric
  let row = "";
  for(let i = 1; i < stringArr.length; i++) {
    if (stringArr[i].charCodeAt(0) < 48 || stringArr[i].charCodeAt(0) > 57) {
      return undefined;
    }
    row += stringArr[i];
  }
  row = parseInt(row);

  // checks if column is letter
  const column = stringArr[0];
  if (column.match(/[A-Z]/) === null) {
    return undefined;
  }

  // converts row and col to actual row and column numbers
  const rowNumber = row - 1;
  const columnNumber = column.charCodeAt(0) - 65;
  const rowCol = {
    row: rowNumber,
    col: columnNumber,
  };
  return rowCol;
}

// sets a position on the board to letter based on algebraic
// notation given
function placeLetter(board, letter, algebraicNotation) {
  const rowCol = algebraicToRowCol(algebraicNotation);
  return setBoardCell(board, letter, rowCol.row, rowCol.col);
}

// sets positions on the board to letter based on algebraic
// notations given
function placeLetters(board, letter, ...algebraicNotation) {
  for (let i = 0; i < algebraicNotation.length; i++) {
    board = placeLetter(board, letter, algebraicNotation[i]);
  }
  return board;
}

// converts array board to a string representation
function boardToString(board) {
  let stringBoard = "    ";
  const size = Math.sqrt(board.length);
  // adds row label
  for(let i = 0; i < size; i++) {
    stringBoard += " " + String.fromCodePoint(65+i) + "  ";
  }
  stringBoard += "\n";
  // adds border
  stringBoard += "   +";
  for(let i = 0; i < size; i++) {
    stringBoard += "---+";
  }
  stringBoard += "\n";

  for(let i = 0; i < size; i++) {
    // adds values
    if (i < 9) {
      stringBoard += " " + (i+1) + " |";
    }
    else {
      stringBoard += (i+1) + " |";
    }
    for(let j = 0; j < size; j++) {
      stringBoard += " " + board[rowColToIndex(board, i, j)] + " |";
    }
    stringBoard += "\n";
    // adds border
    stringBoard += "   +";
    for(let j = 0; j < size; j++) {
      stringBoard += "---+";
    }
    stringBoard += "\n";
  }
  return stringBoard;
}

// checks if board is full (no spaces)
function isBoardFull(board) {
  function isSpace(element) {
    return element === " ";
  }
  if (board.some(isSpace)) {
    return false;
  }
  else {
    return true;
  }

}

// flips 'X' to 'O' or vice versa at board position given
// by row and col. If position is neither 'X' nor 'O', does
// nothing
function flip(board, row, col) {
  const index = rowColToIndex(board, row, col);
  let boardCopy = [...board];
  if (boardCopy[index] === "X") {
    boardCopy = setBoardCell(boardCopy, "O", row, col);
    return boardCopy;
  }
  else if (boardCopy[index] === "O") {
    boardCopy = setBoardCell(boardCopy, "X", row, col);
    return boardCopy;
  }
  else {
    return boardCopy;
  }
}

// flips multiple cells based on flip function
function flipCells(board, cellsToFlip) {
  let boardCopy = [...board];
  for(let i = 0; i < cellsToFlip.length; i++) {
    for(let j = 0; j < cellsToFlip[i].length; j++) {
      const row = cellsToFlip[i][j][0];
      const col = cellsToFlip[i][j][1];
      boardCopy = flip(boardCopy, row, col);
    }
  }
  return boardCopy;
}

// returns array with row and column pairs that should be flipped
// based on last move given by lastRow and lastCol
function getCellsToFlip(board, lastRow, lastCol) {
  const size = Math.sqrt(board.length);
  const lastIndex = rowColToIndex(board, lastRow, lastCol);

  // finds flipped cells in a line
  function findCells(increment, stop) {
    const arr = [];
    let currentIndex = lastIndex + increment;
    // checks to see if first increment is out of bounds
    if (increment < 0 && currentIndex < stop) {
      return -1;
    }
    if (increment > 0 && currentIndex > stop) {
      return -1;
    }
    // checks to see if first increment is same or space
    if (board[currentIndex] === board[lastIndex]) {
      return -1;
    }
    const notFound = true;
    while(notFound) {
      // returns array when anchor is met
      if (board[currentIndex] === board[lastIndex]) {
        return arr;
      }
      // scraps array if anchor is not met and index reaches an empty space or
      // end of board
      else if (currentIndex === stop || board[currentIndex] === " "){
        return -1;
      }
      // adds cells to array if it's not space or anchor
      else {
        const pair = [indexToRowCol(board, currentIndex).row, indexToRowCol(board,
          currentIndex).col];
        arr.push(pair);
        currentIndex += increment;
      }
    }
  }

  const cells = [];
  let cellsToBeAdded;

  // finds left horizontal cells
  cellsToBeAdded = findCells(-1, lastRow * size);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // finds right horizontal cells
  cellsToBeAdded = findCells(1, (lastRow + 1) * size - 1);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // find top vertical cells
  cellsToBeAdded = findCells(-size, lastCol);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // finds bottom vertical cells
  cellsToBeAdded = findCells(size, lastCol + ((size - 1) * size));
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }

  // set up "stops" for diagonals
  let stopTopLeft;
  let stopBottomRight;
  let stopTopRight;
  let stopBottomLeft;

  if (lastRow >= lastCol) {
    stopTopLeft = (lastRow - lastCol) * size;
    stopBottomRight = size * size - 1 - (lastRow - lastCol);
  }
  else {
    stopTopLeft = lastCol - lastRow;
    stopBottomRight = size * size - 1 - (lastCol - lastRow) * size;
  }

  if (lastRow + lastCol < size) {
    stopTopRight = lastRow + lastCol;
    stopBottomLeft = (lastRow + lastCol) * size;
  }
  else {
    stopTopRight = size - 1 + size * (lastRow + lastCol - (size - 1));
    stopBottomLeft = size * (size - 1) + (lastRow + lastCol - (size - 1));
  }

  // finds top left diagonal cells
  cellsToBeAdded = findCells(-(size + 1), stopTopLeft);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // finds bottom right diagonal cells
  cellsToBeAdded = findCells(size + 1, stopBottomRight);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // finds top right diagonal cells
  cellsToBeAdded = findCells(-(size - 1), stopTopRight);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  // finds bottom left diagonal cells
  cellsToBeAdded = findCells(size - 1, stopBottomLeft);
  if (cellsToBeAdded !== -1) {
    cells.push(cellsToBeAdded);
  }
  return cells;
}

// checks if move is valid according to reversi rules
function isValidMove(board, letter, row, col) {
  const size = Math.sqrt(board);
  if (row < 0 || row >= size || col < 0 || col >= size) {
    return false;
  }
  const index = rowColToIndex(board, row, col);
  if (board[index] !== " ") {
    return false;
  }
  const boardCopy = setBoardCell(board, letter, row, col);
  const cellsToFlip = getCellsToFlip(boardCopy, row, col);
  if (cellsToFlip.length === 0) {
    return false;
  }
  else {
    return true;
  }
}

// checks if move in algebraic notation is valid
function isValidMoveAlgebraicNotation(board, letter, algebraicNotation) {
  const rowCol = algebraicToRowCol(algebraicNotation);
  return isValidMove(board, letter, rowCol.row, rowCol.col);
}

// counts how many Xs and Os are on the board
function getLetterCounts(board) {
  const count = {X: 0, O: 0};
  board.forEach(function(ele) {
    if (ele === 'X') {
      count.X ++;
    }
    else if (ele === 'O') {
      count.O ++;
    }
  });
  return count;
}

// returns array containing row/col pair of all valid moves
function getValidMoves(board, letter) {
  const validMoves = [];
  for(let i = 0; i < board.length; i++) {
    const rowCol = indexToRowCol(board, i);
    if(isValidMove(board, letter, rowCol.row, rowCol.col)) {
      validMoves.push([rowCol.row, rowCol.col]);
    }
  }
  return validMoves;
}

// converts row col to algebraic notation
function rowColToAlgebraic(row, col) {
  const letter = String.fromCharCode(col + 65);
  const number = row + 1;
  return letter + number;
}

module.exports = {
  repeat: repeat,
  generateBoard: generateBoard,
  rowColToIndex: rowColToIndex,
  indexToRowCol: indexToRowCol,
  setBoardCell: setBoardCell,
  algebraicToRowCol: algebraicToRowCol,
  placeLetter: placeLetter,
  placeLetters: placeLetters,
  boardToString: boardToString,
  isBoardFull: isBoardFull,
  flip: flip,
  flipCells: flipCells,
  getCellsToFlip: getCellsToFlip,
  isValidMove: isValidMove,
  isValidMoveAlgebraicNotation: isValidMoveAlgebraicNotation,
  getLetterCounts: getLetterCounts,
  getValidMoves: getValidMoves,
  rowColToAlgebraic: rowColToAlgebraic,
};
