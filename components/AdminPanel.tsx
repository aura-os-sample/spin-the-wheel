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
    setEditConfig(JSON.parse(JSON.stringify(cfg))); // Deep copy for form
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

  // Prepare chart data
  const chartData = Object.keys(config).map((key) => ({
    name: config[key].label,
    count: counts[key] || 0,
    limit: config[key].maxLimit,
    color: config[key].color,
  }));

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-slate-800 text-white p-2 rounded-lg text-sm">ADMIN</span> 
              Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 font-medium text-sm"
            >
              <Trash2 size={16} />
              Reset Counts (Clear History)
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="text-slate-400" size={20} />
              Wheel Logic Configuration
            </h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                   <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveConfig}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm transition-colors"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 text-sm transition-colors"
                >
                  Edit Limits
                </button>
              )}
               <button 
                onClick={handleResetConfig}
                className="ml-2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Reset to Defaults"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(isEditing ? editConfig : config).map((key) => {
              const item = isEditing ? editConfig[key] : config[key];
              return (
                <div key={key} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase font-semibold mb-1">Max Limit</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          value={item.maxLimit}
                          onChange={(e) => handleConfigChange(key, 'maxLimit', e.target.value)}
                        />
                      ) : (
                        <div className="text-sm font-mono bg-white px-2 py-1 rounded border border-slate-200">
                          {item.maxLimit}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 uppercase font-semibold mb-1">Probability</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          value={item.probability}
                          onChange={(e) => handleConfigChange(key, 'probability', e.target.value)}
                        />
                      ) : (
                         <div className="text-sm font-mono bg-white px-2 py-1 rounded border border-slate-200">
                          {item.probability}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart2 className="text-slate-400" size={20} />
              Real-time Usage
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Limits Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <RefreshCw className="text-slate-400" size={20} />
              Limits Status
            </h2>
            <div className="space-y-4">
              {chartData.map((stat) => (
                <div key={stat.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700">{stat.name}</span>
                    <span className={`${stat.count >= stat.limit ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                      {stat.count} / {stat.limit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (stat.count / stat.limit) * 100)}%`, backgroundColor: stat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
              <p><strong>Total Spins:</strong> {history.length}</p>
              <p className="mt-1">When limits are reached, the probability engine automatically normalizes remaining weights.</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Table className="text-slate-400" size={20} />
              Spin History
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Outcome</th>
                  <th className="px-6 py-3 font-medium">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No spins recorded yet.</td>
                  </tr>
                ) : (
                  history.map((record) => {
                     // Safe lookup in case config changed
                     const conf = config[record.outcomeId] || { color: '#ccc', label: record.outcomeId };
                     return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">{new Date(record.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span 
                            className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: conf.color }}
                          >
                            {conf.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-400">{record.id}</td>
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
  );
};

export default AdminPanel;