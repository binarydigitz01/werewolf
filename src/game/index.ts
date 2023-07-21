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
  has_voted: boolean;
  is_alive: boolean = true;
  constructor(name: String){
    this.name = name;
    this.player_type = PlayerType.LOBBY;
    this.has_voted = false;
  }
}

export class Game{
  name: String;
  game_phase: GamePhase;
  players: Player[];
  game_settings: GameSettings;
  votes: { [key: string] : number} = {};

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
  // day_time: number = 5 * 60;
  // night_time: number = 30;
  day_time: number = 10;
  night_time: number = 5;
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
  // io.emit("game_phase_change", default_game.game_phase);
  clear_votes();

  io.on("vote", (data: any)=>{
    if(default_game.game_phase != GamePhase.DAY_PHASE)
      return;
    let player: Player = default_game.players[0]; // Dummy value
    for(let p of default_game.players){
      if(p.name.toString() == data.voter_name){
        if(p.has_voted)
          return;
        else
          player = p;
      }
    }
    default_game.votes[data.player_name] +=1;
    player.has_voted = true;
  });

  change_to_day_phase(io, playerDict);

}

function clear_votes(){
  for(let player of default_game.players){
    default_game.votes[player.name.toString()] = 0;
  }
}

// TODO This doesn't check if werewolves have won
function is_game_won(){
  let werevolves= 0;
  for(let p of default_game.players){
    if(p.player_type == PlayerType.WEREWOLF && p.is_alive){
      werevolves++;
    }
  }
  return werevolves == 0;
}

function change_to_day_phase(io: Server, playerDict : { [key: string]: String }){
  default_game.game_phase = GamePhase.DAY_PHASE;
  io.emit("game_phase_change", default_game.game_phase);

  let timeoutID = setTimeout(()=>{
    if(is_game_won()){
      // Do stuff

    }
    // Killing the player with maximum votes
    let max_votes: number = 0;
    let player_name: string = "";
    for(let key in default_game.votes){
      if(default_game.votes[key] > max_votes){
        max_votes = default_game.votes[key];
        player_name = key;
      }
    }
    for(let i : number= 0; i < default_game.players.length; i++){
      if (default_game.players[i].name.toString() == player_name){
        default_game.players[i].is_alive = false;
        io.emit('player_killed', default_game.players[i].name);
      }
    }
    clear_votes();
    change_to_night_phase(io,  playerDict);
  },
    default_game.game_settings.day_time * 1000);
}

function change_to_night_phase(io: Server, playerDict : { [key: string]: String }){
  default_game.game_phase = GamePhase.NIGHT_PHASE;
  io.emit("game_phase_change", default_game.game_phase);

  let timeoutID = setTimeout(()=>{
    if(is_game_won()){
      // Do stuff

    }
    // // Killing the player with maximum votes
    // let max_votes: number = 0;
    // let player_name: string = "";
    // for(let key in default_game.votes){
    //   if(default_game.votes[key] > max_votes){
    //     max_votes = default_game.votes[key];
    //     player_name = key;
    //   }
    // }
    // for(let i : number= 0; i < default_game.players.length; i++){
    //   if (default_game.players[i].name.toString() == player_name){
    //     default_game.players[i].is_alive = false;
    //     io.emit('player_killed', default_game.players[i].name);
    //   }
    // }
    // clear_votes();
    change_to_day_phase(io,  playerDict);
  },
    default_game.game_settings.night_time * 1000);

}
