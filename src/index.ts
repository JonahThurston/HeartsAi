import { HeartsGame } from "./heartsGame.js";

const PLAYERS = [false, false, false, false]; // array where every true is an ai player, every false is a human player. Length must be 3-5
const GOAL_POINTS = 100; //rules recomend either 50 or 100, but could do whatever
const THINKING_TIME = 10; //time in seconds that the AI agents will be given before they must play

const game = new HeartsGame(PLAYERS, GOAL_POINTS, THINKING_TIME);
game.run();
