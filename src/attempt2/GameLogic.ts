import { getDeck, rankToValue, type Rank } from "./Cards.js";
import {
  getPlayerTurn,
  initializePlayers,
  reportSuitDone,
  type Player,
} from "./PlayerLogic.js";
import {
  initializePublicData,
  inputAiHand,
  type PublicKnowledge,
} from "./PublicGameData.js";

export function gameOver(players: Player[], goal: number): boolean {
  for (const player of players) {
    if (player.publicData.points > goal) {
      return true;
    }
  }
  return false;
}

function runTrick(
  players: Player[],
  gameData: PublicKnowledge,
  THINKING_TIME: number
) {
  //  for each player starting from the lead
  //    get a play from that player
  //      if human, just assume the card is a legal play
  //      if AI's first turn, input its hand. Give it all public knowledge to work with
  //    do that play
  //      take it out of players hand, put it into current trick
  //      if leading player, update trick lead suit
  //      else see if they did worse than leading player, and update known done suits as neccessary
  //  put cards in losers taken, set loser to new lead
  //  reset trick data
  let loserSoFar = players[gameData.leadPlayerThisTrick];
  let worstRankSoFar: Rank = "2";
  let turnIndex = gameData.leadPlayerThisTrick;
  for (let i = 0; i < players.length; i++) {
    const currentPlayer = players[turnIndex];
    const card = getPlayerTurn(currentPlayer, gameData, THINKING_TIME);

    gameData.cardsPlayedThisTrick.push(card);
    gameData.cardsUnplayedThisHand = gameData.cardsUnplayedThisHand.filter(
      (item) => item.rank !== card.rank || item.suit !== card.suit
    );

    if (i === 0) {
      gameData.suitLeadingThisTrick = card.suit;
      worstRankSoFar = card.rank;
      if (card.suit === "s" && card.rank === "q") {
        gameData.heartsPlayedThisHand = true;
      }
    } else {
      if (card.suit === gameData.suitLeadingThisTrick) {
        if (rankToValue(card.rank) >= rankToValue(worstRankSoFar)) {
          worstRankSoFar = card.rank;
          loserSoFar = currentPlayer;
        }
        if (card.suit === "s" && card.rank === "q") {
          gameData.heartsPlayedThisHand = true;
        }
      } else {
        reportSuitDone(currentPlayer, gameData.suitLeadingThisTrick);
        if (card.suit === "h" || (card.suit === "s" && card.rank === "q")) {
          gameData.heartsPlayedThisHand = true;
        }
      }
    }

    turnIndex = (turnIndex + 1) % players.length;
  }

  console.log(`trick over. Player ${loserSoFar.publicData.id} takes trick`);
  loserSoFar.publicData.takenCardsThisHand =
    loserSoFar.publicData.takenCardsThisHand.concat(
      gameData.cardsPlayedThisTrick
    );

  gameData.leadPlayerThisTrick = players.findIndex(
    (player) => player === loserSoFar
  );
  if (gameData.leadPlayerThisTrick === -1) {
    throw new Error("failed to find index of trick loser");
  }
  gameData.cardsPlayedThisTrick = [];
  gameData.suitLeadingThisTrick = undefined;
}

function initializeHand(players: Player[], gameData: PublicKnowledge) {
  gameData.cardsUnplayedThisHand = getDeck(players.length);
  gameData.heartsPlayedThisHand = false;
  gameData.dealerThisHand = (gameData.dealerThisHand + 1) % players.length;
  gameData.leadPlayerThisTrick = gameData.dealerThisHand;

  for (const player of players) {
    player.publicData.reportedDoneSuitsThisHand = [];
    player.publicData.takenCardsThisHand = [];
  }

  for (const player of players) {
    if (player.isAi) {
      inputAiHand(player, players.length);
    }
  }
}

function runHand(
  players: Player[],
  gameData: PublicKnowledge,
  THINKING_TIME: number
) {
  while (gameData.cardsUnplayedThisHand.length !== 0) {
    runTrick(players, gameData, THINKING_TIME);
  }
  applyHandPoints(players, gameData);

  console.log("Hand over, current score is:");
  printScore(players);
}

function applyHandPoints(players: Player[], gameData: PublicKnowledge) {
  for (const player of players) {
    let playerHandPoints = 0;
    for (const card of player.publicData.takenCardsThisHand) {
      if (card.suit === "h") {
        playerHandPoints += 1;
      } else if (card.suit === "s" && card.rank === "q") {
        playerHandPoints += 13;
      }
    }

    if (playerHandPoints === 26) {
      console.log(`${player.publicData.id} just shot the moon!`);
      for (const otherPlayer of players) {
        if (otherPlayer.publicData.id !== player.publicData.id) {
          otherPlayer.publicData.points += 26;
        }
      }
    }
    player.publicData.points += playerHandPoints;
  }
}

function printScore(players: Player[]) {
  for (const player of players) {
    console.log(
      `Player ${player.publicData.id} got: ${player.publicData.points}`
    );
  }
}

export function runGame(
  PLAYER_SETTINGS: boolean[],
  GOAL_POINTS: number,
  THINKING_TIME: number
) {
  const players = initializePlayers(PLAYER_SETTINGS);
  const gameData = initializePublicData(players);
  while (!gameOver(players, GOAL_POINTS)) {
    initializeHand(players, gameData);
    runHand(players, gameData, THINKING_TIME);
  }
  console.log("game over!!! Final Scores:");
  printScore(players);
}
