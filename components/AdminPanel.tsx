import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { clearHistory, getHistory, getCounts } from '../services/storageService';
import { getConfig, saveConfig, resetConfig } from '../services/configService';
import { SpinRecord, OutcomeConfig } from '../types';
import { Trash2, RefreshCw, BarChart2, Table, Settings, Save, RotateCcw } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [config, setConfig] = useState<Record<string, OutcomeConfig>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<Record<string, OutcomeConfig>>({});

  const refreshData = () => {
    const hist = getHistory();
    const cnts = getCounts();
    const cfg = getConfig();
    setHistory(hist);
    setCounts(cnts);
    setConfig(cfg);
    setEditConfig(JSON.parse(JSON.stringify(cfg)));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete all spin history? This resets current counts.')) {
      clearHistory();
      refreshData();
    }
  };

  const handleResetConfig = () => {
    if (confirm('Reset all limits and probabilities to default?')) {
      resetConfig();
      refreshData();
    }
  };

  const handleSaveConfig = () => {
    saveConfig(editConfig);
    setIsEditing(false);
    refreshData();
  };

  const handleConfigChange = (id: string, field: 'probability' | 'maxLimit', value: string) => {
    const numVal = parseFloat(value);
    setEditConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: isNaN(numVal) ? 0 : numVal
      }
    }));
  };

  const chartData = Object.keys(config).map((key) => ({
    name: config[key].label,
    count: counts[key] || 0,
    limit: config[key].maxLimit,
    color: config[key].color,
  }));

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 z-10">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs tracking-wide">ADMIN</span> 
          Dashboard
        </h1>
        <button 
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200 text-xs font-bold uppercase tracking-wide"
        >
          <Trash2 size={14} />
          Reset History
        </button>
      </header>

      {/* Main Content Area - Scrollable Container if vertical space runs out on small screens, but aimed to fit */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
          
          {/* Top Row: Config & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
            
            {/* Left: Configuration */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                  <Settings size={16} /> Configuration
                </h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                      <button onClick={handleSaveConfig} className="flex items-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"><Save size={12}/> Save</button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 border border-slate-200 rounded hover:bg-slate-50">Edit</button>
                  )}
                  <button onClick={handleResetConfig} className="p-1 text-slate-400 hover:text-indigo-600" title="Reset Defaults"><RotateCcw size={14}/></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(isEditing ? editConfig : config).map((key) => {
                  const item = isEditing ? editConfig[key] : config[key];
                  return (
                    <div key={key} className="p-3 rounded border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-xs text-slate-700 truncate">{item.label}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold">Limit</label>
                          {isEditing ? (
                            <input type="number" className="w-full text-xs p-1 border rounded" value={item.maxLimit} onChange={(e) => handleConfigChange(key, 'maxLimit', e.target.value)} />
                          ) : (
                            <div className="text-xs font-mono">{item.maxLimit}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold">Prob</label>
                          {isEditing ? (
                            <input type="number" step="0.01" className="w-full text-xs p-1 border rounded" value={item.probability} onChange={(e) => handleConfigChange(key, 'probability', e.target.value)} />
                          ) : (
                             <div className="text-xs font-mono">{item.probability}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Charts */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                <BarChart2 size={16} /> Live Status
              </h2>
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{fontSize: '12px', borderRadius: '4px'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
                <span>Total Spins: {history.length}</span>
                <span>Limits Enabled</span>
              </div>
            </div>

          </div>

          {/* Bottom Row: History Table (Fills remaining height) */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
              <h2 className="text-sm font-bold uppercase text-slate-500 flex items-center gap-2">
                <Table size={16} /> Recent History
              </h2>
            </div>
            <div className="overflow-auto flex-1 p-0">
              <table className="w-full text-left text-sm text-slate-600 relative">
                <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Outcome</th>
                    <th className="px-6 py-3">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No spins recorded yet.</td>
                    </tr>
                  ) : (
                    history.map((record) => {
                       const conf = config[record.outcomeId] || { color: '#ccc', label: record.outcomeId };
                       return (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-2 whitespace-nowrap text-xs text-slate-500">{new Date(record.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                              style={{ backgroundColor: conf.color }}
                            >
                              {conf.label}
                            </span>
                          </td>
                          <td className="px-6 py-2 font-mono text-[10px] text-slate-300">{record.id}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;