
import { 
  WeatherData, 
  CurrentWeather, 
  ForecastDay, 
  WeatherAPIResponse,
  ForecastAPIResponse
} from "@/types/types";

// Use a working API key for OpenWeatherMap
const OPEN_WEATHER_API_KEY = "1b5ee5a1a74d624a74750350327ea372"; // Free API key for demo purposes
const API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Cache weather data to avoid unnecessary API calls
const weatherCache: Map<string, { data: WeatherData; timestamp: number }> = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes cache expiry

// Transform current weather response
const transformCurrentWeather = (data: WeatherAPIResponse): CurrentWeather => {
  return {
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg,
    weather: data.weather,
    dt: data.dt
  };
};

// Group forecast data by day
const groupForecastByDay = (data: ForecastAPIResponse): ForecastDay[] => {
  const dailyData: Record<string, any> = {};
  
  // Group data by day (using date part of dt_txt)
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyData[date]) {
      dailyData[date] = {
        dt: item.dt,
        temps: [],
        humidity: [],
        pressure: [],
        weather: item.weather,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        pop: item.pop,
        clouds: item.clouds.all
      };
    } else {
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].pressure.push(item.main.pressure);
      
      // Take the weather condition from daytime if possible
      const hour = new Date(item.dt * 1000).getHours();
      if (hour >= 10 && hour <= 14) {
        dailyData[date].weather = item.weather;
      }
    }
  });
  
  // Transform to ForecastDay[]
  return Object.values(dailyData).map((day: any) => {
    return {
      dt: day.dt,
      sunrise: 0, // Not available in 5-day forecast
      sunset: 0, // Not available in 5-day forecast
      temp: {
        day: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
        min: Math.min(...day.temps),
        max: Math.max(...day.temps),
        night: day.temps[day.temps.length - 1] || day.temps[0],
        eve: day.temps[day.temps.length - 2] || day.temps[0],
        morn: day.temps[0]
      },
      feels_like: {
        day: 0, // Not available in 5-day forecast
        night: 0, // Not available in 5-day forecast
        eve: 0, // Not available in 5-day forecast
        morn: 0 // Not available in 5-day forecast
      },
      pressure: day.pressure.reduce((a: number, b: number) => a + b, 0) / day.pressure.length,
      humidity: day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length,
      weather: day.weather,
      wind_speed: day.wind_speed,
      wind_deg: day.wind_deg,
      clouds: day.clouds,
      pop: day.pop
    };
  }).slice(0, 5); // Limit to 5 days
};

// Get weather data for a location
export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const cacheKey = `${lat},${lon}`;
    const cachedData = weatherCache.get(cacheKey);
    
    // Return cached data if it's not expired
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.data;
    }

    console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}`);

    // Fetch current weather
    const currentResponse = await fetch(
      `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Failed to fetch current weather: ${currentResponse.statusText}`);
    }
    
    const currentData: WeatherAPIResponse = await currentResponse.json();
    console.log("Current weather data fetched successfully");
    
    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Failed to fetch forecast: ${forecastResponse.statusText}`);
    }
    
    const forecastData: ForecastAPIResponse = await forecastResponse.json();
    console.log("Forecast data fetched successfully");
    
    // Transform data
    const weatherData: WeatherData = {
      current: transformCurrentWeather(currentData),
      forecast: groupForecastByDay(forecastData)
    };
    
    // Cache the results
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

// Get weather icon URL
export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

// Get background class based on weather condition
export const getWeatherBackgroundClass = (condition: string): string => {
  const weatherCondition = condition.toLowerCase();
  
  if (weatherCondition.includes('clear')) return 'bg-sunny';
  if (weatherCondition.includes('cloud')) return 'bg-cloudy';
  if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) return 'bg-rainy';
  if (weatherCondition.includes('thunder') || weatherCondition.includes('storm')) return 'bg-stormy';
  if (weatherCondition.includes('snow')) return 'bg-snowy';
  
  return 'bg-cloudy'; // Default background
};

// Format temperature
export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`;
};

// Format date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format time
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};
