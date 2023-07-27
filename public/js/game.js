// Getting the username
var url = window.location.href;
var getQuery = url.split('?')[1];
var username = getQuery.split('=')[1];

var role = "villager";



var players = [];
players.push(username);
var player_buttons = document.getElementById("player-buttons");
// player_buttons.innerHTML += createButton(username) + '<br>';

function createButton(name){
    // let button = `<button onclick="vote("${name}")">${name}</button>`;
    // let button = "<button onclick=\"vote(\\\"" + name + "\\\")\">"+ name + "</button>";
    // return button;
    var bttn = document.createElement("button");
    bttn.innerText = name;
    bttn.setAttribute('onclick', `vote('${name}')`);
    player_buttons.appendChild(bttn);
    player_buttons.appendChild(document.createElement("br"));

}

function update_player_buttons(){
    player_buttons.innerHTML = "";
    for(let player of players){
        // player_buttons.innerHTML += createButton(player) + '<br>';
        createButton(player);
    }
}
update_player_buttons();

var socket = io();

function vote(name){
    console.log(`Voted ${name}`);
    socket.emit("vote", {voter_name: username, player_name: name});
}

var game_settings;
socket.on("game_settings",(_game_settings)=>{
    game_settings = _game_settings;
})

socket.emit('new_player', username);
socket.on('new_player', (username) => {
    players.push(username);
    update_player_buttons();
})

socket.on('existing_players', (_players)=>{
    for(let player of _players){
        players.push(player.name);
    }
    update_player_buttons();
})

socket.on('player_disconnect', (username)=>{
    let list = [];
    for(let p of players){
        if(p != username){
            list.push(p)
        }
        players = list;
    }
    update_player_buttons();
})
socket.on('player_killed', (username)=>{
    let list = [];
    for(let p of players){
        if(p != username){
            list.push(p)
        }
        players = list;
    }
    update_player_buttons();
})


socket.on("player_role", (player_type)=>{
    switch(player_type){
    case 1:
        role = "villager";
        break;
    case 2:
        role = "werewolf";
        break;
    }
    message("The role of the player is " + role);
})

socket.on("game_phase_change", (game_phase)=>{
    let game_phase_label = document.getElementById("game-phase");
    if(game_phase == 1){
        game_phase_label.innerText = "Day";
        set_timer(game_settings.day_time);
    }else if(game_phase == 2){
        game_phase_label.innerText = "Night";
        set_timer(game_settings.night_time);
    }
})

// Timer
var time_remaining = 0;
var id = 0;
function set_timer(time){
    clearInterval(id);
    id = 0;
    time_remaining = time;
    display_time();
    id = setInterval(()=>{
        time_remaining-=1;
        if(time_remaining <=0){
            clearInterval(id);
            id = 0;
        }else{
            display_time();
        }
    }, 1000);
}

function display_time(){
    let timer = document.getElementById("timer");
    let minutes = Math.floor(time_remaining / 60);
    let seconds = time_remaining - minutes*60;
    timer.innerText = `Timer: ${minutes}:${seconds}`;
}

function message(mes){
    prompt(mes);
}
