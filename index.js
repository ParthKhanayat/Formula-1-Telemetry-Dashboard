async function fetchNextRace() {
    try {
        const response = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
            headers: {
                "User-Agent": "F1TelemetryDashboard/1.0"
            }
        });
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;

        const countryCodes = {
            "Australia": "au", "China": "cn", "Japan": "jp", "Bahrain": "bh",
            "Saudi Arabia": "sa", "USA": "us", "Italy": "it", "Monaco": "mc",
            "Spain": "es", "Canada": "ca", "Austria": "at", "UK": "gb",
            "Hungary": "hu", "Belgium": "be", "Netherlands": "nl", "Azerbaijan": "az",
            "Singapore": "sg", "Mexico": "mx", "Brazil": "br", "Qatar": "qa", "UAE": "ae"
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
                <div class="next-race-label" style="font-size: 1.1rem; padding-right: 15px;">Next Race</div>
                <div class="next-race-details" style="gap: 10px;">
                    <img src="${flagUrl}" alt="${countryCode}" class="next-race-flag" style="width: 50px;">
                    <div class="next-race-info">
                        <h3 style="font-size: 0.95rem; margin-bottom: 2px; margin-top: 0; font-weight: 900;">${naam}</h3>
                        <p style="font-size: 0.75rem; color: rgb(173, 173, 173); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0;">${localDate} | ${localTime}</p>
                    </div>
                </div>
                <div class="next-race-countdown" id="countdownTimer" style="font-size: 0.95rem; padding-left: 15px;">
                    -- d : -- h : -- m : -- s
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

                    document.getElementById("countdownTimer").innerText = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
                } else {
                    document.getElementById("countdownTimer").innerText = "Race is ON!";
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Error fetching next race data:", error);
    }
}

fetchNextRace();
