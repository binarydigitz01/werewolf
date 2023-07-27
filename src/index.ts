import express from 'express';
import { router } from "./routes";
import { api } from "../api";
import * as dotenv from "dotenv";
import * as http from "http";
import { Server } from "socket.io";
import { default_game, start_game, Player, GamePhase, PlayerType } from "./game";

dotenv.config({ path: __dirname + "/.env" });
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
app.use('/api', api);
app.use(express.static('public'));

const server = http.createServer(app);
var io = new Server(server);

server.listen(3000);

const playerDict: { [key: string]: String } = {};

io.on('connection', (socket) => {
  io.to(socket.id).emit('existing_players', default_game.players);
  io.to(socket.id).emit('game_settings', default_game.game_settings);
  socket.on("new_player", (username: String) => {
    default_game.add_player(username);
    playerDict[socket.id] = username;
    socket.join(username.toString());
    socket.broadcast.emit('new_player', username);

    if (default_game.players.length == default_game.game_settings.players) {
      console.log('Game Started');
      start_game(io, playerDict);
    }

  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("player_disconnect", playerDict[socket.id]);
    default_game.remove_player(playerDict[socket.id]);
  })
  socket.on("vote", (data: any) => {
    if (default_game.game_phase == GamePhase.LOBBY_PHASE)
      return;

    // TODO implement werewolf voting in the night
    // if(default_game.game_phase != GamePhase.DAY_PHASE)
    //   return;
    if (default_game.game_phase == GamePhase.DAY_PHASE) {
      let player: Player = default_game.players[0]; // Dummy value
      for (let p of default_game.players) {
        if (p.name.toString() == data.voter_name) {
          if (p.has_voted)
            return;
          else
            player = p;
        }
      }
      default_game.votes[data.player_name] += 1;
      player.has_voted = true;
    } else if (default_game.game_phase == GamePhase.NIGHT_PHASE) {
      console.log("reached wolf vote");
      let werewolf: Player = default_game.players[0]; // Dummy value
      for (let w of default_game.players) {
        if (w.name.toString() == data.voter_name) {
          if (w.has_voted || w.player_type == PlayerType.VILLAGER)
          continue;
          else
            werewolf = w;
        }
      }
      console.log(`werewolf: ${werewolf}`);
      if(werewolf.player_type == PlayerType.WEREWOLF){
        default_game.wolf_votes[data.player_name] += 1;
        werewolf.has_voted = true;
      }
    }

  })

});
