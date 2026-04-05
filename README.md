# F1 Telemetry Dashboard

![F1 Dashboard Hero](bigLogoCropped.png) An interactive, web-based Formula 1 dashboard that provides real-time race telemetry, historical session replays, championship standings, and an interactive season schedule. Built with vanilla web technologies, this project visualizes complex F1 data using asynchronous API integration and HTML5 Canvas animations.

## Features

* **Live Telemetry & Session Replays:** * Automatically detects and connects to live race sessions.
  * Replay historical sessions with adjustable playback speeds (1x, 5x, 10x).
  * Dynamic leaderboard showing live gaps, current tire compounds, speeds, and pit stops.
* **Canvas Track Map:** * Real-time 2D visualization of driver positions using `HTML5 Canvas`.
  * Driver highlighting and interactive hovering.
* **Championship Standings:** * Toggle seamlessly between Driver and Constructor (Team) standings.
  * Color-coded UI based on official F1 team hex codes.
* **Interactive Race Schedule:** * Full season calendar with dynamic country flags.
  * Direct links to official track details and Google Maps coordinates.
* **Fan Profile:** * Save your favorite drivers and customize simulated race alerts (Safety Car, Red Flag).

## Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** Custom CSS with Glassmorphism UI, CSS Grid, and Flexbox. Fully responsive for mobile and desktop.
* **APIs Used:**
  * **[OpenF1 API](https://openf1.org/):** Used for granular car data, positional telemetry, stints, and live timing.
  * **[Ergast Developer API](https://api.jolpi.ca/):** Used for historical championship standings and the season schedule.

## How to Run Locally

This project uses vanilla web technologies and does not require Node.js or a bundler to run. 

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ParthKhanayat/Formula-1-Telemetry-Dashboard.git](https://github.com/ParthKhanayat/Formula-1-Telemetry-Dashboard.git)
  2. **Navigate to the project directory:**
     ```bash

    cd Formula-1-Telemetry-Dashboard

    Open the application:

        Simply double-click index.html to open it in your browser.

        Alternatively (Recommended): Use the Live Server extension in VS Code to avoid any CORS issues during API fetching.

📁 Project Structure

    index.html - The main landing page.

    telemetry.html / telemetry.js - Core logic for API polling, rate-limiting, and Canvas map rendering.

    standings.html / standings.js - Logic for fetching and toggling championship points.

    schedule.html / schedule.js - Logic for generating the interactive race calendar grid.

    fanProfile.html / fanProfile.js - Form handling and local user preferences.

    style.css - Global stylesheet containing dark mode aesthetics and F1 team color variables.

**⚠️ Note on API Rate Limits**

This application makes sequential fetch() requests to the OpenF1 API to prevent 429 Too Many Requests errors. If data fails to load initially, the API may be experiencing high traffic. Wait a few seconds and try refreshing the session.

**👨‍💻 Author**

Parth Khanayat

    GitHub: @ParthKhanayat
