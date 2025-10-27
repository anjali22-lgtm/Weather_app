const apiKey = "4402ba2e7a7545a995444956252710";

// Elements
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const useLocationBtn = document.getElementById("useLocationBtn");
const weatherDiv = document.getElementById("weather");
const statusMessage = document.getElementById("statusMessage");
const forecastContainer = document.getElementById("forecast");

weatherDiv.style.display = "none";

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    clearStatus();
    getWeatherByQuery(city);
  }
});

useLocationBtn.addEventListener("click", () => {
  clearStatus();
  detectLocationAndFetch();
});

window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeatherByQuery(lastCity);
  } else {
    detectLocationAndFetch(true);
  }
});

// ----------------------------
// Helper functions
// ----------------------------
function setStatus(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? "#ff7675" : "#2ecc71";
}
function clearStatus() {
  statusMessage.textContent = "";
}

async function getWeatherByQuery(query) {
  showLoading(true);
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      query
    )}&days=4&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      setStatus(data.error.message, true);
      showLoading(false);
      return;
    }

    localStorage.setItem("lastCity", data.location.name);
    displayWeather(data);
    clearStatus();
  } catch {
    setStatus("Network error. Check your connection.", true);
  } finally {
    showLoading(false);
  }
}

async function getWeatherByCoords(lat, lon) {
  showLoading(true);
  try {
    const query = `${lat},${lon}`;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
      query
    )}&days=4&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      setStatus(data.error.message, true);
      showLoading(false);
      return;
    }

    localStorage.setItem("lastCity", data.location.name);
    displayWeather(data);
    clearStatus();
  } catch {
    setStatus("Network error. Check your connection.", true);
  } finally {
    showLoading(false);
  }
}

function detectLocationAndFetch(silent = false) {
  if (!navigator.geolocation) {
    if (!silent) setStatus("Geolocation not supported.", true);
    return;
  }

  if (!silent) setStatus("Detecting your location…");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      if (!silent) setStatus("Location detected. Fetching weather…");
      getWeatherByCoords(latitude, longitude);
    },
    () => {
      if (!silent) setStatus("Could not get location. Try manual search.", true);
    }
  );
}

function displayWeather(data) {
  weatherDiv.style.display = "block";
  document.getElementById("city-name").textContent =
    `${data.location.name}, ${data.location.country}`;
  document.getElementById("local-time").textContent = `🕒 ${data.location.localtime}`;
  document.getElementById("temperature").textContent = `${data.current.temp_c}°C`;
  document.getElementById("condition").textContent = data.current.condition.text;
  document.getElementById("humidity").textContent = `Humidity: ${data.current.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h`;
  document.getElementById("weather-icon").src =
    "https:" + data.current.condition.icon;

  applyBackgroundByCondition(data.current.condition.text, data.current.is_day);

  // Show next 3 days
  displayForecast(data.forecast.forecastday.slice(1));
}

function showLoading(isLoading) {
  if (isLoading) setStatus("Loading weather…");
  else clearStatus();
}

function displayForecast(forecastDays) {
  forecastContainer.innerHTML = "";
  forecastDays.forEach((day) => {
    const div = document.createElement("div");
    div.classList.add("forecast-day");

    const date = new Date(day.date);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const dayName = date.toLocaleDateString("en-US", options);

    div.innerHTML = `
      <p>${dayName}</p>
      <img src="https:${day.day.condition.icon}" alt="icon" />
      <p>${day.day.avgtemp_c}°C</p>
      <p class="cond">${day.day.condition.text}</p>
    `;
    forecastContainer.appendChild(div);
  });
}

// ----------------------------
// Background Animations
// ----------------------------
function applyBackgroundByCondition(conditionText, isDayFlag) {
  const text = conditionText.toLowerCase();

  const sun = document.querySelector(".sun");
  const moon = document.querySelector(".moon");
  const clouds = document.querySelectorAll(".cloud");
  const rain = document.querySelector(".rain");

  sun.style.display = "none";
  moon.style.display = "none";
  rain.style.display = "none";
  clouds.forEach((c) => (c.style.display = "none"));
  document.querySelectorAll(".star").forEach((s) => s.remove());

  document.body.className = "";

  if (text.includes("clear")) {
    if (isDayFlag) {
      document.body.classList.add("bg-sunny");
      sun.style.display = "block";
    } else {
      document.body.classList.add("bg-clear-night");
      moon.style.display = "block";
      createStars();
    }
  } else if (text.includes("cloud")) {
    document.body.classList.add("bg-cloudy");
    clouds.forEach((c) => (c.style.display = "block"));
  } else if (text.includes("rain")) {
    document.body.classList.add("bg-rainy");
    rain.style.display = "block";
    clouds.forEach((c) => (c.style.display = "block"));
  } else if (text.includes("snow")) {
    document.body.classList.add("bg-snowy");
  } else if (text.includes("storm")) {
    document.body.classList.add("bg-storm");
  }
}

function createStars() {
  const starsContainer = document.getElementById("stars");
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    star.style.animationDuration = 2 + Math.random() * 3 + "s";
    starsContainer.appendChild(star);
  }
}

