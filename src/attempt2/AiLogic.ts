import shuffle from "lodash.shuffle";
import {
  getDeck,
  rankToValue,
  type Card,
  type Rank,
  type Suit,
} from "./Cards.js";
import { getPlayerTurn, reportSuitDone, type Player } from "./PlayerLogic.js";
import type { PublicKnowledge, PublicPlayerData } from "./PublicGameData.js";
import { applyHandPoints, runTrick } from "./GameLogic.js";

export interface ActionNode {
  selectedCard: Card;
  totalScoreSoFar: number;
  numberTimesSelected: number;
}

export function getValidMoves(
  player: Player,
  gameData: PublicKnowledge
): Card[] {
  let cardsToReturn: Card[] = [];
  // first player
  if (
    gameData.playerData[gameData.leadPlayerThisTrick].id ===
    player.publicData.id
  ) {
    // okay to lead with hearts
    if (!gameData.heartsPlayedThisHand) {
      cardsToReturn = player.hand.filter((card) => card.suit !== "h");
    }
    // cant lead with hearts
    else {
      cardsToReturn = [...player.hand];
    }
  }

  // following player
  else {
    // does not have leading suit
    if (
      !player.hand.some((card) => card.suit === gameData.suitLeadingThisTrick)
    ) {
      cardsToReturn = [...player.hand];
    }
    // has leading suit
    else {
      cardsToReturn = player.hand.filter(
        (card) => card.suit === gameData.suitLeadingThisTrick
      );
    }
  }

  if (cardsToReturn.length === 0) {
    console.log(`player ${player.publicData.id} has no valid moves????`);
  }
  return cardsToReturn;
}

function evalNode(node: ActionNode, parentVisits: number) {
  const C = 10;
  return (
    node.totalScoreSoFar / node.numberTimesSelected -
    C * Math.sqrt(Math.log(parentVisits) / node.numberTimesSelected)
  );
}

export function selectActionNode(nodes: ActionNode[], parentVisits: number) {
  let bestActions: ActionNode[] = [];
  const lowestValSoFar = Infinity;
  for (const node of nodes) {
    const score = evalNode(node, parentVisits);
    if (score < lowestValSoFar) {
      bestActions = [node];
    } else if (score === lowestValSoFar) {
      bestActions.push(node);
    }
  }
  return bestActions[Math.floor(Math.random() * bestActions.length)];
}

export function simulateActionFromState(
  selectedCard: Card,
  player: Player,
  gameData: PublicKnowledge
): number {
  // make copy player array
  const playerDataCopies: PublicPlayerData[] = [];
  for (const playerData of gameData.playerData) {
    playerDataCopies.push({ ...playerData });
  }
  const playersCopy: Player[] = [];
  for (const data of playerDataCopies) {
    playersCopy.push({
      publicData: data,
      hand: [],
      isAi: true,
    });
  }

  //make copy game state
  const gameCopy: PublicKnowledge = { ...gameData };
  gameCopy.playerData = playerDataCopies;

  //make copy of self
  const playerDataCopy = playerDataCopies.find(
    (item) => item.id === player.publicData.id
  );
  if (playerDataCopy === undefined) {
    throw new Error("what");
  }

  // randomly deal remaining deck to other players
  let remainingDeck = gameData.cardsUnplayedThisHand.filter(
    (card) => !player.hand.includes(card)
  );
  remainingDeck = shuffle(remainingDeck);
  let dealIndex = 0;
  for (const card of remainingDeck) {
    if (playersCopy[dealIndex].publicData.id !== player.publicData.id) {
      playersCopy[dealIndex].hand.push(card);
    }
  }

  // simulate the rest of the trick we're on, if AI is not the first player
  if (
    gameCopy.playerData[gameCopy.leadPlayerThisTrick].id !==
    player.publicData.id
  ) {
    simRestOfTrickWithStartCard(
      gameCopy,
      playerDataCopy,
      selectedCard,
      playersCopy
    );
  }

  // simulate rest of hand if we have to
  while (gameCopy.cardsUnplayedThisHand.length !== 0) {
    runTrick(playersCopy, gameCopy, -1, true);
  }

  applyHandPoints(playersCopy, gameCopy);
  return playerDataCopy.points;
}

function simRestOfTrickWithStartCard(
  gameCopy: PublicKnowledge,
  playerDataCopy: PublicPlayerData,
  selectedCard: Card,
  playersCopy: Player[]
) {
  const cardsOfLedSuit = gameCopy.cardsPlayedThisTrick.filter(
    (card) => card.suit === gameCopy.suitLeadingThisTrick
  );
  let worstRankSoFar: Rank = "2";
  for (const card of cardsOfLedSuit) {
    if (rankToValue(card.rank) >= rankToValue(worstRankSoFar)) {
      worstRankSoFar = card.rank;
    }
  }
  let loserSoFar =
    playersCopy[
      gameCopy.cardsPlayedThisTrick.findIndex(
        (card) =>
          card.rank === worstRankSoFar &&
          card.suit === gameCopy.suitLeadingThisTrick
      )
    ];
  const playerIndex = playersCopy.findIndex(
    (player) => player.publicData.id === playerDataCopy.id
  );
  let turnIndex =
    (gameCopy.leadPlayerThisTrick + playerIndex) % gameCopy.playerData.length;
  let forcedFirstTurnDone: boolean = false;
  for (let i = playerIndex; i < playersCopy.length; i++) {
    const currentPlayer = playersCopy[turnIndex];
    let card: Card;
    if (forcedFirstTurnDone) {
      card = getPlayerTurn(currentPlayer, gameCopy, -1, true);
    } else {
      card = selectedCard;
      forcedFirstTurnDone = true;
    }

    gameCopy.cardsPlayedThisTrick.push(card);
    gameCopy.cardsUnplayedThisHand = gameCopy.cardsUnplayedThisHand.filter(
      (item) => item.rank !== card.rank || item.suit !== card.suit
    );

    if (i === 0) {
      gameCopy.suitLeadingThisTrick = card.suit;
      worstRankSoFar = card.rank;
      if (card.suit === "s" && card.rank === "q") {
        gameCopy.heartsPlayedThisHand = true;
      }
    } else {
      if (card.suit === gameCopy.suitLeadingThisTrick) {
        if (rankToValue(card.rank) >= rankToValue(worstRankSoFar)) {
          worstRankSoFar = card.rank;
          loserSoFar = currentPlayer;
        }
        if (card.suit === "s" && card.rank === "q") {
          gameCopy.heartsPlayedThisHand = true;
        }
      } else {
        reportSuitDone(currentPlayer, gameCopy.suitLeadingThisTrick, true);
        if (card.suit === "h" || (card.suit === "s" && card.rank === "q")) {
          gameCopy.heartsPlayedThisHand = true;
        }
      }
    }

    turnIndex = (turnIndex + 1) % playersCopy.length;
  }

  loserSoFar.publicData.takenCardsThisHand =
    loserSoFar.publicData.takenCardsThisHand.concat(
      gameCopy.cardsPlayedThisTrick
    );

  gameCopy.leadPlayerThisTrick = playersCopy.findIndex(
    (player) => player === loserSoFar
  );
  if (gameCopy.leadPlayerThisTrick === -1) {
    throw new Error("failed to find index of trick loser in simulation");
  }
  gameCopy.cardsPlayedThisTrick = [];
  gameCopy.suitLeadingThisTrick = undefined;
}
