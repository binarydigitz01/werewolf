import {Router} from "express";
import {default_game} from "../game";

export const router = Router();

// TODO implement this
router.get("/joingame",(req,res,next)=>{
  const username = req.query.uname;
  if(username == ""){
    res.sendStatus(400);
  }
  // default_game.add_player(String(username));
  res.redirect("/game.html?uname="+username);
})
