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
  if (player.hand.length === 0) {
    console.log(`player ${player.publicData.id} has no hand????`);
    throw new Error("die?");
    return [];
  }

  let cardsToReturn: Card[] = [];
  // first player
  if (
    gameData.playerData[gameData.leadPlayerThisTrick].id ===
    player.publicData.id
  ) {
    // if hearts not yet broken, prefer to avoid leading hearts unless only hearts remain
    if (!gameData.heartsPlayedThisHand) {
      cardsToReturn = player.hand.filter((card) => card.suit !== "h");
      if (cardsToReturn.length === 0) {
        cardsToReturn = [...player.hand];
      }
    } else {
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
    throw new Error("wtf?");
  }
  return cardsToReturn;
}

function evalNode(node: ActionNode, parentVisits: number): number {
  const C = 10;

  // Replace any zero divisors with 1
  const visits = node.numberTimesSelected === 0 ? 1 : node.numberTimesSelected;

  // Guard log(0) → -Infinity
  const safeParentVisits = parentVisits <= 1 ? 1 : parentVisits;
  const exploration = Math.sqrt(Math.log(safeParentVisits) / visits);

  const exploitation = node.totalScoreSoFar / visits;

  const score = exploitation - C * exploration;

  // Final guard: never return NaN or Infinity
  if (!Number.isFinite(score)) {
    return 0; // or some fallback value appropriate for your MCTS
  }

  return score;
}

export function selectActionNode(
  nodes: ActionNode[],
  parentVisits: number
): ActionNode {
  if (nodes.length === 0) {
    throw new Error(
      "selectActionNode: cannot select from an empty list of nodes"
    );
  }

  let bestActions: ActionNode[] = [];
  let bestScore = Infinity;

  for (const node of nodes) {
    const score = evalNode(node, parentVisits);

    if (score < bestScore) {
      // Found a new best score: reset list
      bestScore = score;
      bestActions = [node];
    } else if (score === bestScore) {
      // Same as current best: add to list of candidates
      bestActions.push(node);
    }
  }

  if (bestActions.length === 0) {
    throw new Error("you lied to me");
  }

  // At this point bestActions is guaranteed non-empty
  const idx = Math.floor(Math.random() * bestActions.length);
  return bestActions[idx];
}

export function simulateActionFromState(
  selectedCard: Card,
  player: Player,
  gameData: PublicKnowledge
): number {
  // make copy player array
  const playerDataCopies: PublicPlayerData[] = [];
  for (const playerData of gameData.playerData) {
    playerDataCopies.push({
      ...playerData,
      reportedDoneSuitsThisHand: [...playerData.reportedDoneSuitsThisHand],
      takenCardsThisHand: [...playerData.takenCardsThisHand],
    });
  }
  const playersCopy: Player[] = [];
  for (const data of playerDataCopies) {
    if (data.id === player.publicData.id) {
      playersCopy.push({
        publicData: data,
        hand: [...player.hand],
        isAi: true,
      });
    } else {
      playersCopy.push({
        publicData: data,
        hand: [],
        isAi: true,
      });
    }
  }

  //make copy game state
  const gameCopy: PublicKnowledge = {
    ...gameData,
    playerData: playerDataCopies,
    cardsPlayedThisTrick: [...gameData.cardsPlayedThisTrick],
    cardsUnplayedThisHand: [...gameData.cardsUnplayedThisHand],
  };

  //make copy of self
  const playerDataCopy = playerDataCopies.find(
    (item) => item.id === player.publicData.id
  );
  if (playerDataCopy === undefined) {
    throw new Error("what");
  }

  // randomly deal remaining deck to other players
  let remainingDeck = gameCopy.cardsUnplayedThisHand.filter(
    (card) =>
      !player.hand.some(
        (handCard) =>
          handCard.rank === card.rank && handCard.suit === card.suit
      )
  );
  remainingDeck = shuffle(remainingDeck);
  const recipientIndexes = playersCopy
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.publicData.id !== player.publicData.id)
    .map(({ idx }) => idx);

  let recipient = 0;
  for (const card of remainingDeck) {
    const idx = recipientIndexes[recipient % recipientIndexes.length];
    playersCopy[idx].hand.push(card);
    recipient += 1;
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
    console.log(
      `${gameCopy.cardsUnplayedThisHand.length} cards left to play for this sim`
    );
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
  const playerCount = playersCopy.length;
  const alreadyPlayed = gameCopy.cardsPlayedThisTrick.length;
  const leadIndex = gameCopy.leadPlayerThisTrick;

  // Reconstruct current losing player from the already-played cards in turn order.
  let loserSoFar = playersCopy[leadIndex];
  let worstRankSoFar: Rank = "2";
  if (gameCopy.suitLeadingThisTrick) {
    for (let i = 0; i < alreadyPlayed; i++) {
      const card = gameCopy.cardsPlayedThisTrick[i];
      const playerIdx = (leadIndex + i) % playerCount;
      if (
        card.suit === gameCopy.suitLeadingThisTrick &&
        rankToValue(card.rank) >= rankToValue(worstRankSoFar)
      ) {
        worstRankSoFar = card.rank;
        loserSoFar = playersCopy[playerIdx];
      }
    }
  }

  const playerIndex = playersCopy.findIndex(
    (p) => p.publicData.id === playerDataCopy.id
  );
  let turnIndex = (leadIndex + alreadyPlayed) % playerCount;
  if (turnIndex !== playerIndex) {
    throw new Error(
      "simulateActionFromState: expected acting player to be next to play"
    );
  }

  let forcedFirstTurnDone = false;
  const turnsToPlay = playerCount - alreadyPlayed;
  for (let i = 0; i < turnsToPlay; i++) {
    const currentPlayer = playersCopy[turnIndex];
    const card = forcedFirstTurnDone
      ? getPlayerTurn(currentPlayer, gameCopy, -1, true)
      : selectedCard;
    forcedFirstTurnDone = true;

    gameCopy.cardsPlayedThisTrick.push(card);
    gameCopy.cardsUnplayedThisHand = gameCopy.cardsUnplayedThisHand.filter(
      (item) => item.rank !== card.rank || item.suit !== card.suit
    );
    currentPlayer.hand = currentPlayer.hand.filter(
      (item) => item.rank !== card.rank || item.suit !== card.suit
    );

    if (i === 0 && alreadyPlayed === 0) {
      gameCopy.suitLeadingThisTrick = card.suit;
    }

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
