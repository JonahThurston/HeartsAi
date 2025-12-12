import { type Suit, type Card, cardFromString } from "./Cards.js";
import type { Player } from "./PlayerLogic.js";
import prompt from "prompt-sync";
const PROMPT = prompt({ sigint: true });

export interface PublicPlayerData {
  id: string;
  points: number;
  reportedDoneSuitsThisHand: Suit[];
  takenCardsThisHand: Card[];
}

export interface PublicKnowledge {
  playerData: PublicPlayerData[];

  leadPlayerThisTrick: number;
  suitLeadingThisTrick: Suit | undefined;
  cardsPlayedThisTrick: Card[];

  dealerThisHand: number;
  cardsUnplayedThisHand: Card[];
  heartsPlayedThisHand: boolean;
}

export function initializePublicData(players: Player[]): PublicKnowledge {
  const playerDataArray: PublicPlayerData[] = [];
  for (const player of players) {
    playerDataArray.push(player.publicData);
  }

  return {
    playerData: playerDataArray,
    leadPlayerThisTrick: -1,
    suitLeadingThisTrick: undefined,
    cardsPlayedThisTrick: [],
    dealerThisHand: -1,
    cardsUnplayedThisHand: [],
    heartsPlayedThisHand: false,
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
    let givenCard: Card | undefined = undefined;
    while (!givenGoodInput) {
      const userString = PROMPT(
        `enter AI player ${player.publicData.id}\'s hand card ([suit][rank]): `
      );
      const givenCard = cardFromString(userString);
      if (givenCard !== undefined) {
        givenGoodInput = true;
      }
    }
    player.hand.push(givenCard!);
  }
}
