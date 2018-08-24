// Variables used for fetching and default values.
const songURL = "https://raw.githubusercontent.com/wsv-accidis/in-sangbok/master/sangbok/main.xml";
const selectorDefaultValue = "All";
// HTML elements that will either be updated or have event listener.
const main = document.querySelector("main");
const selector = document.querySelector("#categorySelector");
const backButton = document.querySelector("#back-button");
const search = document.querySelector("#searchBox");
// Init global variables.
var songs;
var songList;
var xmlDoc;
var allSongsHTML;

// Takes care of all events.
window.addEventListener("load", async e => {
    await window.history.pushState({ page: "list" }, '')
    loadSongs();
    selector.value = selectorDefaultValue;

    selector.addEventListener('change', e => {
        search.value = "";
        updateSongs(e.target.value);
    });

    $("#searchBox").keydown(function(e) {
        searchSong(e.target.value);
    });
    $(".ui-input-clear").click(function() {
        main.innerHTML = allSongsHTML;
    });

    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('https://sangbok.insektionen.se/sw.js');
            console.log("ServiceWorker Registered");
        } catch (error) {
            console.log("ServiceWorker was not registered, error: " + error.target.value);
        }
    }

    // Detects if device is on iOS 
    const isIos = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        }
        // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
        //Do something!
    }
});

// Takes care of the pop of page
window.addEventListener('popstate', function(event) {
    if (event.state == null) {
        history.go(0);
    }
    console.log(event.state);
    updateList();
});

// Loads the songs from github XML file.
async function loadSongs() {
    const res = await fetch(songURL);
    const text = await res.text();
    var parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, "text/xml");
    songs = xmlDoc.getElementsByTagName("song");
    songList = songs;
    updateList();
    allSongsHTML = main.innerHTML;
}

// Updates songslist after the category.
function updateSongs(category = selectorDefaultValue) {
    main.innerHTML = "";
    if (category == "All") {
        songs = xmlDoc.getElementsByTagName("song");
    } else {
        songs = xmlDoc.querySelectorAll('[category="' + category + '"]');
    }
    songList = songs;
    updateList();
}

// Updates the song list.
function updateList() {
    main.innerHTML = "";
    for (let i = 0; i < songList.length; i++) {
        main.innerHTML = main.innerHTML + "\n" + createSongList(songList[i]);
    }

}

// Searches through song title and song text with given query,
// and updates the song list.
function searchSong(query = "") {
    if (query == "") {
        main.innerHTML = allSongsHTML;
        /*songList = songs;
        updateList();*/
        return;
    }
    if (query.length <= 1) {
        return;
    }
    main.innerHTML = "";

    var filteredSongs = [];
    for (let i = 0; i < songs.length; i++) {
        if (songs[i].getAttribute("name").indexOf(query) > -1) {
            filteredSongs.push(songs[i]);
        } else {
            var parts = songs[i].getElementsByTagName("p");
            for (let j = 0; j < parts.length; j++) {
                var songText = parts[j].childNodes[0].nodeValue.toLowerCase();
                if (songText.indexOf(query.toLowerCase()) > -1) {
                    filteredSongs.push(songs[i]);
                    break;
                }
            }
        }
    }

    songList = filteredSongs;
    updateList();
}

// A boolean statement for checking if it is a html entity or empty string.
function filter(part) {
    return (part.indexOf("<p>") > -1) || (part.indexOf("</p>") > -1) || part == "" || (part.indexOf("<comment>") > -1) || (part.indexOf("</comment>") > -1) || (part.indexOf("<header>") > -1) || (part.indexOf("</header>") > -1);
}

// Shows the selected song.
function showSong(songTitle) {
    window.history.pushState({ page: "song" }, '');
    window.scrollTo(0, 0);
    var song;

    for (let i = 0; i < songs.length; i++) {
        if (songs[i].getAttribute("name") == songTitle) {
            song = songs[i];
        }
    }

    var allText = "";
    var songParts = song.innerHTML.split("\n");
    songParts.forEach(part => {
        if (filter(part)) {
            allText = allText + part;
        } else {
            allText = allText + part + "<br>";
        }
    });

    main.innerHTML = createSongPage(song, allText);
}

// Generates the html for the song page.
function createSongPage(song, allText) {
    var html = `
            <div class="song song-page">
                <div id="songInfo">
                    <h2>${song.getAttribute("name")}</h2>
                    <p id="songPageCategory">${song.getAttribute("category")}</p>
				`;
    if (song.getAttribute("author") != null && song.getAttribute("author") != "") {
        html = html + `
				    <p id="songAuthor">by ${song.getAttribute("author")}</p>
		`;
    }
    if (song.getAttribute("melody") != null && song.getAttribute("melody") != "") {
        html = html + `
				    <p id="songMelody">Melody: ${song.getAttribute("melody")}`;
    }
    if (song.getAttribute("composer") != null && song.getAttribute("composer") != "") {
        html = html + `(${song.getAttribute("composer")})`;
    }
    html = html + `</p>
            </div>
				${allText}
			</div>
	`;
    return html;
}

// Makes the html for the song list.
function createSongList(song) {
    return `
		<div class="song" onclick="showSong(\`${song.getAttribute("name")}\`)">
			<h1 class="songTitle">${song.getAttribute("name")}</h1>
			<p class="songSampleText">${song.getElementsByTagName("p")[0].childNodes[0].nodeValue}</p>
			<p class="songCategory">${song.getAttribute("category")}</p>
		</div>
	`;
}