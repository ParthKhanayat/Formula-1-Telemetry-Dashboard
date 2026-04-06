const sessionSelect = document.getElementById("sessionSelect");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 300;
let animationId;
let activeDrivers = [];
let hoveredDriver = null;
let currentSessionLaps = [];
let currentLap = 0;

//load session function
//fetches the data from api and updates the list and see if a live race is happening
async function loadSessions() {
    const currentYear = 2026;
    const response = await fetch(`https://api.openf1.org/v1/sessions?year=${currentYear}`);
    const sessions = await response.json();

    sessionSelect.innerHTML = "";
    const now = new Date();
    let isLiveRace = false;

    const races = sessions.filter(session => session.session_name === "Race");
    races.forEach(race => {
        const startTime = new Date(race.date_start);
        const endTime = new Date(race.date_end);

        //check if LIVE
        if (now >= startTime && now <= endTime) {
            isLiveRace = true;
            document.getElementById("telemetryHeading").innerHTML = `<h2><b style="color: #FF1801;">🔴 LIVE: </b> ${race.meeting_name} ${currentYear}</h2>`;
        }

        //add to dropdown if finished
        if (now > endTime) {
            const optionHTML = `<option value="${race.session_key}">${race.country_name} Grand Prix</option>`
            sessionSelect.innerHTML += optionHTML;
        }
    });
    const replayFieldset = document.querySelector('#replayControls fieldset');
    const replayForm = document.getElementById("replayControls");
    if (isLiveRace) {
        replayFieldset.style.display = "none";
        const liveMessage = document.createElement("div");
        liveMessage.innerHTML = "<h3 style='color: #FF1801; text-align: center; border: 1px solid #FF1801; padding: 15px; border-radius: 8px; background: rgba(255, 24, 1, 0.1);'>🏎️ LIVE RACE IN PROGRESS 🏎️</h3>";
        replayForm.appendChild(liveMessage);

    }
    else {
        replayFieldset.style.display = "flex";
    }
}

//replay function
async function startReplay() {
    const selectedSession = document.getElementById("sessionSelect").value;
    if (!selectedSession) {
        alert("Please select a race")
        return;
    }

    const startBtn = document.querySelector('button[onclick="startReplay()"]');
    if (startBtn) {
        startBtn.disabled = true;
        alert("Status: Replay active. Cars are waiting for the green light. (Wait 5 seconds or increase playback speed to skip).");
        startBtn.innerText = "Loading...";
    }

    const baseUrl = "https://api.openf1.org/v1";
    let results, drivers, stints, sessionDetails;

    try {
        // Fetch sequentially to prevent "429 Too Many Requests" bursts
        const resRes = await fetch(`${baseUrl}/session_result?session_key=${selectedSession}`);
        if (!resRes.ok) throw new Error("API Rate Limit");
        results = await resRes.json();

        const drRes = await fetch(`${baseUrl}/drivers?session_key=${selectedSession}`);
        if (!drRes.ok) throw new Error("API Rate Limit");
        drivers = await drRes.json();

        const stRes = await fetch(`${baseUrl}/stints?session_key=${selectedSession}`);
        stints = stRes.ok ? await stRes.json() : [];

        const seRes = await fetch(`${baseUrl}/sessions?session_key=${selectedSession}`);
        sessionDetails = seRes.ok ? await seRes.json() : [{ date_start: new Date().toISOString() }];

    } catch (error) {
        alert("Could not load race data. OpenF1 API is overloaded (Rate Limited). Please wait 30 seconds and click Start again.");
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerText = "Start Replay";
        }
        return;
    }

    const tableBody = document.getElementById("positionsBody");
    tableBody.innerHTML = "";
    activeDrivers = []; //clears the canvas

    currentLap = 1; 
    const leaderDriverNum = results[0]?.driver_number;
    if (leaderDriverNum) {
        try {
            const lapsRes = await fetch(`${baseUrl}/laps?session_key=${selectedSession}&driver_number=${leaderDriverNum}`);
            if (lapsRes.ok) {
                currentSessionLaps = await lapsRes.json();
                if (currentSessionLaps.length > 0 && currentSessionLaps[0].lap_number > 0) {
                    currentLap = currentSessionLaps[0].lap_number;
                }
            }
        } catch(e) {
            console.warn("Failed to load laps, ignoring...", e);
        }
    }

    if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerText = "Start Replay";
    }

    const pauseBtn = document.querySelector('button[onclick="pauseReplay()"]');
    if (pauseBtn) pauseBtn.innerText = 'Pause';

    //Sort results: P1 at the top, dnf/nulls pushed to the bottom
    results.sort((a, b) => {
        if (a.position === null && b.position === null) return 0;
        if (a.position === null) return 1;
        if (b.position === null) return -1;

        return a.position - b.position;
    });

    results.forEach((result) => {
        //to get driver name acronym and hexcolor for drivers array
        const driverInfo = drivers.find(d => d.driver_number === result.driver_number);
        if (!driverInfo) return; //skip if data is missing

        //find all stints for this specific driver to calculate pitsd and tires
        const driverStints = stints.filter(s => s.driver_number === result.driver_number);

        //calculate total pitstops(total stints-1)
        const pits = driverStints.length > 0 ? driverStints.length - 1 : 0;

        //find the current tyre compound
        let currentTire = "Unknown";
        if (driverStints.length > 0) {
            //sort their stints so the highest(most recent) number is first(reversesort)
            driverStints.sort((a, b) => b.stint_number - a.stint_number);
            currentTire = driverStints[0].compound || "Unknown";
        }

        const driverName = driverInfo.name_acronym;
        const hexColor = `#${driverInfo.team_colour || "ffffff"}`;

        // Determine what to show in the Leader column
        let displayGap = "";
        if (result.position === 1) {
            displayGap = "Leader";
        } else if (result.position === null) {
            // Check the API's boolean flags for DNF, DNS, DSQ
            if (result.dnf) displayGap = "DNF";
            else if (result.dns) displayGap = "DNS";
            else if (result.dsq) displayGap = "DSQ";
            else displayGap = "OUT"; //for no position
        } else {
            // For normal finishers, show the gap
            displayGap = result.gap_to_leader !== null ? result.gap_to_leader : "-";
        }

        //adding rows to table
        const rowHTML = `<tr id="row-${result.driver_number}" style="border-bottom: 1px solid ${hexColor}40; cursor: pointer;" 
                onmouseover="highlightDriver('${driverName}')" 
                onmouseout="removeHighlight()">
                <td><div class="cell-content" style="color: ${hexColor}; font-weight: bold;">${driverName}</div></td>
                <td><div class="cell-content">${currentTire}</div></td> 
                <td><div class="cell-content" id="speed-${result.driver_number}">0 km/h</div></td> 
                <td><div class="cell-content">${pits}</div></td> 
                <td><div class="cell-content" id="gap-${result.driver_number}">${displayGap}</div></td>
                <td><div class="cell-content" style="color: white; font-weight: bold;" id="pos-${result.driver_number}">P${result.position}</div></td>
            </tr>`;
        tableBody.innerHTML += rowHTML;

        //save driver data to activeDriver array(for canvas)
        activeDrivers.push(
            {
                number: result.driver_number,
                name: driverName,
                color: hexColor,
                angle: 0, 
                baseSpeed: 0
            }
        )
    });

    if (animationId) cancelAnimationFrame(animationId);
    startTelemetryHeartbeat(selectedSession, sessionDetails[0].date_start);
    animateTelemetry();
}


function drawTrack() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 140;

    // Draw the grey asphalt track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw the starting line
    ctx.beginPath();
    ctx.moveTo(cx + radius - 10, cy);
    ctx.lineTo(cx + radius + 10, cy);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.stroke();
}

function animateTelemetry() {
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   
    drawTrack();

  
    let speedInput = document.querySelector('input[name="speed"]:checked');
    let speedMultiplier = speedInput ? parseInt(speedInput.value) : 1;
    if (!isPlaying) speedMultiplier = 0;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 140;

   
    activeDrivers.forEach(driver => {
       
        driver.angle -= (driver.baseSpeed * speedMultiplier);

   
        const x = cx + radius * Math.cos(driver.angle);
        const y = cy + radius * Math.sin(driver.angle);

  
        const isHovered = (driver.name === hoveredDriver);
        const dotSize = isHovered ? 12 : 6;

        // Draw the dot
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
        ctx.fillStyle = driver.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = isHovered ? "bold 14px Orbitron" : "10px Orbitron";
        ctx.fillText(driver.name, x + 10, y + 5);
    });

    if (currentLap > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "bold 24px Orbitron";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`LAP ${currentLap}`, cx, cy);
    }
    animationId = requestAnimationFrame(animateTelemetry);
}
//event handling functions
function highlightDriver(acronym) {
    hoveredDriver = acronym;
}

function removeHighlight() {
    hoveredDriver = null;
}


loadSessions();
drawTrack(); // Draw an empty track right when the page loads



let telemetryTimer;
let virtualTime;
let isPlaying = false;

async function startTelemetryHeartbeat(sessionKey, dateStart) {
    if (telemetryTimer) clearTimeout(telemetryTimer);
    
    // Default to the exact start of the session
    virtualTime = new Date(dateStart).getTime();

    // If laps were successfully loaded, skip empty pre-race data and jump to Lap 1
    if (currentSessionLaps && currentSessionLaps.length > 0) {
        const firstLap = currentSessionLaps[0];
        if (firstLap && firstLap.date_start) {
            // start gracefully 5 seconds before Lap 1 starts 
            virtualTime = new Date(firstLap.date_start).getTime() - 5000;
        }
    }

    isPlaying = true;
    runHeartbeatTick(sessionKey);
}

async function runHeartbeatTick(sessionKey) {
    if (!isPlaying) return;

    const speedInput = document.querySelector('input[name="speed"]:checked');
    const speedMultiplier = speedInput ? parseInt(speedInput.value) : 1;

    const lowerBound = new Date(virtualTime).toISOString();
    virtualTime += (2000 * speedMultiplier);
    const upperBound = new Date(virtualTime).toISOString();

    if (currentSessionLaps && currentSessionLaps.length > 0) {
        const lapObj = currentSessionLaps.slice().reverse().find(l => new Date(l.date_start).getTime() <= virtualTime);
        if (lapObj) {
            currentLap = lapObj.lap_number;
        }
    }

    try {
        // Sequential requests directly mitigate OpenF1 strict rate limit
        let carData = [];
        const speedRes = await fetch(`https://api.openf1.org/v1/car_data?session_key=${sessionKey}&date%3E${lowerBound}&date%3C${upperBound}`);
        if (speedRes.ok) {
            carData = await speedRes.json();
        }

        let posData = [];
        const posRes = await fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}&date%3E${lowerBound}&date%3C${upperBound}`);
        if (posRes.ok) {
            posData = await posRes.json();
        }

        if (Array.isArray(carData)) {
            carData.forEach(telemetry => {
                const speedCell = document.getElementById(`speed-${telemetry.driver_number}`);
                if (speedCell) {
                    speedCell.innerText = `${telemetry.speed || 0} km/h`;
                }
                const driver = activeDrivers.find(d => d.number === telemetry.driver_number);
                if (driver) {
                    driver.baseSpeed = (telemetry.speed || 0) / 10000;
                }
            });
        }

        if (Array.isArray(posData)) {
            let positionsChanged = false; // Track if we need to animate
            posData.forEach(pos => {
                const posCell = document.getElementById(`pos-${pos.driver_number}`);
                if (posCell) {
                    const newPosText = `P${pos.position}`;
                    // Only update and flag if the position is different
                    if (posCell.innerText !== newPosText) {
                        posCell.innerText = newPosText;
                        positionsChanged = true;
                    }
                }
            });
            // Run the sorting animation if anyone overtook!
            if (positionsChanged) {
                animateLeaderboard();
            }
        }
    } catch (error) {
        console.warn(error);
    }

    telemetryTimer = setTimeout(() => runHeartbeatTick(sessionKey), 2500);
}
function animateLeaderboard() {
    const tbody = document.getElementById("positionsBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

   
    const firstPositions = new Map();
    rows.forEach(row => firstPositions.set(row.id, row.getBoundingClientRect().top));

 
    rows.sort((a, b) => {
        const aNum = a.id.split('-')[1];
        const bNum = b.id.split('-')[1];
        
       
        const aPos = parseInt(document.getElementById(`pos-${aNum}`).innerText.replace('P', '')) || 999;
        const bPos = parseInt(document.getElementById(`pos-${bNum}`).innerText.replace('P', '')) || 999;
        
        return aPos - bPos;
    });

   
    rows.forEach(row => tbody.appendChild(row));

 
    rows.forEach(row => {
        const oldTop = firstPositions.get(row.id);
        const newTop = row.getBoundingClientRect().top;
        const delta = oldTop - newTop; 

        if (delta !== 0) {
            const elementsToAnimate = Array.from(row.querySelectorAll('.cell-content'));
            
            elementsToAnimate.forEach(el => {
                el.style.transform = `translateY(${delta}px)`;
                el.style.transition = 'none';
            });

           
            requestAnimationFrame(() => {
                row.offsetHeight; 
                elementsToAnimate.forEach(el => {
                    el.style.transform = 'translateY(0)';
                    el.style.transition = 'transform 0.5s ease-in-out';
                });
            });
        }
    });
}
function pauseReplay() {
    isPlaying = !isPlaying;
    const btn = document.querySelector('button[onclick="pauseReplay()"]');
    
    if (isPlaying) {
        if (btn) btn.innerText = 'Pause';
        const selectedSession = document.getElementById("sessionSelect").value;
        runHeartbeatTick(selectedSession);
    } else {
        if (btn) btn.innerText = 'Resume';
        if (telemetryTimer) clearTimeout(telemetryTimer);
    }
}
