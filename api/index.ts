import {Router} from "express";
import {Game, GamePhase, games} from "../src/game"

export const api = Router();

api.post("/newgame", function(req,res,next){
  try {
    if(req.body.name == "")
      throw "Game name is a required field";
    console.log(req.body);
    let game = new Game(req.body.name, req.body.password);
    games.push(game);
    res.sendStatus(200);
  } catch (e){
    console.log("Could not create game");
    console.log(e);
    res.status(400).send(e);
  }
})

api.get("/games", function(req,res,next){
  let lobby_games : Game[] = [];
  for(let game of games){
    if(game.game_phase == GamePhase.LOBBY_PHASE){
      lobby_games.push(game);
    }
  }
  res.send(JSON.stringify(lobby_games));
})
