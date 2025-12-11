import { type Suit, type Card } from "./Cards.js";
import type { Player } from "./PlayerLogic.js";
import prompt from "prompt-sync";
const PROMPT = prompt({ sigint: true });

export interface PublicPlayerData {
  id: string;
  points: number;
  reportedDoneSuitsThisTrick: Suit[];
  takenCardsThisHand: Card[];
  // cardsGiven: Card[]   // Upcoming feature for swapping
}

export interface PublicKnowledge {
  playerData: PublicPlayerData[];

  leadPlayerThisTrick: number;
  suitLeadingThisTrick: Suit | undefined;
  cardsPlayedThisTrick: Card[];

  dealerThisHand: number;
  cardsUnplayedThisHand: Card[];
}

export function initializePublicData(players: Player[]): PublicKnowledge {
  const playerDataArray: PublicPlayerData[] = [];
  for (const player of players) {
    playerDataArray.push(player.publicData);
  }

  return {
    playerData: playerDataArray,
    leadPlayerThisTrick: 0,
    suitLeadingThisTrick: undefined,
    cardsPlayedThisTrick: [],
    dealerThisHand: 0,
    cardsUnplayedThisHand: [],
  };
}

export function inputAiHand(player: Player, numPlayers: number) {
  let handSize: number;
  switch (numPlayers) {
    case 3:
      handSize = 17;
      break;
    case 4:
      handSize = 13;
      break;
    case 5:
      handSize = 10;
      break;
    default:
      handSize = 13;
      break;
  }

  for (let i = 0; i < handSize; i++) {
    let givenGoodInput = false;
    while (!givenGoodInput) {
      const userString = PROMPT(
        `enter AI player ${player.publicData.id}\'s hand card ([suit][rank]): `
      );
      const trimmed = userString.trim().toLowerCase();
      const suit = trimmed[0] as Suit;
      const rank = trimmed.slice(1) as Card["rank"];
      const suitValid = suit === "h" || suit === "d" || suit === "c" || suit === "s";
      const rankValid =
        rank === "10" ||
        rank === "j" ||
        rank === "q" ||
        rank === "k" ||
        rank === "a" ||
        (rank.length === 1 && rank >= "2" && rank <= "9");

      if (suitValid && rankValid) {
        player.hand.push({ suit, rank });
        givenGoodInput = true;
      } else {
        console.log("Invalid card. Format is [suit][rank], e.g., s10 or hq.");
      }
    }
  }
}
