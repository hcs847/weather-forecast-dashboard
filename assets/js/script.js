var selectedCityEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var cityTodayEl = document.querySelector("#todays-weather");
var todaysWeatherEl = document.querySelector("#todays-weather");
var previousCitiesEl = document.querySelector("#previous-cities");
var cities = JSON.parse(localStorage.getItem("cities")) || [];
var myKey = config.WeatherKey;

// fecthing from the current weather api based on city
var getTodaysWeather = function (city) {
    var currentApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + myKey;
    fetch(currentApiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayTodaysWeather(data);
            })
        } else {
            alert("Please enter a valid city");
        }
    })
}

// fetching from the full weather api based on lon & lat obtained from previous end-point
var getForecast = function (lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" +
        lon + "&units=imperial&appid=" + myKey;
    fetch(apiUrl).then(function (response) {
        response.json()
            .then(function (forecastData) {
                getFiveDaysForecast(forecastData);
            });
    })
};

// rendering weather conditions
var displayTodaysWeather = function (data) {
    var cityNameEl = document.createElement("div");
    var cityConditionsEl = document.createElement("div");
    var city = data.name;
    var temp = data.main.temp;
    var humidity = data.main.humidity;
    var windSpeed = data.wind.speed;
    var icon = data.weather[0].icon;
    var lat = data.coord.lat;
    var lon = data.coord.lon;


    // Clearing out old content
    cityTodayEl.textContent = "";

    //rendering on page
    cityNameEl.classList = "card-header";
    cityNameEl.innerHTML = "<h2>" + city + " " + moment().format("MM/DD/YYYY") +
        "</h2> <img src='https://openweathermap.org/img/wn/" + icon + "@2x.png'></img>";
    cityTodayEl.appendChild(cityNameEl);
    cityConditionsEl.classList = "card-body";
    cityConditionsEl.innerHTML = "<p>Temperature: " + temp + " °F</p><p>Humidity: " +
        humidity + " %</p><p > Wind Speed: " + windSpeed + " MPH </p>";
    cityTodayEl.appendChild(cityConditionsEl);

    // calling the full forecast based on lat & lon arguments   
    getForecast(lat, lon);
    // saving in local storage
    storeCities(city);
}

var displayForecast = function (fiveDaysForecast, forecastData) {
    // extract uv info
    var uv = forecastData.current.uvi;

    // looping through forecast data to obtain info for the 5 days
    for (var i = 1; i < 6; i++) {
        var dayEl = document.querySelector("#day" + i);
        dayEl.innerHTML = "<h3 class = 'card-header'>" +
            fiveDaysForecast[i - 1].date +
            "</h3><img src='https://openweathermap.org/img/wn/" +
            fiveDaysForecast[i - 1].icon + "@2x.png'></img><p class='temp'>Temp: " +
            fiveDaysForecast[i - 1].temp + " °F</p><p class='humidity'>Humidity: " +
            fiveDaysForecast[i - 1].humid + "%</p>";
    }
    displayUvInfo(uv);
}

// obtaining uv details to render in current conditions
var displayUvInfo = function (uv) {
    var cityTodayUvEl = document.createElement("div");
    cityTodayUvEl.classList = "card-body uv"
    cityTodayUvEl.innerHTML = "<p> UV Index : " + "<span id=uv>" + uv + "</span></p>";
    cityTodayEl.appendChild(cityTodayUvEl);

    // apply background color to UV based on risk level
    var spanUvEl = document.querySelector("#uv")
    if (uv < 3) {
        spanUvEl.classList.add("green");
    }
    if (uv >= 3 && uv < 6) {
        spanUvEl.classList.add("yellow");
    }
    if (uv >= 6 && uv < 8) {
        spanUvEl.classList.add("orange");
    }
    if (uv >= 8 && uv < 11) {
        spanUvEl.classList.add("red");
    }
    if (uv > 11) {
        spanUvEl.classList.add("purple");
    }
}

// extracting the 5 days forecast
var getFiveDaysForecast = function (forecastData) {
    var fiveDaysForecast = [];
    for (var i = 1; i < 6; i++) {

        fiveDaysForecast[i - 1] = {
            temp: forecastData.daily[i].temp.day,
            humid: forecastData.daily[i].humidity,
            date: moment.unix(forecastData.daily[i].dt).format("MM/DD/YYYY"),
            icon: forecastData.daily[i].weather[0].icon
        }
    };
    // calling the function to render the 5 days forecast
    displayForecast(fiveDaysForecast, forecastData);
}

// extracting the name of the searched city when clicking submit
var formSubmitHandler = function () {
    event.preventDefault();
    var cityInput = cityInputEl.value.trim();

    if (cityInput) {
        getTodaysWeather(cityInput);

        // clear the value submitted through the form
        cityInputEl.value = "";

    } else {
        alert("Please enter a city");
    }
}

// saving list of cities in local storage up to 10 items
var storeCities = function (city) {
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
        previousCitiesEl.textContent = "";
        displayPreviousCities(cities);
    }
    if (cities.length > 9) {
        cities.shift();
    }
};

// rendering previously searched cities
var displayPreviousCities = function (cities) {
    for (var i = cities.length - 1; i >= 0; i--) {
        var previousCity = document.createElement("p");
        previousCity.textContent = cities[i];
        previousCitiesEl.appendChild(previousCity);
    }
};

// rendering related forecast info when clicking on previously searched cities
var previousCitiesHandler = function (event) {
    // extract clicked element's text
    var citySelected = event.target.textContent;
    // render on page based on clicked city
    getTodaysWeather(citySelected);
}

displayPreviousCities(cities);
selectedCityEl.addEventListener("submit", formSubmitHandler);
previousCitiesEl.addEventListener("click", previousCitiesHandler);