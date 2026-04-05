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
    races.forEach(race => {
        let naam = race.raceName;
        let circuitName = race.Circuit.circuitName;
        let url = race.Circuit.url;
        let date = race.date;
        let time = race.time;
        let countryName = race.Circuit.Location.country;
        let countryCode = countryCodes[countryName] || "un";
        const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;
        let lat = race.Circuit.Location.lat;
        let long = race.Circuit.Location.long;
        grid.innerHTML += `<div class="card"> <a href="${url}">
                    <h3 style="font-weight: 1000;">${naam}</h3>
                    <h6 style="color: rgb(0, 250, 208)">${circuitName}</h6>
                    <p style="color: rgb(173, 173, 173); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><b>Date: </b>${date}
                    <br>
                    <b>Time: </b>${time}
                </p>
                <img id="flagimg" src="${flagUrl}" alt="${countryCode}">
                </a>
                <br>
                <a href="https://www.google.com/maps/search/?api=1&query=${lat},${long}"><img id="location" alt="location" src="location.png"></a>

            </div>`
    });
    // Add this inside your fetchData or as a separate function called on load
    function showInstructions() {

    }
}

fetchData();