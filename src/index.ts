// /src/index.ts
import './styles.css';

let OPENWEATHER_API_KEY = 'ed6ef54d27fe6cc2f398a9bd585fac51';

function checkApiKey() {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'ed6ef54d27fe6cc2f398a9bd585fac51') {
    throw new Error('OpenWeather API key not configured');
  }
}

class GameDayWeather {
  private nflStadiums: any[] = [];
  private ncaaStadiums: any[] = [];
  private mlbStadiums: any[] = [];
  private mlsStadiums: any[] = [];

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    try {
      const savedApiKey = localStorage.getItem('openweatherApiKey');
      if (savedApiKey) {
        OPENWEATHER_API_KEY = savedApiKey;
      }
      if (localStorage.getItem('darkModeEnabled') === 'true') {
        document.body.classList.add('dark-mode');
      }

      this.setupEventListeners();
      await this.loadFootballStadiumData();
      await this.loadBaseballSoccerData();
    } catch (error: any) {
      console.error('Initialization error:', error);
      this.showError('Initialization Error', error.message);
    }
  }

  setupEventListeners(): void {
    const refreshButton = document.querySelector('#refresh') as HTMLButtonElement;
    const dateInput = document.querySelector('#weather-date') as HTMLInputElement;
    const settingsButton = document.querySelector('#settings') as HTMLButtonElement;

    // Refresh button
    if (refreshButton) {
      refreshButton.onclick = () => this.refreshWeather();
    }

    // Date input -> triggers refresh on change
    if (dateInput) {
      dateInput.onchange = () => this.refreshWeather();
    }

    // Settings
    if (settingsButton) {
      settingsButton.onclick = () => this.openSettings();
    }

    // 4 dropdowns
    const nflDropdown = document.querySelector('#nflDropdown') as HTMLSelectElement;
    const ncaaDropdown = document.querySelector('#ncaaDropdown') as HTMLSelectElement;
    const mlbDropdown = document.querySelector('#mlbDropdown') as HTMLSelectElement;
    const mlsDropdown = document.querySelector('#mlsDropdown') as HTMLSelectElement;

    // each dropdown sets others to 'all' & auto refresh
    if (nflDropdown) {
      nflDropdown.addEventListener('change', () => {
        if (ncaaDropdown) ncaaDropdown.value = 'all';
        if (mlbDropdown) mlbDropdown.value = 'all';
        if (mlsDropdown) mlsDropdown.value = 'all';
        this.refreshWeather();
      });
    }
    if (ncaaDropdown) {
      ncaaDropdown.addEventListener('change', () => {
        if (nflDropdown) nflDropdown.value = 'all';
        if (mlbDropdown) mlbDropdown.value = 'all';
        if (mlsDropdown) mlsDropdown.value = 'all';
        this.refreshWeather();
      });
    }
    if (mlbDropdown) {
      mlbDropdown.addEventListener('change', () => {
        if (nflDropdown) nflDropdown.value = 'all';
        if (ncaaDropdown) ncaaDropdown.value = 'all';
        if (mlsDropdown) mlsDropdown.value = 'all';
        this.refreshWeather();
      });
    }
    if (mlsDropdown) {
      mlsDropdown.addEventListener('change', () => {
        if (nflDropdown) nflDropdown.value = 'all';
        if (ncaaDropdown) ncaaDropdown.value = 'all';
        if (mlbDropdown) mlbDropdown.value = 'all';
        this.refreshWeather();
      });
    }
  }

  // LOAD DATA
  async loadFootballStadiumData(): Promise<void> {
    try {
      const response = await fetch('/data/stadium_coordinates.json');
      if (!response.ok) throw new Error('Failed to load stadium data');

      const data = await response.json();
      this.nflStadiums = Object.entries(data.nfl).map(([name, info]: [string, any]) => ({
        name,
        ...(info as object)
      }));
      this.ncaaStadiums = Object.entries(data.ncaa).map(([name, info]: [string, any]) => ({
        name,
        ...(info as object)
      }));

      this.populateNflDropdown();
      this.populateNcaaDropdown();
    } catch (error) {
      console.error('Error loading football data:', error);
      this.showError('Could not load football data', 'Check connection');
    }
}

async loadBaseballSoccerData(): Promise<void> {
    try {
      const response = await fetch('/data/more_stadium_coordinates.json');
      if (!response.ok) throw new Error('Failed to load MLB/MLS data');

      const data = await response.json();
      this.mlbStadiums = Object.entries(data.mlb).map(([name, info]: [string, any]) => ({
        name,
        ...(info as object)
      }));
      this.mlsStadiums = Object.entries(data.mls).map(([name, info]: [string, any]) => ({
        name,
        ...(info as object)
      }));

      this.populateMlbDropdown();
      this.populateMlsDropdown();
    } catch (error) {
      console.error('Error loading baseball/soccer data:', error);
      this.showError('Could not load MLB/MLS data', 'Check connection');
    }
}

  // POPULATE DROPDOWNS
  populateNflDropdown(): void {
    const el = document.querySelector('#nflDropdown') as HTMLSelectElement;
    if (!el) return;
    el.innerHTML = `
      <option value="all">All NFL Stadiums</option>
      ${this.nflStadiums
        .map((s) => `<option value="${s.team}">${s.name} - ${s.team}</option>`)
        .join('')}
    `;
  }
  populateNcaaDropdown(): void {
    const el = document.querySelector('#ncaaDropdown') as HTMLSelectElement;
    if (!el) return;
    el.innerHTML = `
      <option value="all">All NCAA Stadiums</option>
      ${this.ncaaStadiums
        .map((s) => `<option value="${s.team}">${s.name} - ${s.team}</option>`)
        .join('')}
    `;
  }
  populateMlbDropdown(): void {
    const el = document.querySelector('#mlbDropdown') as HTMLSelectElement;
    if (!el) return;
    el.innerHTML = `
      <option value="all">All MLB Stadiums</option>
      ${this.mlbStadiums
        .map((s) => `<option value="${s.team}">${s.name} - ${s.team}</option>`)
        .join('')}
    `;
  }
  populateMlsDropdown(): void {
    const el = document.querySelector('#mlsDropdown') as HTMLSelectElement;
    if (!el) return;
    el.innerHTML = `
      <option value="all">All MLS Stadiums</option>
      ${this.mlsStadiums
        .map((s) => `<option value="${s.team}">${s.name} - ${s.team}</option>`)
        .join('')}
    `;
  }

  // REFRESH
  async refreshWeather() {
    const weatherList = document.getElementById('weatherList');
    if (!weatherList) return;
    weatherList.innerHTML = '<div class="loading">Loading weather data...</div>';

    const dateEl = document.querySelector('#weather-date') as HTMLInputElement;
    const dateVal = dateEl?.value || new Date().toISOString().split('T')[0];

    // get dropdown values
    const nflVal = (document.querySelector('#nflDropdown') as HTMLSelectElement).value;
    const ncaaVal = (document.querySelector('#ncaaDropdown') as HTMLSelectElement).value;
    const mlbVal = (document.querySelector('#mlbDropdown') as HTMLSelectElement).value;
    const mlsVal = (document.querySelector('#mlsDropdown') as HTMLSelectElement).value;

    // filter
    const toFetch: any[] = [];
    if (nflVal !== 'all') {
      toFetch.push(...this.nflStadiums.filter((s) => s.team === nflVal));
    }
    if (ncaaVal !== 'all') {
      toFetch.push(...this.ncaaStadiums.filter((s) => s.team === ncaaVal));
    }
    if (mlbVal !== 'all') {
      toFetch.push(...this.mlbStadiums.filter((s) => s.team === mlbVal));
    }
    if (mlsVal !== 'all') {
      toFetch.push(...this.mlsStadiums.filter((s) => s.team === mlsVal));
    }

    if (toFetch.length === 0) {
      weatherList.innerHTML = '<p class="text-center">No stadium selected.</p>';
      return;
    }

    try {
      checkApiKey();
      const fetches = toFetch.map((stadium) => this.fetchWeatherForStadium(stadium, dateVal));
      const weatherData = await Promise.all(fetches);
      this.displayWeather(weatherData);
    } catch (error) {
      console.error('Error in refreshWeather:', error);
      this.showError('Could not fetch weather data');
    }
  }

  async fetchWeatherForStadium(stadium: any, date: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${stadium.latitude}&lon=${stadium.longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Weather fetch error: ${resp.statusText}`);
    const weather = await resp.json();
    return { stadium, weather };
  }

  // DISPLAY
  displayWeather(weatherDataArray: any[]) {
    const weatherList = document.getElementById('weatherList');
    if (!weatherList) return;
    weatherList.innerHTML = '';

    weatherDataArray.forEach((data) => {
      const { stadium, weather } = data;

      // get weather icon from OpenWeather
      const iconCode = weather.weather[0].icon; // e.g. '04d'
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      const card = document.createElement('div');
      card.className =
        'weather-card bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2 w-full text-black dark:text-white';

      card.innerHTML = `
        <div class="text-lg font-bold">${stadium.name}</div>
        <div class="text-sm mb-1">${stadium.team}</div>
        <div class="flex flex-row items-center justify-between">
          <div>
            <div class="text-xl font-bold mb-1">
              ${Math.round(weather.main.temp)}°F
            </div>
            <div class="conditions text-sm mb-1">
              <p>${weather.weather[0].main}</p>
              <p>Feels like: ${Math.round(weather.main.feels_like)}°F</p>
            </div>
            <div class="details text-sm">
              <p>Humidity: ${weather.main.humidity}%</p>
              <p>Wind: ${Math.round(weather.wind.speed)} mph</p>
            </div>
          </div>
          <div>
            <img
              src="${iconUrl}"
              alt="${weather.weather[0].description}"
              class="w-12 h-12"
            />
          </div>
        </div>
      `;

      weatherList.appendChild(card);
    });
  }

  // ERROR + SETTINGS
  showError(title: string, message?: string, isApiError: boolean = false) {
    const weatherList = document.getElementById('weatherList');
    if (!weatherList) return;
    weatherList.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = `error-message ${isApiError ? 'api-key-missing' : ''}`;

    const titleEl = document.createElement('strong');
    titleEl.textContent = title;
    errorDiv.appendChild(titleEl);

    if (message) {
      const msgP = document.createElement('p');
      msgP.textContent = message;
      errorDiv.appendChild(msgP);
    }

    const button = document.createElement('button');
    button.textContent = isApiError ? 'Configure API Key' : 'Try Again';
    button.addEventListener('click', () => {
      if (isApiError) {
        this.openSettings();
      } else {
        window.location.reload();
      }
    });
    errorDiv.appendChild(button);

    weatherList.appendChild(errorDiv);
  }

  openSettings(): void {
    const modal = document.createElement('div');
    modal.className =
      'settings-modal fixed inset-0 flex items-center justify-center bg-black/50';

    const settings = JSON.parse(localStorage.getItem('settings') || '{}');

    modal.innerHTML = `
      <div class="settings-content bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-md text-black dark:text-white">
        <h2 class="text-xl font-bold text-center mb-4">Settings</h2>
        <div class="settings-section">
          <div class="setting-item mb-3">
            <label for="apiKey" class="block mb-1">OpenWeather API Key</label>
            <input
              type="text"
              id="apiKey"
              placeholder="Enter API Key"
              class="border px-2 py-1 w-full bg-white dark:bg-gray-700 dark:text-white"
              value="${
                OPENWEATHER_API_KEY !== 'ed6ef54d27fe6cc2f398a9bd585fac51'
                  ? OPENWEATHER_API_KEY
                  : ''
              }"
            />
          </div>
          <div class="setting-item mb-3">
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                class="mr-2"
                ${document.body.classList.contains('dark-mode') ? 'checked' : ''}
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
    `;

    document.body.appendChild(modal);

    const saveBtn = modal.querySelector('.save-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('.cancel-btn') as HTMLButtonElement;

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    saveBtn.addEventListener('click', () => {
      const apiKeyInput = modal.querySelector('#apiKey') as HTMLInputElement;
      const darkModeCheckbox = modal.querySelector('#darkMode') as HTMLInputElement;
      const newApiKey = apiKeyInput.value.trim();
      const darkModeEnabled = darkModeCheckbox.checked;

      if (newApiKey) {
        OPENWEATHER_API_KEY = newApiKey;
        localStorage.setItem('openweatherApiKey', newApiKey);
        this.refreshWeather();
      }
      if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      localStorage.setItem('darkModeEnabled', String(darkModeEnabled));
      closeModal();
    });

    cancelBtn.addEventListener('click', () => closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    (window as any).gameWeather = new GameDayWeather();
  });
} else {
  (window as any).gameWeather = new GameDayWeather();
}
