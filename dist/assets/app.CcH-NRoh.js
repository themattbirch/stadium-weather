(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(t){if(t.ep)return;t.ep=!0;const o=a(t);fetch(t.href,o)}})();let i="ed6ef54d27fe6cc2f398a9bd585fac51";console.log("Script loading...");function h(){if(console.log("Checking API key:",i),!i||i==="ed6ef54d27fe6cc2f398a9bd585fac51")throw console.warn("API key not configured"),new Error("OpenWeather API key not configured")}class d{constructor(){this.selectedStadium="all",this.stadiums=[],console.log("GameDayWeather constructor called"),this.init()}showError(e,a,n=!1){console.log("Showing error:",{title:e,message:a,isApiError:n});const t=document.getElementById("weatherList");if(!t){console.error("Weather list element not found in showError");return}const o=document.createElement("div");o.className=`error-message ${n?"api-key-missing":""}`;const r=document.createElement("strong");if(r.textContent=e,o.appendChild(r),a){const c=document.createElement("p");c.textContent=a,o.appendChild(c)}const s=document.createElement("button");s.textContent=n?"Configure API Key":"Try Again",s.addEventListener("click",()=>{n?this.openSettings():window.location.reload()}),o.appendChild(s),t.innerHTML="",t.appendChild(o)}async init(){try{console.log("Initializing GameDayWeather...");const e=localStorage.getItem("openweatherApiKey");e&&(i=e,console.log("Loaded saved API key from localStorage")),localStorage.getItem("darkModeEnabled")==="true"&&document.body.classList.add("dark-mode"),this.setupEventListeners(),await this.loadStadiumData(),console.log("Initialization complete")}catch(e){console.error("Initialization error:",e),this.showError("Initialization Error",e.message)}}setupEventListeners(){console.log("Setting up event listeners");const e=document.querySelector("#refresh"),a=document.querySelector("#weather-date"),n=document.querySelector("#settings"),t=document.querySelector("#stadiumSelect");e&&(e.onclick=()=>{console.log("Refresh clicked"),this.refreshWeather()}),a&&(a.onchange=()=>{console.log("Date changed"),this.refreshWeather()}),n&&(n.onclick=()=>{console.log("Settings clicked"),this.openSettings()}),t&&(t.onchange=()=>{console.log("Stadium selection changed"),this.selectedStadium=t.value,this.refreshWeather()})}async loadStadiumData(){try{const e=await fetch("/data/stadium_coordinates.json");if(!e.ok)throw new Error("Failed to load stadium data");const a=await e.json(),n=Object.entries(a.nfl).map(([o,r])=>({name:o,...r})),t=Object.entries(a.ncaa).map(([o,r])=>({name:o,...r}));this.stadiums=[...n,...t],this.populateStadiumSelector(),console.log("Loaded stadiums:",this.stadiums)}catch(e){console.error("Error loading stadium data:",e),this.showError("Could not load stadium data","Please check your connection and try again")}}populateStadiumSelector(){const e=document.querySelector("#stadiumSelect");e&&(e.innerHTML=`
        <option value="all">All Stadiums</option>
  ${this.stadiums.map(a=>`<option value="${a.team}">
           ${a.name} - ${a.team}
         </option>`).join("")}
    `)}async refreshWeather(){console.log("Refreshing weather data");const e=document.getElementById("weatherList");if(!e){console.error("Weather list element not found");return}e.innerHTML='<div class="loading">Loading weather data...</div>';const a=document.getElementById("weather-date"),n=(a==null?void 0:a.value)||new Date().toISOString().split("T")[0];console.log("Selected date:",n);try{if(!this.stadiums||this.stadiums.length===0)throw new Error("No stadium data available");let t=this.stadiums;this.selectedStadium!=="all"&&(t=this.stadiums.filter(s=>s.team===this.selectedStadium)),console.log("Fetching weather for stadiums:",t);const o=t.map(s=>this.fetchWeatherForStadium(s,n)),r=await Promise.all(o);console.log("Weather data received:",r),this.displayWeather(r)}catch(t){console.error("Error in refreshWeather:",t),this.showError("Could not fetch weather data")}}async fetchWeatherForStadium(e,a){h();const n=`https://api.openweathermap.org/data/2.5/weather?lat=${e.latitude}&lon=${e.longitude}&units=imperial&appid=${i}`;try{const t=await fetch(n);if(!t.ok)throw new Error(`Weather API error: ${t.statusText}`);const o=await t.json();return{stadium:e,weather:o}}catch(t){throw console.error(`Error fetching weather for ${e.name}:`,t),t}}displayWeather(e){const a=document.getElementById("weatherList");a&&(a.innerHTML="",e.forEach(n=>{const{weather:t,stadium:o}=n,r=document.createElement("div");r.className="weather-card bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 w-full",r.innerHTML=`
      <div class="stadium-info">
    <h3>${o.name}</h3>
    <p>${o.team}</p>
  </div>
      <div class="weather-info flex-1">
        <div class="temperature text-xl font-bold mb-1">
          ${Math.round(t.main.temp)}°F
        </div>
        <div class="conditions text-sm mb-1">
          <p>${t.weather[0].main}</p>
          <p>Feels like: ${Math.round(t.main.feels_like)}°F</p>
        </div>
        <div class="details text-sm text-stadium-gray">
          <p>Humidity: ${t.main.humidity}%</p>
          <p>Wind: ${Math.round(t.wind.speed)} mph</p>
        </div>
      </div>
    `,a.appendChild(r)}))}openSettings(){const e=document.createElement("div");e.className=`
  settings-modal 
  fixed inset-0 flex items-center justify-center
  bg-black/50
`,JSON.parse(localStorage.getItem("settings")||"{}"),e.innerHTML=`
  <div class="settings-content bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-md">
    <h2 class="text-xl font-bold text-center mb-4">Settings</h2>
        <div class="settings-section">
          <div class="setting-item">
            <label for="apiKey">OpenWeather API Key</label>
            <input type="text" id="apiKey" placeholder="Enter API Key" 
              value="${i!=="ed6ef54d27fe6cc2f398a9bd585fac51"?i:""}" 
            />
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                id="darkMode" 
                ${document.body.classList.contains("dark-mode")?"checked":""}
              />
              Enable Dark Mode
            </label>
          </div>
        </div>
        <div class="settings-footer">
          <button class="cancel-btn">Cancel</button>
          <button class="save-btn">Save</button>
        </div>
      </div>
    `,document.body.appendChild(e);const a=e.querySelector(".save-btn"),n=e.querySelector(".cancel-btn"),t=()=>{document.body.removeChild(e)};a.addEventListener("click",()=>{console.log("Saving settings");const o=e.querySelector("#apiKey"),r=e.querySelector("#darkMode"),s=o.value.trim(),c=r.checked;s&&(i=s,localStorage.setItem("openweatherApiKey",s),console.log("API Key saved to localStorage"),this.refreshWeather()),c?document.body.classList.add("dark-mode"):document.body.classList.remove("dark-mode"),localStorage.setItem("darkModeEnabled",String(c)),t()}),n.addEventListener("click",()=>{console.log("Cancel settings"),t()}),e.addEventListener("click",o=>{o.target===e&&t()})}async testWeatherAPI(){try{(!this.stadiums||this.stadiums.length===0)&&await this.loadStadiumData();const e=this.stadiums[0],a=await this.fetchWeatherForStadium(e,new Date().toISOString().split("T")[0]);return console.log("API Test Result:",a),!0}catch(e){return e.message&&e.message.includes("API key not configured")?this.showError("API Key Required","Please configure your OpenWeather API key in settings",!0):this.showError("Weather API Error","Could not connect to weather service. Please try again later."),!1}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{console.log("DOM Content Loaded - Creating GameDayWeather instance"),window.gameWeather=new d}):(console.log("DOM already loaded - Creating GameDayWeather instance"),window.gameWeather=new d);
