// provides Node and Tree classes used in implementation of Monte Carlo Tree Search

// represent one move
class Node {
  constructor(move, winCount, playCount, moves, letter) {
    this.move = move;
    this.winCount = winCount;
    this.playCount = playCount;
    this.letter = letter;
    this.moves = moves;
  }
  getRatio() {
    if (this.playCount === 0) {
      return 0;
    }
    return this.winCount / this.playCount;
  }
}

// tree of move nodes
class Tree {
  // takes an array of move Nodes
  constructor(moves, playCount) {
    this.playCount = playCount;
    this.moves = moves;
  }
}

module.exports = {
  Tree: Tree,
  Node: Node,
};
