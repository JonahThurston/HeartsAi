# HeartsAi

This my project to try to beat my friends at the card game hearts. My vague plan so far is to make it do Monte Carlo Tree search.

This game follows the rules from: https://bicyclecards.com/how-to-play/hearts/ with a few exceptions for my friend's house rules

- At the start of each trick, the leading player may choose to swap. If the player chooses to swap they must choose 'left', 'right', or 'switch'. If left or right are chosen, each player chooses three of the cards in their hand to give to the person in that direction to them. 'switch' may only be chosen in a 4 player game; if it is chosen, the leading player chooses one other player to trade 3 of their cards with, and the other two players do the same. (This rule may have to wait till version 1.1 to be implemented)
- The first player of the first trick does not have to play the 2 of clubs.
- Players may play hearts or the queen of spades in the first round, if they are void of the leading suit.
