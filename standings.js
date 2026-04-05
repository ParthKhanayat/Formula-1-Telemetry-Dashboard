let currentTab='drivers';
let year="";
const teamColors = {
    "mercedes": "#27F4D2",
    "red_bull": "#3671C6",
    "ferrari": "#E8002D",
    "mclaren": "#FF8000",
    "aston_martin": "#229971",
    "alpine": "#0093CC",
    "haas": "#B6BABD",
    "rb": "#6692FF",
    "sauber": "#52E252",
    "williams": "#64C4FF"
};
async function fetchData() {
    //setting which link to fetch
    let endpoint="";
    let results="";
    if(currentTab==='drivers')
    {
        endpoint='driverStandings';
    }
    else if(currentTab==='constructors')
    {
        endpoint='constructorStandings';
    }
    //fetching and organising json
    const response= await fetch(`https://api.jolpi.ca/ergast/f1/current/${endpoint}.json`);
    const data= await response.json();
    //setting up the current year
    year=data.MRData.StandingsTable.season;
    
    const standingList=data.MRData.StandingsTable.StandingsLists[0];
    
    //getting results
    if(currentTab==='drivers')
    {
        results=standingList.DriverStandings;
    }
    else if(currentTab==='constructors')
    {
        results=standingList.ConstructorStandings;
    }
    renderTable(results);
}

async function switchTab(type)
{
    if(type===currentTab) return;
    currentTab=type;

    const bg=document.getElementById("togglebg");
    const heading=document.getElementById("standingHeading");
    if(type==='drivers')
    {
        bg.style.transform="translateX(0px)"
        heading.innerText=`${year} Driver Standings`
    }
    else
    {
        bg.style.transform="translateX(155px)"
        heading.innerText=`${year} Team Standings`
    }
    
    fetchData();
    


}
function renderTable(results)
{
    const head=document.getElementById("tableHeader");
    const body=document.getElementById("standingsBody");

    //clear previous rows
    body.innerHTML=""

    if(currentTab==="drivers")
    {
        head.innerHTML="<th>Pos</th><th>Driver</th><th>Constructor</th><th>Points</th>";

        results.forEach(item => {
            const constructorID=item.Constructors[0].constructorId;
            const teamColor=teamColors[constructorID] || "#ffffff";
            body.innerHTML+= `
            <tr style=" border-bottom: 2px solid ${teamColor}">
            <td>${item.position}</td>
            <td>${item.Driver.familyName}</td>
            <td style="color: ${teamColor}"><b>${item.Constructors[0].name}</b></td>
            <td><b>${item.points}</b></td>
            </tr>
            `
            
        });
    }
    else
    {
        head.innerHTML="<th>Pos</th><th>Team</th><th>Nationality</th><th>Points</th>";

        results.forEach(item => {
            const constructorID=item.Constructor.constructorId;
            const teamColor=teamColors[constructorID] || "#ffffff";
            body.innerHTML+= `
            <tr style="border-bottom: 2px solid ${teamColor}">
            <td>${item.position}</td>
            <td style="color:${teamColor}"><b>${item.Constructor.name}</b></td>
            <td>${item.Constructor.nationality}</td>
            <td><b>${item.points}</b></td>
            </tr>
            `
            
        });
    }
}
document.addEventListener("DOMContentLoaded",fetchData);