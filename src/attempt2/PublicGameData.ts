import { type Suit, type Card, getDeck } from "./Cards.js";
import type { Player } from "./PlayerLogic.js";

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
