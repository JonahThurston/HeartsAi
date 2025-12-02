console.log("hello world");

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

class Player {
  public type: "human" | "AI" = "human";
  public points = 0;
  public hand: string[] = [];
  public heartsDone = false;
  public spadesDone = false;
  public clubsDone = false;
  public diamondsDone = false;
}

export class GameState {
  public deck: string[] = [];
  public players: Player[] = [];
  public currentTrick: string[] = [];
  public currentSuit: "h" | "d" | "s" | "c" = "c";
  public heartsPlayed = false;
}

export class HeartsGame {
  private gameState: GameState;

  constructor(
    numPlayers: number,
    orderString: string,
    numDecks: number,
    thinkingTime: number
  ) {}

  public run() {}
}
