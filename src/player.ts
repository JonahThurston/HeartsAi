export default class Player {
  private isAi: boolean;
  public points = 0;
  public hand: string[] = [];
  public takenCards: string[] = [];
  public knownHeartsDone = false;
  public knownSpadesDone = false;
  public knownClubsDone = false;
  public knownDiamondsDone = false;

  constructor(isAi: boolean) {
    this.isAi = isAi;
  }

  public getPlay(thinkingTime: number): string {
    throw new Error("Method not implemented.");
  }
}
