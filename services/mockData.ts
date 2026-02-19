import { Flight, FlightStatus } from '../types';

const AIRLINES = ['Emirates', 'Air India', 'British Airways', 'Qatar Airways', 'Lufthansa', 'Singapore Airlines', 'Delta', 'United'];
const AIRPORTS = ['Mumbai (BOM)', 'Dubai (DXB)', 'London (LHR)', 'Doha (DOH)', 'Frankfurt (FRA)', 'Singapore (SIN)', 'New York (JFK)', 'Tokyo (HND)'];
const AIRCRAFT = ['Boeing 777', 'Airbus A380', 'Airbus A320', 'Boeing 787', 'Airbus A350'];

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const calculateRisk = (airline: string, delayMinutes: number): 'Low' | 'Medium' | 'High' => {
  // Simple AI mock logic
  if (delayMinutes > 60) return 'High';
  if (['Air India', 'Lufthansa'].includes(airline) && Math.random() > 0.6) return 'Medium';
  if (delayMinutes > 15) return 'Medium';
  return 'Low';
};

export const generateMockFlights = (count: number = 100): Flight[] => {
  const flights: Flight[] = [];
  const now = new Date();
  const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days future

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const depAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    let arrAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    while (arrAirport === depAirport) {
      arrAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    }

    const departureTime = generateRandomDate(past, future);
    const durationHours = 2 + Math.floor(Math.random() * 12);
    const arrivalTime = new Date(departureTime.getTime() + durationHours * 60 * 60 * 1000);

    const rand = Math.random();
    let status: FlightStatus = 'On-Time';
    let delayMinutes = 0;

    if (rand > 0.85) {
      status = 'Cancelled';
    } else if (rand > 0.65) {
      status = 'Delayed';
      delayMinutes = 15 + Math.floor(Math.random() * 180);
    }

    flights.push({
      id: `FL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + Math.floor(Math.random() * 900)}`,
      airline,
      departureAirport: depAirport,
      arrivalAirport: arrAirport,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      status,
      delayMinutes,
      aircraftType: AIRCRAFT[Math.floor(Math.random() * AIRCRAFT.length)],
      ticketPrice: 300 + Math.floor(Math.random() * 1500),
      passengerCount: 100 + Math.floor(Math.random() * 300),
      predictedRisk: calculateRisk(airline, delayMinutes)
    });
  }
  return flights;
};

// Initial Load
let cachedFlights: Flight[] = [];

export const getFlightsService = (): Flight[] => {
  if (cachedFlights.length === 0) {
    const stored = localStorage.getItem('skyAnalytics_flights');
    if (stored) {
      cachedFlights = JSON.parse(stored);
    } else {
      cachedFlights = generateMockFlights(80);
      localStorage.setItem('skyAnalytics_flights', JSON.stringify(cachedFlights));
    }
  }
  return cachedFlights;
};

export const resetDataService = () => {
  cachedFlights = generateMockFlights(80);
  localStorage.setItem('skyAnalytics_flights', JSON.stringify(cachedFlights));
  return cachedFlights;
};

export const addFlightService = (flight: Flight) => {
  cachedFlights = [flight, ...cachedFlights];
  localStorage.setItem('skyAnalytics_flights', JSON.stringify(cachedFlights));
  return cachedFlights;
};

export const deleteFlightService = (id: string) => {
  cachedFlights = cachedFlights.filter(f => f.id !== id);
  localStorage.setItem('skyAnalytics_flights', JSON.stringify(cachedFlights));
  return cachedFlights;
};