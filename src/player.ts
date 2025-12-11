export default class Player {
  applyHandPoints() {
    throw new Error("Method not implemented.");
  }
  private isAi: boolean;
  public points = 0;
  public hand: string[] = [];
  public takenCards: string[] = [];
  public knownsuitsDone: string[] = [];

  constructor(isAi: boolean) {
    this.isAi = isAi;
  }

  public getPlay(thinkingTime: number): string {
    throw new Error("Method not implemented.");
  }

  public checkKnownSuit(suit: string) {
    throw new Error("Method not implemented.");
  }
}
