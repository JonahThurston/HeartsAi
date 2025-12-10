import GameState from "./gameState.js";

export class HeartsGame {
  private gameState: GameState;
  private thinkingTime: number;
  public goalAmount: number;

  constructor(players: boolean[], goalAmount: number, thinkingTime: number) {
    this.gameState = new GameState(players, thinkingTime);
    this.goalAmount = goalAmount;
    this.thinkingTime = thinkingTime;
  }

  public run() {
    while (!this.gameOver()) {
      this.runHand();
    }

    const results = this.getScores();
    console.log("Game Over! Results:");
    for (let i = 0; i < results.length; i++) {
      console.log(`Player ${i + 1}: ${results[i]}`);
    }
  }

  private runHand() {
    this.gameState.dealNewHand();
    while (this.gameState.players[0].hand.length) {
      this.gameState.runTrick();
    }

    this.gameState.applyHandPoints();
  }

  private gameOver() {
    for (const player of this.gameState.players) {
      if (player.points > this.goalAmount) {
        return true;
      }
    }
    return false;
  }

  private getScores() {
    const scores = [];
    for (const player of this.gameState.players) {
      scores.push(player.points);
    }
    return scores;
  }
}
