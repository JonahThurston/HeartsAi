import type { Card, Suit } from "./Cards.js";
import type { PublicKnowledge, PublicPlayerData } from "./PublicGameData.js";
import prompt from "prompt-sync";
const PROMPT = prompt({ sigint: true });

export interface Player {
  publicData: PublicPlayerData;
  isAi: boolean;
  hand: Card[]; // only AI agents will ever bother with this field. humans can just look at thier physical cards.
}

export function initializePlayers(playerSettings: boolean[]): Player[] {
  let newPlayers: Player[] = [];
  for (let i = 0; i < playerSettings.length; i++) {
    const playerIsAi = playerSettings[i];
    const userName = PROMPT(
      `Enter ${playerIsAi ? "AI " : ""}Player #${
        i + 1
      }\'s name (must be unique): `
    );

    newPlayers.push({
      publicData: {
        id: userName,
        points: 0,
        reportedDoneSuitsThisTrick: [],
        takenCardsThisHand: [],
      },
      isAi: playerIsAi,
      hand: [],
    });
  }
  return newPlayers;
}

function getHumanTurn(player: Player, gameData: PublicKnowledge): Card {
  let givenGoodInput = false;
  let givenCard: Card | undefined = undefined;
  while (!givenGoodInput) {
    const userString = PROMPT(
      `${player.publicData.id}\'s turn. Enter a card (suit then rank), or type \"h\" to see game state: `
    );
    if (userString === "h") {
      console.log(gameData);
      continue;
    }
    const givenSuit = userString[0];
    const givenRank = userString[1];
    const givenCard = gameData.cardsUnplayedThisHand.find(
      (card) => card.rank === givenRank && card.suit === givenSuit
    );
    if (givenCard === undefined) {
      console.log(
        "could not find card with that rank and suit in list of unplayed cards. Try again. Format is like s4 for the four of spades"
      );
      continue;
    }
    givenGoodInput = true;
  }
  return givenCard!;
}

function getAiTurn(
  player: Player,
  gameData: PublicKnowledge,
  THINKING_TIME: number
): Card {
  throw new Error("function not yet implemented");
  //dont forget to take card out of hand
}

export function getPlayerTurn(
  player: Player,
  gameData: PublicKnowledge,
  THINKING_TIME: number
): Card {
  if (player.isAi) {
    return getHumanTurn(player, gameData);
  } else {
    return getAiTurn(player, gameData, THINKING_TIME);
  }
}

export function reportSuitDone(
  reportingPlayer: Player,
  suit: Suit | undefined
) {
  if (suit === undefined) {
    throw new Error(
      `A following player reported a done suit before a lead suit was set???\n${reportingPlayer}`
    );
  }

  if (!reportingPlayer.publicData.reportedDoneSuitsThisTrick.includes(suit)) {
    reportingPlayer.publicData.reportedDoneSuitsThisTrick.push(suit);
  }
}
