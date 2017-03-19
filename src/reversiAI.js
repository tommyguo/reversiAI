// AI that runs when playing game.js
// picks moves based on available data in tree.json
// when data becomes insufficient, uses Monte Carlo Tree Search with Upper Confidence bound applied to Trees

const rev = require('./reversiHelperFunctions.js');
const Node = require('./monteCarloTree.js').Node;
const Tree = require('./monteCarloTree.js').Tree;
const fs = require('fs');


// converts JSON data into Node objects
function popTree(moveNode) {
  // base case
  if (moveNode.moves.length === 0) {
    return;
  }
  // recursive case
  else {
    // convert move object literals to move nodes and assign the array back to moves property of move Node
    moveNode.moves = moveNode.moves.map(moveObj => {
      return new Node(moveObj.move, moveObj.winCount, moveObj.playCount, moveObj.moves);
    });
    // recursively run popTree() on every move Node in array of moves
    moveNode.moves.forEach(moveNode => {
      popTree(moveNode);
    });
  }
}

// takes data in tree.json and returns a tree object
function setUpTree() {
  // loads existing tree located in tree.json
  const data = fs.readFileSync(__dirname + "/tree.json", 'utf8');

  // treeObj is an object literal with moves property, an array of move object literals
  const treeObj = JSON.parse(data);
  // convert treeObj's move object literals into move Nodes
  popTree(treeObj);

  // convert treeObj to a tree of Tree class — now we have converted all json data into workable objects
  return new Tree(treeObj.moves, treeObj.playCount);
}

// plays a move — used for simulation
function playMoveRowCol(board, letter, row, col){
    board = rev.setBoardCell(board, letter, row, col);
    const cellsToFlip = rev.getCellsToFlip(board, row, col);
    board = rev.flipCells(board, cellsToFlip);
    return board;
}

// simulates the result of a move — can run multiple trials per move.
// default set at 30
// AI does this when data in tree.json becomes insufficient
function playout(board, computerLetter, moveNode) {
  let playerLetter;
  if (computerLetter === "O") {
    playerLetter = "X";
  }
  else {
    playerLetter = "O";
  }
  // plays first move
  board = playMoveRowCol(board, computerLetter, moveNode.move[0], moveNode.move[1]);
  const NUMBER_OF_MOVES = 30;
  // for each valid move, simulates NUMBER_OF_MOVES more moves
  for (let i = 0; i < NUMBER_OF_MOVES; i++) {
    let newBoard = board;
    let passCount = 0;
    let turn = "player";
    while (!rev.isBoardFull(newBoard) && passCount < 2) {
      // simulates player moves
      if (turn === "player") {
        const validMoves = rev.getValidMoves(newBoard, playerLetter);
        if (validMoves.length === 0) {
          passCount ++;
          turn = "computer";
          continue;
        }
        else {
          passCount = 0;
          const randMove = validMoves[Math.floor(Math.random()*(validMoves.length - 1))];
          newBoard = playMoveRowCol(newBoard, playerLetter, randMove[0], randMove[1]);
          turn = "computer";
        }
      }
      // simulates computer moves
      else {
        const validMoves = rev.getValidMoves(newBoard, computerLetter);
        if (validMoves.length === 0) {
          passCount ++;
          turn = "player";
          continue;
        }
        else {
          passCount = 0;
          const randMove = validMoves[Math.floor(Math.random()*(validMoves.length - 1))];
          newBoard = playMoveRowCol(newBoard, computerLetter, randMove[0], randMove[1]);
          turn = "player";
        }
      }
    }
    // updates performance of each node
    moveNode.playCount++;
    if (rev.getLetterCounts(newBoard)[playerLetter] < rev.getLetterCounts(newBoard)[computerLetter]) {
      moveNode.winCount += 1;
    }
    else if (rev.getLetterCounts(newBoard)[playerLetter] === rev.getLetterCounts(newBoard)[computerLetter]) {
      moveNode.winCount += 0.5;
    }
  }
  return moveNode;
}

// returns a computer move — either using tree.json data or calculates move on the spot
// in both cases, MCTS is used
function getComputerMove(board, computerLetter, currentNode) {
  // loads preset move if enough available data
  if (currentNode !== undefined && currentNode.playCount > 30 * rev.getValidMoves(board, computerLetter).length) {
    const bestMove = currentNode.moves.reduce((bestMove, move) => {
      if (move.getRatio() > bestMove.getRatio()) {
        return move;
      }
      else {
        return bestMove;
      }
    });
    return rev.algebraicToRowCol(bestMove.move);
  }
  // calculates new move if not enough available data
  else {
    let moves = rev.getValidMoves(board, computerLetter);
    // converts array of moves to move nodes
    moves = moves.map((move => new Node(move)));
    // calculate playouts for each branch
    moves = moves.map(moveBranch => playout(board, computerLetter, moveBranch));
    const bestMove = moves.reduce((bestMove, move) => {
      if (move.getRatio() > bestMove.getRatio()) {
        return move;
      }
      else {
        return bestMove;
      }
    });
    return {row: bestMove.move[0], col: bestMove.move[1]};
  }
}

//
function recordPlayerMove(currentNode, playerMove) {
  // sets currentNode to move node if it exists, else set it to undefined
  if (currentNode !== undefined) {
    let potentialNode = undefined;
    currentNode.moves.forEach(moveNode => {
      if (playerMove === moveNode.move) {
        potentialNode = moveNode;
      }
    });
    return potentialNode;
  }
}

function recordComputerMove(board, computerLetter, currentNode) {
  if (currentNode !== undefined && currentNode.playCount > 30 * rev.getValidMoves(board, computerLetter).length) {
    const bestMove = currentNode.moves.reduce((bestMove, move) => {
      if (move.getRatio() > bestMove.getRatio()) {
        return move;
      }
      else {
        return bestMove;
      }
    });
    return bestMove;
  }
  else {
    return undefined;
  }
}


module.exports = {
  getComputerMove: getComputerMove,
  setUpTree: setUpTree,
  recordPlayerMove: recordPlayerMove,
  recordComputerMove: recordComputerMove,
};
