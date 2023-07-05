import {Server} from "socket.io";

export enum GamePhase{
  LOBBY_PHASE,
  DAY_PHASE,
  NIGHT_PHASE
}

export enum PlayerType {
  LOBBY,
  VILLAGER,
  WEREWOLF
}
export class Player {
  name: String;
  player_type: PlayerType;
  constructor(name: String){
    this.name = name;
    this.player_type = PlayerType.LOBBY;
  }
}

export class Game{
  name: String;
  game_phase: GamePhase;
  players: Player[];
  game_settings: GameSettings;

  constructor(name: String, password: String) {
    this.name = name;
    game_pswds.set(name, password);
    this.game_phase = GamePhase.LOBBY_PHASE;
    this.players = [];
    this.game_settings = new GameSettings();
  }

  add_player(player: String): void {
    for(let p of this.players){
      if(p.name == player){
        return;
      }
    }
    this.players.push(new Player(player));
  }

  remove_player(player: String){
    let temp : Player[] = [];
    for(let p of this.players){
      if(p.name != player){
        temp.push(p);
      }
    }
    this.players = temp;
  }
}

export class GameSettings{
  day_time: number = 5 * 60;
  night_time: number = 30;
  players: number = 3;
  werewolf_no = 1;
}

export let game_pswds = new Map<String, String>();
export let default_game : Game = new Game("Default Game", "");

export function start_game(io : Server, playerDict : { [key: string]: String }){
  let player_number = default_game.players.length;

  // Choosing werewolves
  // FIXME we can here select the same player twice, make a special function for this
  let werewolves: string[] = [];
  for(let i = 0; i < default_game.game_settings.werewolf_no; i++){
    let werewolf = Math.ceil(Math.random() * player_number) -1;
    werewolves.push(default_game.players[werewolf].name.toString());
  }
  // Telling the chosen werewolves their new roles
  for(let werewolf of werewolves){
    io.to(werewolf).emit("role_werewolf");
  }

  // Starting the game
  default_game.game_phase = GamePhase.DAY_PHASE;
  io.emit("game_settings", default_game.game_settings);
  io.emit("game_phase_change", default_game.game_phase);

}
