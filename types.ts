export type FlightStatus = 'On-Time' | 'Delayed' | 'Cancelled';

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string; // ISO string
  arrivalTime: string;   // ISO string
  status: FlightStatus;
  delayMinutes: number;
  aircraftType: string;
  ticketPrice: number;
  passengerCount: number;
  predictedRisk: 'Low' | 'Medium' | 'High';
}

export interface FlightStats {
  totalFlights: number;
  totalDelays: number;
  totalCancellations: number;
  onTimePerformance: number;
  mostActiveAirport: string;
  mostDelayedAirline: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface FilterState {
  searchTerm: string;
  status: FlightStatus | 'All';
  airline: string | 'All';
}