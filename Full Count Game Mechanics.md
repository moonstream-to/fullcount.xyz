# Full Count: Game Mechanics
## Choosing an action

When a player joins a session, they make two strategic decisions:

**The pitcher** decides (1) whether to throw a fast or a slow pitch and (2) where to throw it. 

**The batter** decides (1) what type of swing to take and (2) where to swing. There are three swing options:
* Power swing–best against slow pitches. 
* Contact swing–best against fast pitches.
* Take the pitch–no swing; the batter anticipates a pitch outside of the strike zone.

⠀
The 25 pitch and swing placement options are  represented on a 5x5 grid. The central nine squares represent the strike zone. 

![strike zone grid]([strike_zone_grid.png]([https://drive.google.com/file/d/1IoDfo6XelVJZcOnZOUF8XFJdRn6Obgbe/view?usp=drive_link](https://static.greatwyrm.xyz/test/strikezone_grid.png)))

Each player also generates a random number by moving their mouse for a required amount of time.

## The commit/reveal phase
Once a player has chosen the type and placement of their action, they finalize the action by clicking “commit.” This submits a signature that binds them to their choice but does not reveal the details of the choice on chain.

When both players have committed their actions, they get a “reveal” option. Clicking “reveal” reveals both players' choices on chain, and the game is resolved based on that information.. 

## Resolving the at bat
### Distance between pitch and swing
To resolve the at bat, the game starts with the distance between the pitch (the grid square the pitcher chose) and the swing (the grid square the batter chose). (Note: This is true except in instances where the batter chose “take,” which are discussed below.)

The vertical and horizontal pitch location are assigned numbers, as follows:

HighBall - 0		InsideBall - 0
HighStrike - 1		InsideStrike - 1
Middle - 2		Middle - 2
LowStrike - 3		OutsideStrike - 3
LowBall - 4		Outside Ball - 4

The game compares the positions by adding the absolute values of the vertical and horizontal distances between the pitch and the swing.

For example, if the pitcher throws a high inside strike and the batter anticipates a low middle strike, the vertical difference is two: HighStrike = 1; LowStrike = 3; |1-3| = 2

The horizontal difference is one: InsideStrike = 1; Middle = 2; |1-2| = 1.


The vertical and horizontal differences are added to give a total distance of 3.

### Types of pitch and swing
Power swings are best for slow pitches, and contact swings are best for fast pitches.
If the batter chose a swing that does not suit the speed of the pitch, add +1 to the distance.

### Probabilities and outcomes
There are eight possible outcomes for an at bat: strikeout, homerun, walk, single, double, triple, foul, and in-play out (fly out, or ground out)

Each distance (~[L1 distance](https://en.wikipedia.org/wiki/Taxicab_geometry)~ + pitch type penalty) comes with a probability distribution that specifies how likely each of those outcomes are for the given scenario. The larger the distance between the pitch and the swing, for example, the higher the chance of a strikeout, and the lower the odds of hitting a home run. 

The player-generated randomness determines which outcome actually happens. 

## Takes (balls and walks)
* If the batter takes a pitch and the pitcher throws to any of squares 1-9 (that is, if the pitch crossed the plate within the strike zone), it’s a strikeout.
* If that batter takes a pitch and the pitcher throws to any of squares 10-15 (that is, the pitch was outside of the strike zone), it’s a walk. 
