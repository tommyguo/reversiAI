# reversiAI
Play reversi against a computer AI that uses Monte Carlo Tree Search

## Dependencies:
Uses readline-sync: install with ```npm install readline-sync```


## Playing the game:
Play against the AI by running game.js: ```node game.js```


## How the AI works:
The AI chooses which move to play based on simulations stored in tree.json. It chooses whichever move has the highest win percentage.
If the number of simulations for a given position is less than 30 * (number of valid moves from that position), then the AI will no 
longer rely on stored simulations and will run 30 simulations per valid move and pick the best move from there.

The uploaded tree.json file only has 200,000 simulations, which means that the AI runs out of sufficient data within 7 moves. To run your
own simulations and make the AI stronger, run standAloneAI.js: ```node standAloneAI game.js```
The simulations will automatically be stored in tree.json upon completion. These simulations will then be read when playing the game.

If you want to run your own simulations from scratch, copy contents of blanktree.json into tree.json

A good description of what the AI does can be found [here](https://jeffbradberry.com/posts/2015/09/intro-to-monte-carlo-tree-search/)
