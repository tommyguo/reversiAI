// run this program without playing the game to flesh out the Monte Carlo Tree
// reads data from tree.json and records data in tree.json

const Tree = require('./monteCarloTree.js').Tree;
const Node = require('./monteCarloTree.js').Node;
const fs = require('fs');
const rev = require('./reversiHelperFunctions.js');
const readlineSync = require('readline-sync');

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
      return new Node(moveObj.move, moveObj.winCount, moveObj.playCount, moveObj.moves, moveObj.letter);
    });
    // recursively run popTree() on every move Node in array of moves
    moveNode.moves.forEach(moveNode => {
      popTree(moveNode);
    });
  }
}

// loads existing tree located in tree.json
const data = fs.readFileSync(__dirname + "/tree.json", 'utf8');

// treeObj is an object literal with moves property, an array of move object literals
const treeObj = JSON.parse(data);
// convert treeObj's move object literals into move Nodes
popTree(treeObj);

// convert treeObj to a tree of Tree class — now we have converted all json data into workable objects
const tree = new Tree(treeObj.moves, treeObj.playCount);


// how many loops of Monte Carlo Tree Search you want to run
const NUMBER_OF_LOOPS = readlineSync.question('Enter the number of trials?: ');

for (let i = 0; i < NUMBER_OF_LOOPS; i++) {
  // generate new board to run monte carlo tree search
  const width = 8;
  let board = rev.generateBoard(width, width);
  board = rev.setBoardCell(board, 'O', width / 2, width / 2);
  board = rev.setBoardCell(board, 'O', width / 2 - 1, width / 2 - 1);
  board = rev.setBoardCell(board, 'X', width / 2 - 1, width / 2);
  board = rev.setBoardCell(board, 'X', width / 2, width / 2 - 1);
  let currentLetter = "X";

  // keeps track of what node is currently selected
  let currentNode = tree;
  // records nodes that have been "played" for back-propagation phase
  const playedNodes = [];



  // selection phase — starting from root, continue picking most promising node until you
  // reach a node where not all valid moves are child nodes

  // gets the upper bound confidence interval of a move, using the UCB1 algorithm
  function getCI(move) {
    return move.winCount / move.playCount + Math.sqrt(2 * Math.log(tree.playCount) / move.playCount);
  }
  // plays a letter on the board
  function playMoveRowCol(board, letter, row, col){
      board = rev.setBoardCell(board, letter, row, col);
      const cellsToFlip = rev.getCellsToFlip(board, row, col);
      board = rev.flipCells(board, cellsToFlip);
      return board;
  }

  //console.log("in selection phase");
  let notFound = true;
  while (notFound) {
    // checks if there is a "pass" condition — then # of moves = 1, but # of validMoves = 0
    if (rev.getValidMoves(board, currentLetter).length === 0) {
      // if # of moves = 1, advance currentNode to the pass node and continue running the loop
      if (currentNode.moves.length === 1) {
        currentNode = currentNode.moves[0];
        playedNodes.push(currentNode);
        if (currentLetter === "X") {
          currentLetter = "O";
        }
        else {
          currentLetter = "X";
        }
      }
      else if (currentNode.moves.length === 0) {
        notFound = false;
      }
      else {
        console.log("ERROR DEALING WITH PASS CONDITION");
        return;
      }
      // if # of moves = 0, then pass node is yet to be added so stop it there
    }
    // checks if number of child nodes === number of valid moves and continues selecting best child
    else if (currentNode.moves.length === rev.getValidMoves(board, currentLetter).length) {
      // use UCB1 algorithm to pick the best node to proceed to
      const bestMove = currentNode.moves.reduce((bestMove, move) => {
        if (getCI(move) > getCI(bestMove)) {
          return move;
        }
        else {
          return bestMove;
        }
      });
      // after choosing the node, update the currentNode, play the move, and record it
      currentNode = bestMove;
      const currentNodeMove = rev.algebraicToRowCol(currentNode.move);
      board = playMoveRowCol(board, currentLetter, currentNodeMove.row, currentNodeMove.col);
      playedNodes.push(currentNode);
      // switch currentLetter
      if (currentLetter === "X") {
        currentLetter = "O";
      }
      else {
        currentLetter = "X";
      }
    }
    // if there is no pass condition and not all child nodes have been visited,
    // then you have found your node so stop
    else {
      notFound = false;
    }
  }
  //console.log("selected move:", currentNode);


  // expansion phase — choose an unvisited child node
  //console.log("in expansion phase");
  // checks if there is a "pass" condition — then no valid moves, but a pass node should still be created,
  // currentLetter should be switched, and then proceed normally
  if (rev.getValidMoves(board, currentLetter).length === 0) {
    const passedMoveNode = new Node("pass", 0, 0, [], currentLetter);
    currentNode.moves.push(passedMoveNode);
    playedNodes.push(passedMoveNode);
    if (currentLetter === "X") {
      currentLetter = "O";
    }
    else {
      currentLetter = "X";
    }
    currentNode = currentNode.moves[0];
  }

  // checks for second "pass" — at this point, game ends
  if (rev.getValidMoves(board, currentLetter).length === 0) {
    const passedMoveNode = new Node("pass", 0, 0, [], currentLetter);
    currentNode.moves.push(passedMoveNode);
    playedNodes.push(passedMoveNode);
    let result;
    if (rev.getLetterCounts(board)["X"] > rev.getLetterCounts(board)["O"]) {
      result = 1;
    }
    else if (rev.getLetterCounts(board)["X"] === rev.getLetterCounts(board)["O"]) {
      result = 0.5;
    }
    else {
      result = 0;
    }
    tree.playCount ++;
    playedNodes.forEach(moveNode => {
      moveNode.playCount ++;
      if (moveNode.letter === "X") {
        moveNode.winCount += result;
      }
      else if (moveNode.letter === "O") {
        moveNode.winCount += (1 - result);
      }
      else {
        console.log("incorrect letter");
        return;
      }
    });
    continue;
  }

  // proceed normally — pick an unvisited child node
  const visitedMoves = currentNode.moves.map(moveNode => {
    return moveNode.move;
  });
  const unvisitedMoves = rev.getValidMoves(board, currentLetter).filter(move => {
    return visitedMoves.indexOf(rev.rowColToAlgebraic(move[0], move[1])) < 0;
  });

  // randomly pick an unvisited move and turn it into a node
  const unvisitedMove = unvisitedMoves[Math.floor(Math.random() * unvisitedMoves.length)];
  const unvisitedMoveNode = new Node(rev.rowColToAlgebraic(unvisitedMove[0], unvisitedMove[1]), 0, 0, [], currentLetter);

  // record the move in moves property of previous move and also in playedNodes
  currentNode.moves.push(unvisitedMoveNode);
  playedNodes.push(unvisitedMoveNode);
  //console.log("picked move:", unvisitedMoveNode.move);


  // simulation phase — play out moves starting from unvisitedMove

  // in the context of this function, play out simluation as if "computer" is playing
  // the unvisitedMove and "player" is the opponent
  //console.log("in simulation phase");
  function playout(board, computerLetter, move) {
    let playerLetter;
    if (computerLetter === "O") {
      playerLetter = "X";
    }
    else {
      playerLetter = "O";
    }
    // plays first move
    let newBoard = playMoveRowCol(board, currentLetter, move[0], move[1]);

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
    // returns result: win = 1, tie = 0.5, loss = 0;
    if (rev.getLetterCounts(newBoard)["X"] > rev.getLetterCounts(newBoard)["O"]) {
      return 1;
    }
    else if (rev.getLetterCounts(newBoard)["X"] === rev.getLetterCounts(newBoard)["O"]) {
      return 0.5;
    }
    else {
      return 0;
    }
  }

  // record the result of the playout
  const result = playout(board, currentLetter, unvisitedMove);



  // back-propagation phase — update play counts and win counts of played nodes
  //console.log("in back-propagation phase");
  tree.playCount ++;
  playedNodes.forEach(moveNode => {
    moveNode.playCount ++;
    if (moveNode.letter === "X") {
      moveNode.winCount += result;
    }
    else if (moveNode.letter === "O") {
      moveNode.winCount += (1 - result);
    }
    else {
      console.log("error with letter");
      return;
    }
  });

  console.log("running trial number ", i + 1);
}



// record results in json file
fs.writeFile("tree.json", JSON.stringify(tree), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Recorded moves");
});
