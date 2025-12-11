import shuffle from "lodash.shuffle";
import Player from "./player.js";

const FULL_DECK = [
  "ha",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "h7",
  "h8",
  "h9",
  "h10",
  "hj",
  "hq",
  "hk",
  "da",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "d9",
  "d10",
  "dj",
  "dq",
  "dk",
  "ca",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "c10",
  "cj",
  "cq",
  "ck",
  "sa",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "sj",
  "sq",
  "sk",
] as const;

export default class GameState {
  // static from turn to turn
  public deck: string[];
  public players: Player[];
  public thinkingTime: number;

  // changes every turn
  public currentTrick: string[] = [];
  public whoseTurn: number = 0;
  public ledSuit: string = "c";
  public heartsPlayed = false;

  constructor(playerSettings: boolean[], thinkingTime: number) {
    this.thinkingTime = thinkingTime;
    const playerNum = playerSettings.length;
    if (playerNum === 3) {
      this.deck = [...FULL_DECK].filter((card) => card !== "d2");
    } else if (playerNum === 4) {
      this.deck = [...FULL_DECK];
    } else if (playerNum === 5) {
      this.deck = [...FULL_DECK].filter((card) => card !== "c2");
    } else {
      console.error("must have 3, 4, or 5 players");
      throw new Error("must have 3, 4, or 5 players");
    }

    this.players = [];
    for (const isAi of playerSettings) {
      this.players.push(new Player(isAi));
    }
  }

  public dealNewHand() {
    for (const player of this.players) {
      player.hand = [];
    }
    const shuffledDeck = shuffle(this.deck);
    for (let i = 0; i < shuffledDeck.length; i++) {
      const card = shuffledDeck[i];
      if (this.players.length === 5) {
        if (card === "c3") {
          this.whoseTurn = i % this.players.length;
        }
      } else {
        if (card === "c2") {
          this.whoseTurn = i % this.players.length;
        }
      }
      this.players[i % this.players.length].hand.push(card);
    }
  }

  public runTrick() {
    let loserSoFar: Player = this.players[this.whoseTurn];
    let losingCardSoFar: string = "";
    for (let i = 0; i < this.players.length; i++) {
      console.log(`Player ${this.whoseTurn}s turn`);
      const currentPlayer = this.players[this.whoseTurn];
      const playedCard = currentPlayer.getPlay(this.thinkingTime);
      if (i === 0) {
        losingCardSoFar = playedCard;
        loserSoFar = currentPlayer;
        this.ledSuit = playedCard[0];
      } else {
        if (this.isLoserPlay(playedCard, losingCardSoFar)) {
          loserSoFar = currentPlayer;
          losingCardSoFar = playedCard;
        }
      }
      this.doPlay(currentPlayer, playedCard, i === 0);
      this.whoseTurn = (this.whoseTurn + 1) % this.players.length;
    }
    loserSoFar.takenCards = loserSoFar.takenCards.concat(this.currentTrick);
  }

  private isLoserPlay(cardToCheck: string, worstSoFar: string) {
    const suit = cardToCheck[0];
    if (suit !== this.ledSuit) {
      return false;
    }

    const numberToCheck = cardToCheck[1];
    const worstNumSoFar = worstSoFar[1];
    if (numberToCheck > worstNumSoFar) {
      return true;
    }

    return false;
  }

  public doPlay(player: Player, card: string, leadPlayer: boolean) {
    const suit = card[0];

    player.hand = player.hand.filter((item) => item !== card);
    this.currentTrick.push(card);

    if (suit !== this.ledSuit) {
      player.reportDoneSuit(suit);
    }

    if (!this.heartsPlayed && suit === "h") {
      this.heartsPlayed = true;
    }
  }

  public applyHandPoints() {
    for (const player of this.players) {
      player.applyHandPoints();
    }
  }
}
