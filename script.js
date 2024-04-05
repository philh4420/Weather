document.addEventListener("DOMContentLoaded", function () {
  const apiKey = 'c4cd227ed7784f89a5e112230240504';
  const locationInput = document.getElementById('locationInput');
  const searchButton = document.getElementById('searchButton');
  const locationElement = document.getElementById('location');
  const temperatureElement = document.getElementById('temperature');
  const conditionElement = document.getElementById('condition');
  const iconElement = document.getElementById('icon');
  const windSpeedElement = document.getElementById('windSpeed');
  const humidityElement = document.getElementById('humidity');
  const pressureElement = document.getElementById('pressure');
  const visibilityElement = document.getElementById('visibility');
  const cloudCoverElement = document.getElementById('cloudCover');
  const precipitationElement = document.getElementById('precipitation');
  const uvIndexElement = document.getElementById('uvIndex');
  const forecastElement = document.getElementById('forecast');
  const hourlyForecastElement = document.getElementById('hourly-forecast');

  function fetchWeatherData(location) {
    const currentApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;
    const hourlyApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&hours=24`;

    Promise.all([fetch(currentApiUrl), fetch(hourlyApiUrl)])
      .then(responses => Promise.all(responses.map(response => response.json())))
      .then(data => {
        updateCurrentWeather(data[0]);
        updateHourlyForecast(data[1]);
        fetchForecast(location);
      })
      .catch(error => {
        console.error('There was a problem fetching the weather data:', error);
      });
  }

  function fetchForecast(location) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3&aqi=yes&alerts=yes`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        updateForecast(data);
      })
      .catch(error => {
        console.error('There was a problem fetching the forecast data:', error);
      });
  }

  function updateCurrentWeather(data) {
    locationElement.textContent = data.location.name;
    temperatureElement.textContent = data.current.temp_c;
    conditionElement.textContent = data.current.condition.text;
    const iconUrl = `https:${data.current.condition.icon}`;
    iconElement.style.backgroundImage = `url(${iconUrl})`;
    iconElement.alt = data.current.condition.text;
    windSpeedElement.textContent = data.current.wind_kph;
    humidityElement.textContent = data.current.humidity;
    pressureElement.textContent = data.current.pressure_mb;
    visibilityElement.textContent = data.current.vis_km;
    cloudCoverElement.textContent = data.current.cloud;
    precipitationElement.textContent = data.current.precip_mm;
    uvIndexElement.textContent = data.current.uv;
  }

  function updateHourlyForecast(data) {
    const hourlyForecast = data.forecast?.forecastday[0]?.hour; // Check if hourly forecast data is defined
    if (!hourlyForecast) {
      console.error('Hourly forecast data is missing or empty');
      return;
    }

    hourlyForecastElement.innerHTML = '';
    const hourlyForecastTitle = document.createElement('h1');
    hourlyForecastTitle.textContent = 'Hourly Forecast';

    hourlyForecast.forEach(hour => {
      const time = dayjs(hour.time).format('HH:mm'); // Format time using day.js
      const hourItem = document.createElement('div');
      hourItem.classList.add('hourly-forecast-item');
      hourItem.innerHTML = `
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Temperature:</strong> ${hour.temp_c} °C</p>
      <p><strong>Condition:</strong> ${hour.condition.text}</p>
      <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
    `;
      hourlyForecastElement.appendChild(hourItem);
    });
  }


  function updateForecast(data) {
    const forecastData = data.forecast?.forecastday;
    if (!forecastData) {
      console.error('Forecast data is missing or empty');
      return;
    }

    forecastElement.innerHTML = '';
    const forecastTitle = document.createElement('h1');
    forecastTitle.textContent = '3-Day Forecast';

    function formatUKDate(dateString) {
      const date = new Date(dateString);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return `${date.toLocaleDateString('en-GB', options)}`;
    }

    forecastData.forEach(day => {
      const ukDate = formatUKDate(day.date);

      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
      <p><strong>Date:</strong> ${ukDate}</p>
      <p><strong>Max Temperature:</strong> ${day.day.maxtemp_c} °C</p>
      <p><strong>Min Temperature:</strong> ${day.day.mintemp_c} °C</p>
      <p><strong>Condition:</strong> ${day.day.condition.text}</p>
      <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
    `;
      forecastElement.appendChild(forecastItem);
    });
  }


  searchButton.addEventListener('click', function () {
    const location = locationInput.value.trim();
    if (location) {
      fetchWeatherData(location);
    } else {
      alert('Please enter a location');
    }
  });
});
