# What is this?
Reversi is a 2 player [board game](https://en.wikipedia.org/wiki/Reversi). I wrote a computer AI
that uses Monte Carlo Tree Search to play Reversi against a human opponent (aka you)! This game
is completely playable so please try it out.

I'm pretty proud of this project because implementing Monte Carlo Tree Search is challenging on its
own but I also came up with a novel way of storing the Monte Carlo Tree so that you can train
the AI without playing the game! More details follow.


## Playing the game:
Clone or download the project  
cd into the project folder and install dependencies: ```npm install```  
Play against the AI by running game.js: ```node src/game.js```

Warning: in its current state, the AI is fairly easy to beat because I tuned down the number of
moves it will explore before playing to make it run faster. This is for demonstration purposes. If
you want to play a competitive game (but also wait a long time), open up reversiAI.js and change
the variable NUMBER_OF_MOVES to something big.


## How the AI works:
The AI chooses which move to play based on simulations stored in tree.json. It chooses whichever move has the highest win percentage.
If the number of simulations for a given position is less than 30 * (number of valid moves from that position), then the AI will no
longer rely on stored simulations and will run 30 simulations per valid move and pick the best move from there.

The uploaded tree.json file only has 200,000 simulations, which means that the AI runs out of sufficient data within 7 moves. To run your
own simulations and make the AI stronger, run standAloneAI.js: ```node standAloneAI game.js```
The simulations will automatically be stored in tree.json upon completion. These simulations will then be read when playing the game.

If you want to run your own simulations from scratch, copy contents of blanktree.json into tree.json

A good description of what the AI does can be found [here](https://jeffbradberry.com/posts/2015/09/intro-to-monte-carlo-tree-search/)
