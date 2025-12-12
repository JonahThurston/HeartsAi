import { cardFromString, type Card, type Suit } from "./Cards.js";
import type { PublicKnowledge, PublicPlayerData } from "./PublicGameData.js";
import prompt from "prompt-sync";
const PROMPT = prompt({ sigint: true });

export interface Player {
  publicData: PublicPlayerData;
  isAi: boolean;
  hand: Card[]; // only AI agents will ever bother with this field. humans can just look at thier physical cards.
  // cardsGiven: Card[]   // Upcoming feature for teaching AI swapping
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
        reportedDoneSuitsThisHand: [],
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
    givenCard = cardFromString(userString);
    if (
      givenCard === undefined ||
      !gameData.cardsUnplayedThisHand.some(
        (card) => card.rank === givenCard?.rank && card.suit === givenCard.suit
      )
    ) {
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
    return getAiTurn(player, gameData, THINKING_TIME);
  } else {
    return getHumanTurn(player, gameData);
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

  if (!reportingPlayer.publicData.reportedDoneSuitsThisHand.includes(suit)) {
    reportingPlayer.publicData.reportedDoneSuitsThisHand.push(suit);
    console.log(`player ${reportingPlayer.publicData.id} is out of ${suit}s!`);
  }
}
