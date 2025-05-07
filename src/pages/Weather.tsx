
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { City } from "@/types/types";
import { fetchCities } from "@/services/cityService";
import WeatherDetail from "@/components/WeatherDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Weather: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCity = async () => {
      if (!cityId) {
        setError("City ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the city details first
        const query = `geoname_id:${cityId}`;
        const { cities } = await fetchCities(0, 1, query);
        
        if (cities.length === 0) {
          throw new Error("City not found");
        }
        
        setCity(cities[0]);
      } catch (err) {
        console.error("Error loading city:", err);
        setError("Failed to load city data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load city data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCity();
  }, [cityId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2" size={16} />
              Back to cities
            </Button>
          </Link>
          
          <div className="p-8 text-center bg-secondary/20 rounded-lg">
            <div className="text-3xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2">City not found</h2>
            <p className="text-muted-foreground mb-4">{error || "Failed to load city data"}</p>
            <Link to="/">
              <Button>Return to cities list</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to cities
          </Button>
        </Link>
        
        <WeatherDetail
          cityId={city.id}
          cityName={city.name}
          latitude={city.latitude}
          longitude={city.longitude}
        />
      </div>
    </div>
  );
};

export default Weather;
