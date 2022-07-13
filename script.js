let weather = {
    bingapiKey: "AuTDHVg29P59wl9kiDVu1hRtH9Q4VoMMAOyzGD_mzAqqVz1PreD-5H6peejh-2VN",
    nwskey: "taylorsmith2202@outlook.com",
    //Function that takes an input(city, address, state, zip code)
    //and produces the coordinates of the location
    fetchCoordinates: function (location) {
        fetch(
            "http://dev.virtualearth.net/REST/v1/Locations/"
            + location
            + "?output=json&key="
            + this.bingapiKey
        )
        .then((response) => response.json())
        .then((data) => this.fetchGrid(data))
    },
    //Uses the coordinates produced to find the associated weather grid
    fetchGrid: function(data) {
        const { locality, adminDistrict } = data.resourceSets[0].resources[0].address
        if (locality != undefined) {
            var address = locality + ", " + adminDistrict
        }
        else {
            var address = adminDistrict
        }
        const { coordinates } = data.resourceSets[0].resources[0].geocodePoints[0]
        fetch(
            "https://api.weather.gov/points/"
            + coordinates
            , {headers: {
                'User-agent': this.nwskey
            }}
        )
        .then((response) => response.json())
        .then((data) => this.fetchWeather(data, address))
    },
    //Uses the grid to find the weather data
    fetchWeather: function(gridData, address) {
        const { gridId, gridX, gridY } = gridData.properties
        fetch(
            "https://api.weather.gov/gridpoints/"
            + gridId
            + "/"
            + gridX
            + ","
            + gridY
            + "/forecast/hourly"
            , {headers: {
                'User-agent': this.nwskey
            }}
        )
        .then((response) => response.json())
        .then((data) => this.displayWeather(data, address))
    },
    //Displays the weather from the weather data
    displayWeather: function(data, address) {    
        const { temperature, windSpeed, windDirection, shortForecast, icon } = data.properties.periods[0]
        document.querySelector(".city").innerText = address
        document.querySelector(".temp").innerText = temperature + "°F"
        document.querySelector(".icon").src = icon
        document.querySelector(".windspeed").innerText = "Wind Speed: " + windSpeed
        document.querySelector(".winddirection").innerText = "Wind Direction: " + windDirection
        document.querySelector(".forecast").innerText = shortForecast
    }
};

//Function that uses the search bar to find the weather of the entered location
function search() {
    var locationValue = document.getElementById("location").value
    weather.fetchCoordinates(locationValue)
    document.getElementById("location").value = ""
}

//Provide event listener to execute search when the enter key is pressed
document
    .getElementById("location")
    .addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            search()
        }
    })

//Function that executrs on the success of the geoloaction function
//It finds the coordinates of the users current location to display
//their current weather
function success(pos) {
    const crd = pos.coords;
    var coords = crd.latitude + "," + crd.longitude
    weather.fetchCoordinates(coords)
}
navigator.geolocation.getCurrentPosition(success)