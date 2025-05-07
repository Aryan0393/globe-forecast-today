
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherCondition } from "@/types/types";
import { getWeatherIconUrl, formatTemperature } from "@/services/weatherService";

interface WeatherCardProps {
  title: string;
  date?: string;
  temp: number;
  minTemp?: number;
  maxTemp?: number;
  weather: WeatherCondition;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  title,
  date,
  temp,
  minTemp,
  maxTemp,
  weather,
  humidity,
  windSpeed,
  precipitation,
  className = "",
}) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {date && <p className="text-sm text-muted-foreground">{date}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              className="w-16 h-16 animate-float"
            />
            <div className="ml-2">
              <p className="font-bold text-3xl">{formatTemperature(temp)}</p>
              <p className="text-sm capitalize">{weather.description}</p>
            </div>
          </div>
          <div className="text-right">
            {(minTemp !== undefined && maxTemp !== undefined) && (
              <p className="text-sm">
                <span className="font-semibold">{formatTemperature(maxTemp)}</span> / 
                <span className="text-muted-foreground">{formatTemperature(minTemp)}</span>
              </p>
            )}
            {humidity !== undefined && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Humidity:</span> {humidity}%
              </p>
            )}
            {windSpeed !== undefined && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Wind:</span> {Math.round(windSpeed)} m/s
              </p>
            )}
            {precipitation !== undefined && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Precip:</span> {Math.round(precipitation * 100)}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
