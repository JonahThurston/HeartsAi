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

  public getPlay(thinkingTime: number): string {
    if (!this.isAi) {
      return this.getHumanPlay();
    }
    return this.getAiPlay(thinkingTime);
  }

  private getHumanPlay(): string {
    let givenValidPlay = false;
    let givenCard = "";
    while (!givenValidPlay) {
      const givenCard = myPrompt("select a card: ");
      if (!this.hand.includes(givenCard)) {
        console.log("please select a card from your hand");
        console.log(this.hand);
      } else {
        console.log(`played: ${givenCard}`);
        givenValidPlay = true;
      }
    }
    return givenCard;
  }

  private getAiPlay(thinkingTime: number): string {
    throw new Error("Method not implemented.");
  }
}
