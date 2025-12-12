# HeartsAi

This my project to try to beat my friends at the card game hearts. My vague plan so far is to make it do Monte Carlo Tree search.

This environment is not meant to be used alone. The intended use case is that you are playing the game physically, inputting the human's moves as they make them. This means that the environment does not shuffle the deck and deal to the players, and it does not know what is in the human's hands. This means that it does not validate that the humans are making valid moves, so be careful to type in cards accurately.

This game follows the rules from: https://bicyclecards.com/how-to-play/hearts/ with a few exceptions for my friend's house rules

- At the start of each hand, the leading player may choose to swap. If the player chooses to swap they must choose 'left', 'right', or 'switch'. If left or right are chosen, each player chooses three of the cards in their hand to give to the person in that direction to them. 'switch' may only be chosen in a 4 player game; if it is chosen, the leading player chooses one other player to trade 3 of their cards with, and the other two players do the same. (This rule may have to wait till version 1.1 to be implemented)
- First trick leader of each hand rotates around the table, it is not decided by who has 2 of clubs. And that player can play any valid card they want, not just the 2 of clubs
- Players may play hearts or the queen of spades in the first round, if they are void of the leading suit.
