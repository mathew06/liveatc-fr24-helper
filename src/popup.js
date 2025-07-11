const tabStatus = document.getElementById("tabStatus");
const actionBtn = document.getElementById("actionBtn");
const favBtn = document.getElementById("favBtn");
const favList = document.getElementById("favList");
favBtn.title = "Toggle as favorite airport"

let currentAirport = null;

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = tab.url || "";
    const matchFR24 = url.match(/flightradar24\.com\/airport\/([A-Z]{3,4})(\/)?/i);
    if (matchFR24) {
        const airportCode = matchFR24[1].toUpperCase();
        currentAirport = airportCode;
        tabStatus.textContent = `You're on FlightRadar24.com`;
        actionBtn.textContent = `Open ATC feed for ${airportCode}`;
        actionBtn.style.display = "block";
        favBtn.style.display = "inline-block";
        actionBtn.onclick = () => {
            chrome.tabs.create({ url: `https://www.liveatc.net/search/?icao=${airportCode}` });
        };
    }else if (url.includes("liveatc.net/search/?icao=") || url.includes("liveatc.net/search//?icao=")) {
        const airportCode = url.split('=').pop().toUpperCase();
        currentAirport = airportCode;
        tabStatus.textContent = `You're on LiveATC.net`;
        chrome.tabs.sendMessage(tab.id, { checkFeed: true }, (response) => {
            if (response && response.feedAvailable) {
                actionBtn.textContent = `Open ${airportCode} on FlightRadar24`;
                actionBtn.style.display = "block";
                favBtn.style.display = "inline-block";
                actionBtn.onclick = () => {
                    chrome.tabs.create({ url: `https://www.flightradar24.com/airport/${airportCode}` });
                }
            } else {
                tabStatus.innerHTML += `<br>No ATC feed found for ${airportCode}.<br><i>Visit <a href="https://www.liveatc.net/map/feedmap.php" target="_blank">LiveATC coverage map</a>.</i>`
            };
        })
    } else {
        tabStatus.textContent = "This is not a FlightRadar24 airport page / LiveATC search page.";
    }
    loadFavorites();
});

favBtn.addEventListener("click", async () => {
    if (!currentAirport)
        return;
    const storage = await chrome.storage.sync.get("favorites");
    const favorites = storage.favorites || [];

    if (favorites.includes(currentAirport)) {
        const updatedFavorites = favorites.filter(ap => ap !== currentAirport);
        await chrome.storage.sync.set({ favorites: updatedFavorites });
        favBtn.textContent = "Favorite"
    } else {
        favorites.push(currentAirport);
        await chrome.storage.sync.set({ favorites });
        favBtn.textContent = "Favorited";
    }
    loadFavorites();
})

const loadFavorites = async () => {
    const storage = await chrome.storage.sync.get("favorites");
    const favorites = storage.favorites || [];

    favList.innerHTML = "";

    if (favorites.length === 0)
        favList.innerHTML = `<p style="color: #777; margin: 0;"><i>No favorites yet.</i></p>`

    favorites.forEach(airport => {
        const row = document.createElement("li");
        const title = document.createElement("div");
        title.textContent = airport;
        title.className = "title";
        const frImg = document.createElement("img");
        frImg.src = "assets/flightradar24.png";
        frImg.title = `Go to FlightRadar24 ${airport}`;
        frImg.className = "favImg"
        frImg.onclick = () => {
            chrome.tabs.create({ url: `https://flightradar24.com/airport/${airport}` });
        }
        const laImg = document.createElement("img");
        laImg.src = "assets/liveatc.png";
        laImg.title = `Go to LiveATC ${airport}`;
        laImg.className = "favImg"
        laImg.onclick = () => {
            chrome.tabs.create({ url: `https://liveatc.net/search/?icao=${airport}` });
        }
        row.appendChild(title)
        row.appendChild(frImg)
        row.appendChild(laImg)
        favList.appendChild(row);
    });
    if (favorites.includes(currentAirport)) {
        favBtn.textContent = "Favorited";
    } else {
        favBtn.textContent = "Favorite";
    }
}
