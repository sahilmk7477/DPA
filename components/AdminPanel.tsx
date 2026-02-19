import React, { useState } from 'react';
import { Flight } from '../types';
import { addFlightService, resetDataService } from '../services/mockData';
import { Plus, Trash2, RefreshCw, Upload, Download } from 'lucide-react';

interface AdminPanelProps {
  onUpdate: (flights: Flight[]) => void;
  flights: Flight[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate, flights }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({
    airline: 'Emirates',
    departureAirport: 'Dubai (DXB)',
    arrivalAirport: 'London (LHR)',
    status: 'On-Time',
    delayMinutes: 0
  });

  const handleAddFlight = () => {
    const flight: Flight = {
      id: `FL-MANUAL-${Math.random().toString(36).substr(2, 5)}`,
      flightNumber: 'XX999',
      airline: newFlight.airline || 'Unknown',
      departureAirport: newFlight.departureAirport || 'Unknown',
      arrivalAirport: newFlight.arrivalAirport || 'Unknown',
      departureTime: new Date().toISOString(),
      arrivalTime: new Date(Date.now() + 3600000 * 4).toISOString(),
      status: (newFlight.status as any) || 'On-Time',
      delayMinutes: newFlight.delayMinutes || 0,
      aircraftType: 'Boeing 777',
      ticketPrice: 500,
      passengerCount: 150,
      predictedRisk: 'Low'
    };
    const updated = addFlightService(flight);
    onUpdate(updated);
    setIsFormOpen(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to random defaults?')) {
      const updated = resetDataService();
      onUpdate(updated);
    }
  };

  const exportCSV = () => {
    const headers = ["Flight Number", "Airline", "From", "To", "Date", "Status", "Delay"];
    const rows = flights.map(f => [
      f.flightNumber, 
      f.airline, 
      f.departureAirport, 
      f.arrivalAirport, 
      new Date(f.departureTime).toLocaleDateString(), 
      f.status, 
      f.delayMinutes
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "flight_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel p-6 rounded-xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           Admin Control Center
        </h2>
        <div className="flex gap-2">
           <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition text-sm">
             <RefreshCw size={16} /> Reset Data
           </button>
           <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition text-sm">
             <Download size={16} /> Export CSV
           </button>
        </div>
      </div>

      {!isFormOpen ? (
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-500 transition flex flex-col items-center gap-2"
        >
          <Plus size={32} />
          <span className="font-medium">Add New Flight Record manually</span>
        </button>
      ) : (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">New Flight Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-xs text-slate-400 mb-1">Airline</label>
               <select 
                 className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                 value={newFlight.airline}
                 onChange={e => setNewFlight({...newFlight, airline: e.target.value})}
               >
                 {['Emirates', 'Air India', 'British Airways', 'Qatar Airways'].map(a => (
                   <option key={a} value={a}>{a}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1">Status</label>
               <select 
                 className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                 value={newFlight.status}
                 onChange={e => setNewFlight({...newFlight, status: e.target.value as any})}
               >
                 <option value="On-Time">On-Time</option>
                 <option value="Delayed">Delayed</option>
                 <option value="Cancelled">Cancelled</option>
               </select>
             </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddFlight}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg shadow-blue-900/50"
            >
              Save Flight
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-3">
        <Upload className="text-blue-400 shrink-0 mt-1" size={20} />
        <div>
          <h4 className="text-blue-200 font-medium text-sm">Bulk Upload</h4>
          <p className="text-blue-300/60 text-xs mt-1">
            Drag and drop a CSV file here to upload multiple flight records simultaneously. (Mock feature)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;