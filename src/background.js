chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle') {
        chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
            if (!tab) return;
            const url = tab.url;
            let airportCode = "";
            const matchFR24 = url.match(/flightradar24\.com\/airport\/([A-Z]{3,4})(\/)?/i);
            if (matchFR24) {
                airportCode = matchFR24[1].toUpperCase();
                chrome.tabs.create({ url: `https://www.liveatc.net/search/?icao=${airportCode}` });
            } else if (url.includes("liveatc.net/search/?icao=") || url.includes("liveatc.net/search//?icao=")) {
                airportCode = url.split('=').pop().toUpperCase();
                chrome.tabs.create({ url: `https://www.flightradar24.com/airport/${airportCode}` });
            } else return;
        })  
    }
})