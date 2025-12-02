import { HeartsGame } from "./game.js";

const NUM_PLAYERS = 4; // any number 3-5
const HUMAN_AI_ORDER = "1000"; // string where every 1 is an ai player, every 0 is a human player
const GAME_END_POINTS = 100; //rules recomend either 50 or 100, but could do whatever
const THINKING_TIME = 10; //time in seconds that the AI agents will be given before they must play

const game = new HeartsGame(
  NUM_PLAYERS,
  HUMAN_AI_ORDER,
  GAME_END_POINTS,
  THINKING_TIME
);
game.run();
