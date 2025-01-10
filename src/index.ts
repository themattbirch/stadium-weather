import './styles.css';


let OPENWEATHER_API_KEY = 'ed6ef54d27fe6cc2f398a9bd585fac51'; 

console.log('Script loading...');

function checkApiKey() {
  console.log('Checking API key:', OPENWEATHER_API_KEY);
  if (
    !OPENWEATHER_API_KEY ||
    OPENWEATHER_API_KEY === 'ed6ef54d27fe6cc2f398a9bd585fac51'
  ) {
    console.warn('API key not configured');
    throw new Error('OpenWeather API key not configured');
  }
}

class GameDayWeather {
  private selectedStadium: string;
  private stadiums: any[];

  constructor() {
    this.selectedStadium = 'all';
    this.stadiums = [];
    console.log('GameDayWeather constructor called');
    this.init();
  }

  showError(title: string, message?: string, isApiError: boolean = false): void {
  console.log('Showing error:', { title, message, isApiError });
  const weatherList = document.getElementById('weatherList');
  if (!weatherList) {
    console.error('Weather list element not found in showError');
    return;
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = `error-message ${isApiError ? 'api-key-missing' : ''}`;

  const titleElement = document.createElement('strong');
  titleElement.textContent = title;
  errorDiv.appendChild(titleElement);

  if (message) {
    const messageP = document.createElement('p');
    messageP.textContent = message;
    errorDiv.appendChild(messageP);
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

  weatherList.innerHTML = '';
  weatherList.appendChild(errorDiv);
}

  async init(): Promise<void> {
    try {
      console.log('Initializing GameDayWeather...');

      // Load API key from localStorage if saved
      const savedApiKey = localStorage.getItem('openweatherApiKey');
      if (savedApiKey) {
        OPENWEATHER_API_KEY = savedApiKey;
        console.log('Loaded saved API key from localStorage');
      }

      // Apply dark mode preference
      const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
      if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
      }

      this.setupEventListeners();
      await this.loadStadiumData();
      console.log('Initialization complete');
    } catch (error: any) {
      console.error('Initialization error:', error);
      this.showError('Initialization Error', error.message);
    }
  }

  setupEventListeners(): void {
    console.log('Setting up event listeners');

    const refreshButton = document.querySelector('#refresh') as HTMLButtonElement;
    const dateInput = document.querySelector('#weather-date') as HTMLInputElement;
    const settingsButton = document.querySelector('#settings') as HTMLButtonElement;
    const stadiumSelect = document.querySelector('#stadiumSelect') as HTMLSelectElement;

    if (refreshButton) {
      refreshButton.onclick = () => {
        console.log('Refresh clicked');
        this.refreshWeather();
      };
    }

    if (dateInput) {
      dateInput.onchange = () => {
        console.log('Date changed');
        this.refreshWeather();
      };
    }

    if (settingsButton) {
      settingsButton.onclick = () => {
        console.log('Settings clicked');
        this.openSettings();
      };
    }

    if (stadiumSelect) {
      stadiumSelect.onchange = () => {
        console.log('Stadium selection changed');
        this.selectedStadium = stadiumSelect.value;
        this.refreshWeather();
      };
    }
  }

  async loadStadiumData(): Promise<void> {
  try {
    const response = await fetch('/data/stadium_coordinates.json');
    if (!response.ok) throw new Error('Failed to load stadium data');

    const data = await response.json();

    // Build separate arrays for NFL and NCAA,
    // merging each { key: stadiumName, value: stadiumInfo } into a single object.
    const nflStadiums = Object.entries(data.nfl).map(([stadiumName, info]: [string, any]) => ({
      name: stadiumName,  // new field
      ...info             // location, team, latitude, longitude...
    }));

    const ncaaStadiums = Object.entries(data.ncaa).map(([stadiumName, info]: [string, any]) => ({
      name: stadiumName,
      ...info
    }));

    // Combine arrays
    this.stadiums = [...nflStadiums, ...ncaaStadiums];

    this.populateStadiumSelector();
    console.log('Loaded stadiums:', this.stadiums);
  } catch (error) {
    console.error('Error loading stadium data:', error);
    this.showError('Could not load stadium data', 'Please check your connection and try again');
  }
}


  populateStadiumSelector(): void {
    const selector = document.querySelector('#stadiumSelect') as HTMLSelectElement;
    if (!selector) return;

    selector.innerHTML = `
        <option value="all">All Stadiums</option>
  ${this.stadiums
    .map(
      (stadium: any) =>
        `<option value="${stadium.team}">
           ${stadium.name} - ${stadium.team}
         </option>`
    )
    .join('')}
    `;
  }

  async refreshWeather(): Promise<void> {
    console.log('Refreshing weather data');
    const weatherList = document.getElementById('weatherList');
    if (!weatherList) {
      console.error('Weather list element not found');
      return;
    }
    weatherList.innerHTML = '<div class="loading">Loading weather data...</div>';

    const dateInput = document.getElementById('weather-date') as HTMLInputElement;
    const selectedDate =
      dateInput?.value || new Date().toISOString().split('T')[0];
    console.log('Selected date:', selectedDate);

    try {
      if (!this.stadiums || this.stadiums.length === 0) {
        throw new Error('No stadium data available');
      }

      let stadiumsToFetch = this.stadiums;
      if (this.selectedStadium !== 'all') {
        stadiumsToFetch = this.stadiums.filter(
          (s: any) => s.team === this.selectedStadium
        );
      }

      console.log('Fetching weather for stadiums:', stadiumsToFetch);
      const weatherPromises = stadiumsToFetch.map((stadium: any) =>
        this.fetchWeatherForStadium(stadium, selectedDate)
      );

      const weatherData = await Promise.all(weatherPromises);
      console.log('Weather data received:', weatherData);
      this.displayWeather(weatherData);
    } catch (error: any) {
      console.error('Error in refreshWeather:', error);
      this.showError('Could not fetch weather data');
    }
  }

  async fetchWeatherForStadium(stadium: any, date: string): Promise<any> {
    checkApiKey();

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${stadium.latitude}&lon=${stadium.longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }
      const weather = await response.json();
      return { stadium, weather };
    } catch (error) {
      console.error(`Error fetching weather for ${stadium.name}:`, error);
      throw error;
    }
  }

  displayWeather(weatherDataArray: any[]): void {
  const weatherList = document.getElementById('weatherList');
  if (!weatherList) return;
  weatherList.innerHTML = '';

  weatherDataArray.forEach((data) => {
    const { weather, stadium } = data;
    
    const cardElement = document.createElement('div');
    // Combine your custom class with Tailwind classes:
    cardElement.className =
      'weather-card bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 w-full';

    cardElement.innerHTML = `
      <div class="stadium-info">
    <h3>${stadium.name}</h3>
    <p>${stadium.team}</p>
  </div>
      <div class="weather-info flex-1">
        <div class="temperature text-xl font-bold mb-1">
          ${Math.round(weather.main.temp)}°F
        </div>
        <div class="conditions text-sm mb-1">
          <p>${weather.weather[0].main}</p>
          <p>Feels like: ${Math.round(weather.main.feels_like)}°F</p>
        </div>
        <div class="details text-sm text-stadium-gray">
          <p>Humidity: ${weather.main.humidity}%</p>
          <p>Wind: ${Math.round(weather.wind.speed)} mph</p>
        </div>
      </div>
    `;

    weatherList.appendChild(cardElement);
  });
}


  openSettings(): void {
    const modal = document.createElement('div');
modal.className = `
  settings-modal 
  fixed inset-0 flex items-center justify-center
  bg-black/50
`;

    // Load settings from localStorage
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');

    modal.innerHTML = `
  <div class="settings-content bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-md">
    <h2 class="text-xl font-bold text-center mb-4">Settings</h2>
        <div class="settings-section">
          <div class="setting-item">
            <label for="apiKey">OpenWeather API Key</label>
            <input type="text" id="apiKey" placeholder="Enter API Key" 
              value="${
                OPENWEATHER_API_KEY !== 'ed6ef54d27fe6cc2f398a9bd585fac51'
                  ? OPENWEATHER_API_KEY
                  : ''
              }" 
            />
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                id="darkMode" 
                ${document.body.classList.contains('dark-mode') ? 'checked' : ''}
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
    `;

    document.body.appendChild(modal);

    const saveBtn = modal.querySelector('.save-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('.cancel-btn') as HTMLButtonElement;

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    saveBtn.addEventListener('click', () => {
      console.log('Saving settings');
      const apiKeyInput = modal.querySelector('#apiKey') as HTMLInputElement;
      const darkModeCheckbox = modal.querySelector('#darkMode') as HTMLInputElement;

      const newApiKey = apiKeyInput.value.trim();
      const darkModeEnabled = darkModeCheckbox.checked;

      if (newApiKey) {
        OPENWEATHER_API_KEY = newApiKey;
        localStorage.setItem('openweatherApiKey', newApiKey);
        console.log('API Key saved to localStorage');
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

    cancelBtn.addEventListener('click', () => {
      console.log('Cancel settings');
      closeModal();
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  async testWeatherAPI(): Promise<boolean> {
    try {
      if (!this.stadiums || this.stadiums.length === 0) {
        await this.loadStadiumData();
      }
      const testStadium = this.stadiums[0];
      const result = await this.fetchWeatherForStadium(
        testStadium,
        new Date().toISOString().split('T')[0]
      );
      console.log('API Test Result:', result);
      return true;
    } catch (error: any) {
      if (error.message && error.message.includes('API key not configured')) {
        this.showError(
          'API Key Required',
          'Please configure your OpenWeather API key in settings',
          true
        );
      } else {
        this.showError(
          'Weather API Error',
          'Could not connect to weather service. Please try again later.'
        );
      }
      return false;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Creating GameDayWeather instance');
    (window as any).gameWeather = new GameDayWeather();
  });
} else {
  console.log('DOM already loaded - Creating GameDayWeather instance');
  (window as any).gameWeather = new GameDayWeather();
}
