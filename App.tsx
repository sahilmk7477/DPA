import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  User, 
  Menu,
  X,
  TrendingUp,
  Map,
  LogOut
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Flight, FlightStats, FilterState } from './types';
import { getFlightsService, deleteFlightService } from './services/mockData';
import StatCard from './components/StatCard';
import AdminPanel from './components/AdminPanel';

// --- Helper Components ---

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    'On-Time': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Delayed': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Cancelled': 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles['On-Time']}`}>
      {status}
    </span>
  );
};

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const colors = {
    'Low': 'text-green-400',
    'Medium': 'text-yellow-400',
    'High': 'text-red-400 font-bold animate-pulse'
  };
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${risk === 'High' ? 'bg-red-500' : risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
      <span className={`text-xs ${colors[risk as keyof typeof colors]}`}>
        {risk} Risk
      </span>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [view, setView] = useState<'dashboard' | 'flights' | 'admin'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'All',
    airline: 'All'
  });

  // Load Data
  useEffect(() => {
    setFlights(getFlightsService());
  }, []);

  // Computed Data
  const filteredFlights = useMemo(() => {
    return flights.filter(f => {
      const matchesSearch = 
        f.flightNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        f.departureAirport.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        f.arrivalAirport.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || f.status === filters.status;
      const matchesAirline = filters.airline === 'All' || f.airline === filters.airline;

      return matchesSearch && matchesStatus && matchesAirline;
    });
  }, [flights, filters]);

  const stats: FlightStats = useMemo(() => {
    const total = flights.length;
    const delays = flights.filter(f => f.status === 'Delayed').length;
    const cancels = flights.filter(f => f.status === 'Cancelled').length;
    const onTime = flights.filter(f => f.status === 'On-Time').length;
    
    // Find most active airport
    const airports: Record<string, number> = {};
    flights.forEach(f => {
      airports[f.departureAirport] = (airports[f.departureAirport] || 0) + 1;
    });
    const mostActiveAirport = Object.entries(airports).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Find most delayed airline
    const airlineDelays: Record<string, number> = {};
    flights.filter(f => f.status === 'Delayed').forEach(f => {
      airlineDelays[f.airline] = (airlineDelays[f.airline] || 0) + 1;
    });
    const mostDelayedAirline = Object.entries(airlineDelays).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalFlights: total,
      totalDelays: delays,
      totalCancellations: cancels,
      onTimePerformance: total ? Math.round((onTime / total) * 100) : 0,
      mostActiveAirport,
      mostDelayedAirline
    };
  }, [flights]);

  // Chart Data preparation
  const airlineDelayData = useMemo(() => {
    const data: Record<string, number> = {};
    flights.filter(f => f.status === 'Delayed').forEach(f => {
      data[f.airline] = (data[f.airline] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [flights]);

  const statusData = useMemo(() => {
    return [
      { name: 'On-Time', value: flights.filter(f => f.status === 'On-Time').length, color: '#4ade80' },
      { name: 'Delayed', value: flights.filter(f => f.status === 'Delayed').length, color: '#f87171' },
      { name: 'Cancelled', value: flights.filter(f => f.status === 'Cancelled').length, color: '#94a3b8' },
    ];
  }, [flights]);

  const deleteFlight = (id: string) => {
    const updated = deleteFlightService(id);
    setFlights(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-50 rounded-none border-x-0 border-t-0">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-2 rounded-lg">
             <Plane className="text-white" size={20} />
           </div>
           <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">SkyAnalytics</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 glass-panel rounded-none border-y-0 border-l-0 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Plane className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SkyAnalytics</h1>
              <p className="text-xs text-slate-400">Pro Flight Dashboard</p>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'flights', label: 'All Flights', icon: Plane },
              { id: 'admin', label: 'Admin Panel', icon: User },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id as any); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  view === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-8 left-0 w-full px-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-center relative overflow-hidden group cursor-pointer hover:shadow-lg transition">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
              <h4 className="text-white font-bold relative z-10">Premium Plan</h4>
              <p className="text-blue-100 text-xs mt-1 relative z-10 mb-3">Unlock AI predictions</p>
              <button className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold">Upgrade</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Background Gradients */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
             <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
          </div>

          <div className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
            
            {/* Top Bar (Search & User) */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
               <div>
                 <h2 className="text-2xl font-bold text-white">
                   {view === 'dashboard' ? 'Overview' : view === 'flights' ? 'Flight Management' : 'Admin Control'}
                 </h2>
                 <p className="text-slate-400 text-sm">Welcome back, Administrator.</p>
               </div>
               
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="relative group w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition" size={18} />
                   <input 
                     type="text" 
                     placeholder="Search flight number..." 
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition text-white placeholder-slate-500"
                     value={filters.searchTerm}
                     onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                   />
                 </div>
                 <button className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition">
                   <LogOut size={18} />
                 </button>
               </div>
            </header>

            {/* DASHBOARD VIEW */}
            {view === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Flights" 
                    value={stats.totalFlights} 
                    icon={Plane} 
                    trend="+12%" 
                    trendUp={true}
                    colorClass="bg-blue-500"
                  />
                  <StatCard 
                    title="Avg Delay" 
                    value={`${Math.round(stats.totalDelays / (stats.totalFlights || 1) * 100) / 10}m`} 
                    icon={Clock} 
                    trend="-5%" 
                    trendUp={true}
                    colorClass="bg-indigo-500"
                  />
                  <StatCard 
                    title="Cancellations" 
                    value={stats.totalCancellations} 
                    icon={AlertTriangle} 
                    trend="+2%" 
                    trendUp={false}
                    colorClass="bg-red-500"
                  />
                  <StatCard 
                    title="On-Time Perf" 
                    value={`${stats.onTimePerformance}%`} 
                    icon={TrendingUp} 
                    trend="+1.2%" 
                    trendUp={true}
                    colorClass="bg-emerald-500"
                  />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Airline Delays Bar Chart */}
                  <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-6">Delays by Airline (Top 5)</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={airlineDelayData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                            cursor={{ fill: '#334155', opacity: 0.2 }}
                          />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Flight Status Pie Chart */}
                  <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-6">Flight Status Distribution</h3>
                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Alerts / Delayed Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Critical Alerts (Delays &gt; 60m)</h3>
                    <button onClick={() => setView('flights')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Flight</th>
                          <th className="px-6 py-4 font-semibold">Route</th>
                          <th className="px-6 py-4 font-semibold">Delay Time</th>
                          <th className="px-6 py-4 font-semibold">AI Risk Prediction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {flights.filter(f => f.delayMinutes > 60).slice(0, 5).map(flight => (
                          <tr key={flight.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{flight.flightNumber}</div>
                              <div className="text-xs text-slate-500">{flight.airline}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300">
                              {flight.departureAirport.split(' ')[0]} &rarr; {flight.arrivalAirport.split(' ')[0]}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-red-400 font-bold">+{flight.delayMinutes} min</span>
                            </td>
                            <td className="px-6 py-4">
                              <RiskBadge risk={flight.predictedRisk} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* FLIGHTS TABLE VIEW */}
            {view === 'flights' && (
              <div className="space-y-6 animate-fade-in">
                {/* Filters */}
                <div className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filter by:</span>
                  </div>
                  <select 
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                  >
                    <option value="All">All Statuses</option>
                    <option value="On-Time">On-Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <select 
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={filters.airline}
                    onChange={(e) => setFilters({...filters, airline: e.target.value as any})}
                  >
                    <option value="All">All Airlines</option>
                    {Array.from(new Set(flights.map(f => f.airline))).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Flight No.</th>
                          <th className="px-6 py-4 font-semibold">Airline</th>
                          <th className="px-6 py-4 font-semibold">Route</th>
                          <th className="px-6 py-4 font-semibold">Schedule</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Delay</th>
                          <th className="px-6 py-4 font-semibold">AI Risk</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {filteredFlights.length > 0 ? filteredFlights.map(flight => (
                          <tr key={flight.id} className="hover:bg-slate-800/30 transition group">
                            <td className="px-6 py-4 font-medium text-white">{flight.flightNumber}</td>
                            <td className="px-6 py-4 flex items-center gap-2">
                                {/* Simple colored dot for airline logo placeholder */}
                                <div className={`w-2 h-2 rounded-full ${flight.airline.includes('Air') ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                <span className="text-slate-300">{flight.airline}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              <div className="flex flex-col">
                                <span>{flight.departureAirport.split(' ')[0]}</span>
                                <span className="text-xs opacity-50">to</span>
                                <span>{flight.arrivalAirport.split(' ')[0]}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              <div>{new Date(flight.departureTime).toLocaleDateString()}</div>
                              <div className="text-xs">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={flight.status} />
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {flight.delayMinutes > 0 ? (
                                <span className="text-red-400">+{flight.delayMinutes}m</span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <RiskBadge risk={flight.predictedRisk} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => deleteFlight(flight.id)}
                                className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                                title="Delete Flight"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                             <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                               No flights found matching your criteria.
                             </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Mock */}
                  <div className="p-4 border-t border-slate-700/50 flex justify-between items-center text-sm text-slate-400">
                    <span>Showing {Math.min(filteredFlights.length, 10)} of {filteredFlights.length} flights</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                      <button className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN VIEW */}
            {view === 'admin' && (
              <div className="animate-fade-in max-w-4xl mx-auto">
                <AdminPanel flights={flights} onUpdate={setFlights} />
              </div>
            )}
            
          </div>
          
          <footer className="mt-12 p-8 border-t border-slate-800 text-center text-slate-600 text-sm">
            &copy; 2023 SkyAnalytics Pro. Designed for international flight monitoring.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;