(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function o(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(t){if(t.ep)return;t.ep=!0;const a=o(t);fetch(t.href,a)}})();let d="ed6ef54d27fe6cc2f398a9bd585fac51";function p(){if(!d||d==="ed6ef54d27fe6cc2f398a9bd585fac51")throw new Error("OpenWeather API key not configured")}class c{constructor(){this.nflStadiums=[],this.ncaaStadiums=[],this.mlbStadiums=[],this.mlsStadiums=[],this.init()}async init(){try{const e=localStorage.getItem("openweatherApiKey");e&&(d=e),localStorage.getItem("darkModeEnabled")==="true"&&document.body.classList.add("dark-mode"),this.setupEventListeners(),await this.loadFootballStadiumData(),await this.loadBaseballSoccerData()}catch(e){console.error("Initialization error:",e),this.showError("Initialization Error",e.message)}}setupEventListeners(){const e=document.querySelector("#refresh"),o=document.querySelector("#weather-date"),n=document.querySelector("#settings");e&&(e.onclick=()=>this.refreshWeather()),o&&(o.onchange=()=>this.refreshWeather()),n&&(n.onclick=()=>this.openSettings());const t=document.querySelector("#nflDropdown"),a=document.querySelector("#ncaaDropdown"),r=document.querySelector("#mlbDropdown"),i=document.querySelector("#mlsDropdown");t&&t.addEventListener("change",()=>{a&&(a.value="all"),r&&(r.value="all"),i&&(i.value="all"),this.refreshWeather()}),a&&a.addEventListener("change",()=>{t&&(t.value="all"),r&&(r.value="all"),i&&(i.value="all"),this.refreshWeather()}),r&&r.addEventListener("change",()=>{t&&(t.value="all"),a&&(a.value="all"),i&&(i.value="all"),this.refreshWeather()}),i&&i.addEventListener("change",()=>{t&&(t.value="all"),a&&(a.value="all"),r&&(r.value="all"),this.refreshWeather()})}async loadFootballStadiumData(){try{const e=await fetch("/data/stadium_coordinates.json");if(!e.ok)throw new Error("Failed to load stadium data");const o=await e.json();this.nflStadiums=Object.entries(o.nfl).map(([n,t])=>({name:n,...t})),this.ncaaStadiums=Object.entries(o.ncaa).map(([n,t])=>({name:n,...t})),this.populateNflDropdown(),this.populateNcaaDropdown()}catch(e){console.error("Error loading football data:",e),this.showError("Could not load football data","Check connection")}}async loadBaseballSoccerData(){try{const e=await fetch("/data/more_stadium_coordinates.json");if(!e.ok)throw new Error("Failed to load MLB/MLS data");const o=await e.json();this.mlbStadiums=Object.entries(o.mlb).map(([n,t])=>({name:n,...t})),this.mlsStadiums=Object.entries(o.mls).map(([n,t])=>({name:n,...t})),this.populateMlbDropdown(),this.populateMlsDropdown()}catch(e){console.error("Error loading baseball/soccer data:",e),this.showError("Could not load MLB/MLS data","Check connection")}}populateNflDropdown(){const e=document.querySelector("#nflDropdown");e&&(e.innerHTML=`
      <option value="all">All NFL Stadiums</option>
      ${this.nflStadiums.map(o=>`<option value="${o.team}">${o.name} - ${o.team}</option>`).join("")}
    `)}populateNcaaDropdown(){const e=document.querySelector("#ncaaDropdown");e&&(e.innerHTML=`
      <option value="all">All NCAA Stadiums</option>
      ${this.ncaaStadiums.map(o=>`<option value="${o.team}">${o.name} - ${o.team}</option>`).join("")}
    `)}populateMlbDropdown(){const e=document.querySelector("#mlbDropdown");e&&(e.innerHTML=`
      <option value="all">All MLB Stadiums</option>
      ${this.mlbStadiums.map(o=>`<option value="${o.team}">${o.name} - ${o.team}</option>`).join("")}
    `)}populateMlsDropdown(){const e=document.querySelector("#mlsDropdown");e&&(e.innerHTML=`
      <option value="all">All MLS Stadiums</option>
      ${this.mlsStadiums.map(o=>`<option value="${o.team}">${o.name} - ${o.team}</option>`).join("")}
    `)}async refreshWeather(){const e=document.getElementById("weatherList");if(!e)return;e.innerHTML='<div class="loading">Loading weather data...</div>';const o=document.querySelector("#weather-date"),n=(o==null?void 0:o.value)||new Date().toISOString().split("T")[0],t=document.querySelector("#nflDropdown").value,a=document.querySelector("#ncaaDropdown").value,r=document.querySelector("#mlbDropdown").value,i=document.querySelector("#mlsDropdown").value,l=[];if(t!=="all"&&l.push(...this.nflStadiums.filter(s=>s.team===t)),a!=="all"&&l.push(...this.ncaaStadiums.filter(s=>s.team===a)),r!=="all"&&l.push(...this.mlbStadiums.filter(s=>s.team===r)),i!=="all"&&l.push(...this.mlsStadiums.filter(s=>s.team===i)),l.length===0){e.innerHTML='<p class="text-center">No stadium selected.</p>';return}try{p();const s=l.map(h=>this.fetchWeatherForStadium(h,n)),m=await Promise.all(s);this.displayWeather(m)}catch(s){console.error("Error in refreshWeather:",s),this.showError("Could not fetch weather data")}}async fetchWeatherForStadium(e,o){const n=`https://api.openweathermap.org/data/2.5/weather?lat=${e.latitude}&lon=${e.longitude}&units=imperial&appid=${d}`,t=await fetch(n);if(!t.ok)throw new Error(`Weather fetch error: ${t.statusText}`);const a=await t.json();return{stadium:e,weather:a}}displayWeather(e){const o=document.getElementById("weatherList");o&&(o.innerHTML="",e.forEach(n=>{const{stadium:t,weather:a}=n,i=`https://openweathermap.org/img/wn/${a.weather[0].icon}@2x.png`,l=document.createElement("div");l.className="weather-card bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2 w-full text-black dark:text-white",l.innerHTML=`
        <div class="text-lg font-bold">${t.name}</div>
        <div class="text-sm mb-1">${t.team}</div>
        <div class="flex flex-row items-center justify-between">
          <div>
            <div class="text-xl font-bold mb-1">
              ${Math.round(a.main.temp)}°F
            </div>
            <div class="conditions text-sm mb-1">
              <p>${a.weather[0].main}</p>
              <p>Feels like: ${Math.round(a.main.feels_like)}°F</p>
            </div>
            <div class="details text-sm">
              <p>Humidity: ${a.main.humidity}%</p>
              <p>Wind: ${Math.round(a.wind.speed)} mph</p>
            </div>
          </div>
          <div>
            <img
              src="${i}"
              alt="${a.weather[0].description}"
              class="w-12 h-12"
            />
          </div>
        </div>
      `,o.appendChild(l)}))}showError(e,o,n=!1){const t=document.getElementById("weatherList");if(!t)return;t.innerHTML="";const a=document.createElement("div");a.className=`error-message ${n?"api-key-missing":""}`;const r=document.createElement("strong");if(r.textContent=e,a.appendChild(r),o){const l=document.createElement("p");l.textContent=o,a.appendChild(l)}const i=document.createElement("button");i.textContent=n?"Configure API Key":"Try Again",i.addEventListener("click",()=>{n?this.openSettings():window.location.reload()}),a.appendChild(i),t.appendChild(a)}openSettings(){const e=document.createElement("div");e.className="settings-modal fixed inset-0 flex items-center justify-center bg-black/50",JSON.parse(localStorage.getItem("settings")||"{}"),e.innerHTML=`
      <div class="settings-content p-6 rounded-lg max-w-md w-full shadow-md text-black dark:text-white">
        <h2 class="text-xl font-bold text-center mb-4">Settings</h2>
        <div class="settings-section">
          <div class="setting-item mb-3">
            <label for="apiKey" class="block mb-1">OpenWeather API Key</label>
            <input
              type="text"
              id="apiKey"
              placeholder="Enter API Key"
              class="border px-2 py-1 w-full bg-white dark:bg-gray-700 dark:text-white"
              value="${d!=="ed6ef54d27fe6cc2f398a9bd585fac51"?d:""}"
            />
          </div>
          <div class="setting-item mb-3">
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                class="mr-2"
                ${document.body.classList.contains("dark-mode")?"checked":""}
              />
              <span>Enable Dark Mode</span>
            </label>
          </div>
        </div>
        <div class="settings-footer flex justify-end gap-2 mt-4">
          <button class="cancel-btn bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button class="save-btn bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    `,document.body.appendChild(e);const o=e.querySelector(".save-btn"),n=e.querySelector(".cancel-btn"),t=()=>{document.body.removeChild(e)};o.addEventListener("click",()=>{const a=e.querySelector("#apiKey"),r=e.querySelector("#darkMode"),i=a.value.trim(),l=r.checked;i&&(d=i,localStorage.setItem("openweatherApiKey",i),this.refreshWeather()),l?document.body.classList.add("dark-mode"):document.body.classList.remove("dark-mode"),localStorage.setItem("darkModeEnabled",String(l)),t()}),n.addEventListener("click",()=>t()),e.addEventListener("click",a=>{a.target===e&&t()})}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{window.gameWeather=new c}):window.gameWeather=new c;
