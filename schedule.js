async function fetchData() {
    //ordering the food
    const response = await fetch("https://api.jolpi.ca/ergast/f1/current.json");

    //plating the food
    const data = await response.json();

    //eating the food
    const year = data.MRData.RaceTable.season;
    const races = data.MRData.RaceTable.Races;

    const heading = document.getElementById("mainHeading");
    heading.innerText = `${year} Race Calendar`;

    //creating Cards
    const grid = document.getElementById("scheduleGrid");
    //lookup table for country
    const countryCodes = {
        "Australia": "au",
        "China": "cn",
        "Japan": "jp",
        "Bahrain": "bh",
        "Saudi Arabia": "sa",
        "USA": "us",
        "Italy": "it",
        "Monaco": "mc",
        "Spain": "es",
        "Canada": "ca",
        "Austria": "at",
        "UK": "gb",
        "Hungary": "hu",
        "Belgium": "be",
        "Netherlands": "nl",
        "Azerbaijan": "az",
        "Singapore": "sg",
        "Mexico": "mx",
        "Brazil": "br",
        "Qatar": "qa",
        "UAE": "ae"
    };

    const nextRaceContainer = document.getElementById("nextRaceContainer");
    let nextRace = null;
    const now = new Date();

    for (let race of races) {
        let raceDateTime = new Date(`${race.date}T${race.time}`);
        if (raceDateTime > now) {
            nextRace = race;
            break;
        }
    }

    if (nextRace) {
        let naam = nextRace.raceName;
        let countryName = nextRace.Circuit.Location.country;
        let countryCode = countryCodes[countryName] || "un";
        const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;
        
        let raceDateTime = new Date(`${nextRace.date}T${nextRace.time}`);
        let localDate = raceDateTime.toLocaleDateString();
        let localTime = raceDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

        nextRaceContainer.style.display = "flex";
        nextRaceContainer.innerHTML = `
            <div class="next-race-label">Next Race</div>
            <div class="next-race-details">
                <img src="${flagUrl}" alt="${countryCode}" class="next-race-flag">
                <div class="next-race-info">
                    <h3 style="font-weight: 1000; margin-bottom: 5px; margin-top: 0;">${naam}</h3>
                    <p style="color: rgb(173, 173, 173); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0;"><b>Date:</b> ${localDate} <br> <b>Time:</b> ${localTime}</p>
                </div>
            </div>
            <div class="next-race-countdown" id="countdownTimer">
                -- Days : -- Hours : -- Min : -- Sec
            </div>
        `;

        setInterval(() => {
            let currentTime = new Date();
            let diff = raceDateTime - currentTime;
            if (diff > 0) {
                let days = Math.floor(diff / (1000 * 60 * 60 * 24));
                let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                hours = hours.toString().padStart(2, '0');
                minutes = minutes.toString().padStart(2, '0');
                seconds = seconds.toString().padStart(2, '0');

                document.getElementById("countdownTimer").innerText = `${days} Days : ${hours} Hours : ${minutes} Min : ${seconds} Sec`;
            } else {
                document.getElementById("countdownTimer").innerText = "Race is ON!";
            }
        }, 1000);
    }

    races.forEach(race => {
        let naam = race.raceName;
        let circuitName = race.Circuit.circuitName;
        let url = race.Circuit.url;
        let countryName = race.Circuit.Location.country;
        let countryCode = countryCodes[countryName] || "un";
        const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;
        let lat = race.Circuit.Location.lat;
        let long = race.Circuit.Location.long;
        
        let raceDateTime = new Date(`${race.date}T${race.time}`);
        let localDate = raceDateTime.toLocaleDateString();
        let localTime = raceDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

        let isCompleted = raceDateTime < now;
        let cardClass = isCompleted ? "card card-completed" : "card";
        let completedHTML = isCompleted ? `<p style="color: #00ff3c; font-size: 0.85rem; font-weight: bold; margin: 10px 0 0 0;">Race Completed ✓</p>` : `<br>`;

        grid.innerHTML += `<div class="${cardClass}"> <a href="${url}">
                    <h3 style="font-weight: 1000;">${naam}</h3>
                    <h6 style="color: rgb(0, 250, 208)">${circuitName}</h6>
                    <p style="color: rgb(173, 173, 173); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><b>Date: </b>${localDate}
                    <br>
                    <b>Time: </b>${localTime}
                </p>
                <img id="flagimg" src="${flagUrl}" alt="${countryCode}">
                </a>
                ${completedHTML}
                <a href="https://www.google.com/maps/search/?api=1&query=${lat},${long}"><img id="location" alt="location" src="location.png"></a>

            </div>`
    });
    // Add this inside your fetchData or as a separate function called on load
    function showInstructions() {

    }
}

fetchData();