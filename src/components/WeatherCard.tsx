
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherCondition } from "@/types/types";
import { getWeatherIconUrl, formatTemperature } from "@/services/weatherService";
import { Thermometer, Droplets, Wind } from "lucide-react";

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
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {date && <p className="text-sm text-muted-foreground">{date}</p>}
      </CardHeader>
      <CardContent className="p-4">
        {/* Weather icon and main temp */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            className="w-16 h-16 animate-float"
          />
          <p className="font-bold text-3xl mt-2">{formatTemperature(temp)}</p>
          <p className="text-sm capitalize text-center">{weather.description}</p>
        </div>
        
        {/* Temperature high/low */}
        {(minTemp !== undefined && maxTemp !== undefined) && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Thermometer size={16} className="text-destructive" />
            <span className="font-semibold">{formatTemperature(maxTemp)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{formatTemperature(minTemp)}</span>
          </div>
        )}
        
        {/* Additional weather info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {humidity !== undefined && (
            <div className="flex items-center gap-1.5">
              <Droplets size={14} className="text-blue-500" />
              <span>{humidity}%</span>
            </div>
          )}
          
          {windSpeed !== undefined && (
            <div className="flex items-center gap-1.5 justify-end">
              <Wind size={14} className="text-slate-500" />
              <span>{Math.round(windSpeed)} m/s</span>
            </div>
          )}
          
          {precipitation !== undefined && (
            <div className="flex items-center gap-1.5 col-span-2 justify-center mt-1">
              <span className="text-muted-foreground">Precipitation:</span>
              <span>{Math.round(precipitation * 100)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
