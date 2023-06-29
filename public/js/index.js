async function print_requests() {
    const response = await fetch("/api/games");
    const jsonData = await response.json();
    var games_list = document.getElementById("games-list");
    games_list.innerText = JSON.stringify(jsonData);
}
print_requests();
