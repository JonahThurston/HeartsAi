import prompt from "prompt-sync";
const myPrompt = prompt({ sigint: true });

export default class Player {
  private isAi: boolean;
  public points = 0;
  public hand: string[] = [];
  public takenCards: string[] = [];
  public knownSuitsDone: string[] = [];

  constructor(isAi: boolean) {
    this.isAi = isAi;
  }

  public reportDoneSuit(suit: string) {
    if (!this.knownSuitsDone.includes(suit)) {
      this.knownSuitsDone.push(suit);
    }
  }

  public applyHandPoints() {
    for (const card of this.takenCards) {
      if (card[0] === "h") {
        this.points = this.points + 1;
      } else if (card === "sq") {
        this.points = this.points + 13;
      }
    }
  }

  public getPlay(
    heartsPlayed: boolean,
    ledSuit: string,
    isLeadPlayer: boolean,
    thinkingTime: number
  ): string {
    const validCards = this.getValidCards(heartsPlayed, ledSuit, isLeadPlayer);
    if (!this.isAi) {
      return this.getHumanPlay(validCards);
    }
    return this.getAiPlay(validCards, thinkingTime);
  }

  private getValidCards(
    heartsPlayed: boolean,
    ledSuit: string,
    isLeadPlayer: boolean
  ) {
    let validCards = [...this.hand];
    if (isLeadPlayer) {
      if (!heartsPlayed) {
        validCards = validCards.filter((card) => card[0] !== "h");
      }
    } else {
      if (validCards.some((card) => card[0] === ledSuit)) {
        validCards = validCards.filter((card) => card[0] != ledSuit);
      }
    }
    return validCards;
  }

  private getHumanPlay(validCards: string[]): string {
    let givenValidPlay = false;
    let gotCard = "";
    while (!givenValidPlay) {
      console.log("Valid plays: ");
      console.log(validCards);
      gotCard = myPrompt("type a valid play: ");
      if (!validCards.includes(gotCard)) {
        continue;
      } else {
        givenValidPlay = true;
      }
    }
    console.log(`played: ${gotCard}`);
    return gotCard;
  }

  private getAiPlay(validCards: string[], thinkingTime: number): string {
    throw new Error("Method not implemented.");
  }
}
