export class Game{
  name: String;
  game_phase: GamePhase;

  constructor(name: String, password: String) {
    this.name = name;
    game_pswds.set(name, password);
    this.game_phase = GamePhase.LOBBY_PHASE;
  }
}

export let game_pswds = new Map<String, String>();
export let games : Game[] = [];

export enum GamePhase{
  LOBBY_PHASE,
  DAY_PHASE,
  VOTE_PHASE,
  SEER_PHASE,
  WOLF_PHASE
}

games.push(new Game("game", ""));
