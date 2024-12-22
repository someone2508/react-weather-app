import {useState, useEffect} from 'react';


function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState("");
 
  const fetchWeather = async () => {
    try {
      setIsLoading(true);

      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`);

      const geoData = await geoRes.json();

      if(!geoData.results) throw new Error("Location not found!");

      const { latitude, longitude, timezone, name } = geoData.results.at(0);

      setDisplayLocation(name);

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`)

      const weatherData = await weatherRes.json();

      setWeather(weatherData.daily);
    } catch(error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if(location.length < 2)
      return;
    
    fetchWeather();
  }, [location]);

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} setLocation={setLocation} />

      {/* loader */}
      {isLoading && <p className='loader'>Loading...</p>}

      {/* weather */}
      {weather.weathercode && (
        <Weather weather={weather} location={displayLocation} />
      )}
    </div>
  );
}

function Weather({weather, location}) {
  const {
    time: dates,
    weathercode: codes,
    temperature_2m_max: max,
    temperature_2m_min: min
  } = weather;

  return (
    <div>
      <h2>Weather {location}</h2>
      <ul className='weather'>
        {dates.map((date, i) => {
          return <Day 
            date={date}
            max={max.at(i)}
            min={min.at(i)}
            code={codes.at(i)}
            isToday={i === 0}
            key={date}
          />
        })}
      </ul>
    </div>
  );
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
      weekday: "short"
  }).format(new Date(dateStr));
}

function Day({ date, max, min, code, isToday }) {
  return (
    <li className='day'>
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        <strong>{Math.floor(min)}&deg; - {Math.ceil(max)}&deg;</strong>
      </p>
    </li>
  );
}

function Input({location, setLocation}) {
  return <div>
    <input type="text" placeholder="Search From Location..." value={location} onChange={(e) => setLocation(e.target.value)} />
  </div>
}

export default App;


