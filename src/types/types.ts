
// City types
export interface City {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
  population: number;
  geoname_id?: number;
  cou_name_en?: string;
  timezone_str?: string;
  coordinates?: [number, number];
  weatherData?: WeatherData | null;
}

// Weather types
export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherCondition[];
  dt: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface ForecastDay {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: WeatherCondition[];
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
}

// API response types
export interface OpenDataSoftResponse {
  records: Record[];
  total_count: number;
  nhits: number;
  parameters: {
    dataset: string;
    rows: number;
    start: number;
    sort?: string[];
    q?: string;
    facet?: string[];
    format: string;
    timezone: string;
  };
}

export interface Record {
  datasetid: string;
  recordid: string;
  fields: {
    cou_name_en: string;
    coordinates: [number, number];
    dem: number;
    elevation: number;
    feature_class: string;
    feature_code: string;
    geoname_id: number;
    label_en: string;
    modification_date: string;
    name: string;
    population: number;
    timezone_str: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  record_timestamp: string;
}

export interface WeatherAPIResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastAPIResponse {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
    };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// Table sorting types
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: keyof City | null;
  direction: SortDirection;
}

// Table filter types
export interface FilterState {
  name?: string;
  country?: string;
  timezone?: string;
  population?: string;
}
