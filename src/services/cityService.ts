
import { City, OpenDataSoftResponse, Record } from "@/types/types";

const API_BASE_URL = "https://public.opendatasoft.com/api/records/1.0/search/";
const DATASET = "geonames-all-cities-with-a-population-1000";

// Cache cities to avoid unnecessary API calls
let citiesCache: Map<string, City[]> = new Map();

// Transform OpenDataSoft API records to City objects
const transformRecordToCity = (record: Record): City => {
  return {
    id: record.fields.geoname_id,
    name: record.fields.name,
    country: record.fields.cou_name_en,
    countryCode: "", // Not provided in the API
    timezone: record.fields.timezone_str || "",
    latitude: record.fields.coordinates[0],
    longitude: record.fields.coordinates[1],
    population: record.fields.population || 0,
    geoname_id: record.fields.geoname_id,
    cou_name_en: record.fields.cou_name_en,
    timezone_str: record.fields.timezone_str,
    coordinates: record.fields.coordinates,
    weatherData: null
  };
};

// Fetch cities with pagination and search
export const fetchCities = async (
  start: number = 0,
  rows: number = 20,
  searchQuery: string = "",
  sortBy: string = "name",
  sortOrder: string = "asc"
): Promise<{ cities: City[]; total: number }> => {
  try {
    const cacheKey = `${start}-${rows}-${searchQuery}-${sortBy}-${sortOrder}`;
    const cached = citiesCache.get(cacheKey);
    
    if (cached) {
      return { cities: cached, total: cached.length };
    }

    const params = new URLSearchParams({
      dataset: DATASET,
      rows: rows.toString(),
      start: start.toString(),
      sort: `${sortOrder === "asc" ? "" : "-"}${sortBy}`,
      format: "json",
      timezone: "UTC"
    });

    if (searchQuery) {
      params.append("q", searchQuery);
    }

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    const data: OpenDataSoftResponse = await response.json();
    const cities = data.records.map(transformRecordToCity);
    
    // Cache the results
    citiesCache.set(cacheKey, cities);
    
    return { cities, total: data.nhits };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return { cities: [], total: 0 };
  }
};

// Search cities by name or country
export const searchCities = async (query: string): Promise<City[]> => {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    const cacheKey = `search-${query}`;
    const cached = citiesCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { cities } = await fetchCities(0, 10, query);
    
    // Cache the results
    citiesCache.set(cacheKey, cities);
    
    return cities;
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
};
