
import React, { useState, useRef } from "react";
import { City, WeatherData } from "@/types/types";
import CitiesTable from "@/components/CitiesTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchCities } from "@/services/cityService";

const Index: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const countryFilter = "India"; // Set default country filter to India

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 2 characters to search",
      });
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchCities(searchQuery, countryFilter); // Pass country filter
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No cities found",
          description: "Try different search terms",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search cities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle weather data loading
  const handleWeatherLoaded = (cityId: number, weatherData: WeatherData) => {
    // Update the city in the cities table with weather data
    console.log(`Weather loaded for city ${cityId}`, weatherData);
  };

  // Handle click outside search results
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(e.target as Node) &&
        searchInputRef.current !== e.target
      ) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Cloud className="mr-2" size={28} />
              <h1 className="text-2xl md:text-3xl font-bold">Indian Cities Weather App</h1>
            </div>
            <form onSubmit={handleSearch} className="w-full md:w-96 relative">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a city in India..."
                className="pl-10 pr-4 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
              {searchResults.length > 0 && (
                <div 
                  ref={resultsRef}
                  className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden"
                >
                  {searchResults.map(city => (
                    <button
                      key={city.id}
                      className="w-full px-4 py-2 text-left hover:bg-secondary/50 text-foreground flex justify-between items-center"
                      onClick={() => handleCitySelect(city)}
                    >
                      <span>{city.name}, {city.country}</span>
                      <span className="text-xs text-muted-foreground">{city.timezone}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Indian Cities</h2>
              <Button
                variant="outline"
                onClick={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
              >
                <Search className="mr-2" size={16} />
                Find a city in India
              </Button>
            </div>
            <CitiesTable onCitySelect={handleCitySelect} />
          </div>
        </div>
      </main>
      
      <footer className="bg-secondary/30 py-4 px-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Weather data provided by OpenWeatherMap • City data from OpenDataSoft</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
