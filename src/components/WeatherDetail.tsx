
import React, { useState, useEffect } from "react";
import { WeatherData } from "@/types/types";
import { 
  getWeatherData, 
  formatTemperature, 
  formatDate, 
  getWeatherBackgroundClass 
} from "@/services/weatherService";
import { useToast } from "@/hooks/use-toast";
import WeatherCard from "./WeatherCard";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Thermometer, 
  Calendar, 
  Loader2 
} from "lucide-react";

interface WeatherDetailProps {
  cityId: number;
  cityName: string;
  latitude: number;
  longitude: number;
  onWeatherLoaded?: (data: WeatherData) => void;
}

const WeatherDetail: React.FC<WeatherDetailProps> = ({
  cityId,
  cityName,
  latitude,
  longitude,
  onWeatherLoaded
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getWeatherData(latitude, longitude);
        
        if (!data) {
          throw new Error("Failed to fetch weather data");
        }
        
        setWeather(data);
        if (onWeatherLoaded) {
          onWeatherLoaded(data);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to fetch weather data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to fetch weather data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [cityId, latitude, longitude]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-8 text-center">
        <div className="text-3xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error || "Failed to fetch weather data"}</p>
        <p className="text-sm">
          Please try again later or check another city.
        </p>
      </div>
    );
  }

  const { current, forecast } = weather;
  const weatherCondition = current.weather[0].main;
  const backgroundClass = getWeatherBackgroundClass(weatherCondition);

  return (
    <div className="space-y-6">
      {/* Current weather */}
      <Card className={`overflow-hidden ${backgroundClass}`}>
        <CardContent className="p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1">{cityName}</h1>
              <p className="text-lg opacity-90">{formatDate(current.dt)}</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <img 
                src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`} 
                alt={current.weather[0].description}
                className="w-24 h-24"
              />
              <div className="ml-2">
                <p className="text-5xl font-bold">{formatTemperature(current.temp)}</p>
                <p className="text-xl capitalize">{current.weather[0].description}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6 bg-white/20" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <Thermometer className="mb-2" size={24} />
              <p className="text-sm opacity-80">Feels Like</p>
              <p className="font-semibold">{formatTemperature(current.feels_like)}</p>
            </div>
            <div className="flex flex-col items-center">
              <Droplets className="mb-2" size={24} />
              <p className="text-sm opacity-80">Humidity</p>
              <p className="font-semibold">{current.humidity}%</p>
            </div>
            <div className="flex flex-col items-center">
              <Wind className="mb-2" size={24} />
              <p className="text-sm opacity-80">Wind Speed</p>
              <p className="font-semibold">{current.wind_speed} m/s</p>
            </div>
            <div className="flex flex-col items-center">
              <Gauge className="mb-2" size={24} />
              <p className="text-sm opacity-80">Pressure</p>
              <p className="font-semibold">{current.pressure} hPa</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Five-day forecast */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Calendar className="mr-2" size={20} />
          <h2 className="text-xl font-semibold">5-Day Forecast</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <WeatherCard
              key={index}
              title={index === 0 ? "Today" : formatDate(day.dt).split(", ")[0]}
              date={formatDate(day.dt)}
              temp={day.temp.day}
              minTemp={day.temp.min}
              maxTemp={day.temp.max}
              weather={day.weather[0]}
              humidity={day.humidity}
              windSpeed={day.wind_speed}
              precipitation={day.pop}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDetail;
