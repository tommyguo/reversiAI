// run this program to play reversi game with AI

const rev = require('./reversiHelperFunctions.js');
const readlineSync = require('readline-sync');
const AI = require('./reversiAI.js');

// plays move based on algebraic notation, flips cells, prints board and score
function playMove(board, letter, algebraicNotation){
    const rowCol = rev.algebraicToRowCol(algebraicNotation);
    board = rev.setBoardCell(board, letter, rowCol.row, rowCol.col);
    const cellsToFlip = rev.getCellsToFlip(board, rowCol.row, rowCol.col);
    board = rev.flipCells(board, cellsToFlip);
    console.log("\n\n\n");
    console.log(rev.boardToString(board) + "\n");
    console.log("Score: ");
    console.log("======");
    console.log("X:", rev.getLetterCounts(board).X);
    console.log("O:", rev.getLetterCounts(board).O);
    console.log();
    return board;
}

// plays move based on row/column notation, flips cells, prints board and score
function playMoveRowCol(board, letter, row, col){
    board = rev.setBoardCell(board, letter, row, col);
    const cellsToFlip = rev.getCellsToFlip(board, row, col);
    board = rev.flipCells(board, cellsToFlip);
    console.log("\n\n\n");
    console.log(rev.boardToString(board) + "\n");
    console.log("Score: ");
    console.log("======");
    console.log("X:", rev.getLetterCounts(board).X);
    console.log("O:", rev.getLetterCounts(board).O);
    console.log();
    return board;
}

// start of interactive game
function interactiveGame(board, playerLetter, computerLetter, turn, currentNode) {
  let passCount = 0;
  while(!rev.isBoardFull(board) && passCount < 2) {
    // asks player for move if it is player turn
    if (turn === "player") {
      console.log("Player's turn");
      // checks if there are valid player moves and passes if there is not
      if (rev.getValidMoves(board, playerLetter).length === 0) {
        console.log("No available player moves");
        readlineSync.question('Press <ENTER> to pass.');
        passCount ++;
        turn = "computer";
        continue;
      }
      else {
        passCount = 0;
        // asks player for move
        let validMove = false;
        while(!validMove) {
          const answer = readlineSync.question('What is your move?: ');
          // checks if entered move is in algebraic notation
          try {
            rev.isValidMoveAlgebraicNotation(board, playerLetter, answer);
          }
          catch (err) {
            console.log("\n\nINVALID MOVE. Your move should:" +
            "\n* be in algebraic notation" +
            "\n* specify an existing empty cell" +
            "\n* flip at least one of your opponent's pieces\n\n");
            continue;
          }
          // executes move if it is valid
          if (rev.isValidMoveAlgebraicNotation(board, playerLetter, answer)) {
            board = playMove(board, playerLetter, answer);
            currentNode = AI.recordPlayerMove(currentNode, answer);
            turn = "computer";
            validMove = true;
          }
          // asks user for move if it is not valid
          else {
            console.log("\n\nINVALID MOVE. Your move should:" +
            "\n* be in algebraic notation" +
            "\n* specify an existing empty cell" +
            "\n* flip at least one of your opponent's pieces\n\n");
          }
        }
      }
    }
    // asks computer for move if it is computer move
    else {
      console.log("Computer's turn");
      const moves = rev.getValidMoves(board, computerLetter);
      // checks if there are valid computer moves and passes if there is not
      if (moves.length === 0) {
        console.log("No available computer moves");
        readlineSync.question('Press <ENTER> for computer to pass.');
        passCount ++;
        turn = "player";
        continue;
      }
      // uses AI to choose a computer move
      else {
        readlineSync.question('Press <ENTER> to show computer move');
        passCount = 0;
        const move = AI.getComputerMove(board, computerLetter, currentNode);
        currentNode = AI.recordComputerMove(board, computerLetter, currentNode);
        board = playMoveRowCol(board, computerLetter, move.row, move.col);
        console.log("Computer played " + rev.rowColToAlgebraic(move.row, move.col));
        turn = "player";
      }
    }
  }
  // end of game, prints who won
    console.log("\n\n\n");
    console.log("GAME OVER");
    if (rev.getLetterCounts(board)[playerLetter] > rev.getLetterCounts(board)[computerLetter]) {
      console.log("Congratulaions! You won!");
    }
    else if (rev.getLetterCounts(board)[playerLetter] < rev.getLetterCounts(board)[computerLetter]) {
      console.log("Computer won! Try again!");
    }
    else {
      console.log("It's a tie!");
    }
    console.log("\n\n\n");
}

function main() {
  // initializes board and prints game name
  let board;
  let playerLetter;
  let computerLetter;
  let turn;
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
  // taken from http://patorjk.com/software/taag/#p=display&f=Train&t=Reversi
  console.log(`   ___                                              _
  | _ \\    ___    __ __    ___      _ _    ___     (_)
  |   /   / -_)   \\ V /   / -_)    | '_|  (_-<     | |
  |_|_\\   \\___|   _\\_/_   \\___|   _|_|_   /__/_   _|_|_
_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|_|\"\"\"\"\"|
\"\`-0-0-\'\"\`-0-0-\'\"\`-0-0-\'\"\`-0-0-'"\`-0-0-'"\`-0-0-\'\"\`-0-0-\'
  `);
  console.log("\n\n\n\n\n");

  // checks if config file exists and initializes game if it does

  const width = 8;
  let validLetter = false;
  // initialize player letter and computer letter
  while(!validLetter) {
    playerLetter = readlineSync.question('\nPick your letter/color: X (black)' +
    ' or O (white): ');
    if (playerLetter !== 'X' && playerLetter !== 'O') {
      continue;
    }
    else {
      if (playerLetter === 'X') {
        computerLetter = 'O';
        turn = "player";
      }
      else {
        computerLetter = 'X';
        turn = "computer";
      }
      validLetter = true;
    }
  }
  board = rev.generateBoard(width, width);
  // sets initial pieces on the board
  board = rev.setBoardCell(board, 'O', width / 2, width / 2);
  board = rev.setBoardCell(board, 'O', width / 2 - 1, width / 2 - 1);
  board = rev.setBoardCell(board, 'X', width / 2 - 1, width / 2);
  board = rev.setBoardCell(board, 'X', width / 2, width / 2 - 1);
  console.log('\nPlayer is', playerLetter);
  console.log("\n\n\n");
  console.log(rev.boardToString(board));
  const currentNode = AI.setUpTree();
  interactiveGame(board, playerLetter, computerLetter, turn, currentNode);
}

main();
