
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { City, SortState, FilterState } from "@/types/types";
import { fetchCities } from "@/services/cityService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Loader2 
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface CitiesTableProps {
  onCitySelect: (city: City) => void;
}

const CitiesTable: React.FC<CitiesTableProps> = ({ onCitySelect }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalCities, setTotalCities] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<SortState>({ column: "name", direction: "asc" });
  const [filters, setFilters] = useState<FilterState>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCityElementRef = useRef<HTMLTableRowElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const ROWS_PER_PAGE = 20;

  // Load initial data
  useEffect(() => {
    loadCities();
  }, []);

  // Load more cities when scroll reaches bottom
  useEffect(() => {
    if (isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCities();
      }
    });

    if (lastCityElementRef.current) {
      observer.current.observe(lastCityElementRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore, filteredCities]);

  // Apply filters and search
  useEffect(() => {
    let result = [...cities];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(city => 
        city.name.toLowerCase().includes(query) || 
        city.country.toLowerCase().includes(query) || 
        city.timezone.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.name) {
      result = result.filter(city => 
        city.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    
    if (filters.country) {
      result = result.filter(city => 
        city.country.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }
    
    if (filters.timezone) {
      result = result.filter(city => 
        city.timezone.toLowerCase().includes(filters.timezone!.toLowerCase())
      );
    }
    
    if (filters.population) {
      const populationValue = parseInt(filters.population!);
      if (!isNaN(populationValue)) {
        result = result.filter(city => 
          city.population >= populationValue
        );
      }
    }
    
    setFilteredCities(result);
  }, [cities, searchQuery, filters]);

  // Sort cities
  const sortCities = (column: keyof City) => {
    const newDirection = sort.column === column && sort.direction === "asc" ? "desc" : "asc";
    setSort({ column, direction: newDirection });
    
    const sorted = [...filteredCities].sort((a, b) => {
      // Handle undefined values
      const aValue = a[column] || "";
      const bValue = b[column] || "";
      
      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return newDirection === "asc" 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
    
    setFilteredCities(sorted);
  };

  // Fetch cities
  const loadCities = async () => {
    setIsLoading(true);
    try {
      const { cities: newCities, total } = await fetchCities(
        0,
        ROWS_PER_PAGE,
        searchQuery,
        sort.column || "name",
        sort.direction
      );
      
      setCities(newCities);
      setFilteredCities(newCities);
      setTotalCities(total);
      setPage(1);
      setHasMore(newCities.length < total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cities. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to load cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more cities
  const loadMoreCities = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { cities: newCities } = await fetchCities(
        page * ROWS_PER_PAGE,
        ROWS_PER_PAGE,
        searchQuery,
        sort.column || "name",
        sort.direction
      );
      
      setCities(prevCities => [...prevCities, ...newCities]);
      setFilteredCities(prevCities => [...prevCities, ...newCities]);
      setPage(nextPage);
      setHasMore(nextPage * ROWS_PER_PAGE < totalCities);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load more cities. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to load more cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 3) {
      setIsLoading(true);
      try {
        const { cities: newCities, total } = await fetchCities(
          0,
          ROWS_PER_PAGE,
          query,
          sort.column || "name",
          sort.direction
        );
        
        setCities(newCities);
        setFilteredCities(newCities);
        setTotalCities(total);
        setPage(1);
        setHasMore(newCities.length < total);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (query.length === 0) {
      // Reset to initial state if search is cleared
      loadCities();
    }
  };

  // Handle filter change
  const handleFilterChange = (column: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  // Handle city selection
  const handleCityClick = (city: City) => {
    onCitySelect(city);
    navigate(`/weather/${city.id}`);
  };

  // Handle city right-click
  const handleCityRightClick = (city: City, e: React.MouseEvent) => {
    // Allow default context menu behavior for opening in new tab
  };

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4 bg-primary/10">
        <h2 className="text-2xl font-semibold mb-4">Cities</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10 pr-4"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFilters({})}
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Column filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <Input
            placeholder="Filter by name"
            value={filters.name || ""}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Filter by country"
            value={filters.country || ""}
            onChange={(e) => handleFilterChange("country", e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Filter by timezone"
            value={filters.timezone || ""}
            onChange={(e) => handleFilterChange("timezone", e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Min population"
            value={filters.population || ""}
            onChange={(e) => handleFilterChange("population", e.target.value)}
            className="text-sm"
            type="number"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => sortCities("name")}
              >
                <div className="flex items-center">
                  City Name
                  {sort.column === "name" && (
                    sort.direction === "asc" ? 
                    <ArrowUp className="ml-2" size={14} /> : 
                    <ArrowDown className="ml-2" size={14} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => sortCities("country")}
              >
                <div className="flex items-center">
                  Country
                  {sort.column === "country" && (
                    sort.direction === "asc" ? 
                    <ArrowUp className="ml-2" size={14} /> : 
                    <ArrowDown className="ml-2" size={14} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => sortCities("timezone")}
              >
                <div className="flex items-center">
                  Timezone
                  {sort.column === "timezone" && (
                    sort.direction === "asc" ? 
                    <ArrowUp className="ml-2" size={14} /> : 
                    <ArrowDown className="ml-2" size={14} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => sortCities("population")}
              >
                <div className="flex items-center">
                  Population
                  {sort.column === "population" && (
                    sort.direction === "asc" ? 
                    <ArrowUp className="ml-2" size={14} /> : 
                    <ArrowDown className="ml-2" size={14} />
                  )}
                </div>
              </TableHead>
              <TableHead>Weather</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.map((city, index) => (
              <TableRow 
                key={city.id}
                ref={index === filteredCities.length - 1 ? lastCityElementRef : null}
                className="hover:bg-secondary/30 cursor-pointer"
                onClick={() => handleCityClick(city)}
                onContextMenu={(e) => handleCityRightClick(city, e)}
              >
                <TableCell className="font-medium">
                  <a href={`/weather/${city.id}`} className="text-primary hover:underline">
                    {city.name}
                  </a>
                </TableCell>
                <TableCell>{city.country}</TableCell>
                <TableCell>{city.timezone}</TableCell>
                <TableCell>{city.population?.toLocaleString() || "N/A"}</TableCell>
                <TableCell>
                  {city.weatherData ? (
                    <div className="flex items-center">
                      <img 
                        src={`https://openweathermap.org/img/wn/${city.weatherData.current.weather[0].icon}.png`} 
                        alt={city.weatherData.current.weather[0].description}
                        className="w-8 h-8 mr-2"
                      />
                      <span>{Math.round(city.weatherData.current.temp)}°C</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No data</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Loading cities...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredCities.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No cities found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 flex justify-between items-center bg-secondary/20 text-sm">
        <div>
          Showing {filteredCities.length} of {totalCities} cities
        </div>
        {hasMore && !isLoading && (
          <Button 
            variant="outline" 
            onClick={loadMoreCities}
            size="sm"
          >
            Load more
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CitiesTable;
