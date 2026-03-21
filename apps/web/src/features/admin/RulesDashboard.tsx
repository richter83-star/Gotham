'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, ShieldAlert, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export function RulesDashboard() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', description: '', severity: 'MEDIUM', field: '', operator: '==', value: '' });

  const fetchRules = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/rules')
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = () => {
    const payload = {
      name: newRule.name,
      description: newRule.description,
      severity: newRule.severity,
      is_active: true,
      condition_json: {
        field: newRule.field,
        operator: newRule.operator,
        value: newRule.value
      }
    };

    fetch('http://localhost:8000/api/v1/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      setShowNewRule(false);
      setNewRule({ name: '', description: '', severity: 'MEDIUM', field: '', operator: '==', value: '' });
      fetchRules();
    });
  };

  const handleDelete = (id: string) => {
    fetch(`http://localhost:8000/api/v1/rules/${id}`, { method: 'DELETE' })
      .then(() => fetchRules());
  };

  return (
    <div className="w-full text-zinc-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="text-primary" /> Streaming Rules Engine
          </h1>
          <p className="text-sm text-zinc-400 mt-2">Manage real-time evaluation logic for event ingestion.</p>
        </div>
        <button 
          onClick={() => setShowNewRule(true)}
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 font-bold text-sm rounded-md transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New Rule
        </button>
      </div>

      {showNewRule && (
        <div className="bg-[#1a1a1b] border border-[#27272a] p-6 rounded-lg mb-8 shadow-inner shadow-black">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-zinc-400">Configure Rule Condition</h2>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Rule Name</label>
              <input value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} className="w-full bg-[#0c0c0d] border border-zinc-700 rounded px-3 py-2 text-sm" placeholder="e.g. High Value Transfer" />
            </div>
            <div>
              <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Severity</label>
              <select value={newRule.severity} onChange={e => setNewRule({...newRule, severity: e.target.value})} className="w-full bg-[#0c0c0d] border border-zinc-700 rounded px-3 py-2 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Description</label>
              <input value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})} className="w-full bg-[#0c0c0d] border border-zinc-700 rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="bg-[#0c0c0d] p-4 rounded border border-zinc-800 flex gap-4 items-end mb-6">
             <div className="flex-1">
               <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">JSON Field Path</label>
               <input value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})} className="w-full bg-[#1a1a1b] border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-zinc-300" placeholder="transaction.amount" />
             </div>
             <div className="w-32">
               <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Operator</label>
               <select value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})} className="w-full bg-[#1a1a1b] border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono">
                 <option value="==">==</option>
                 <option value="!=">!=</option>
                 <option value=">">&gt;</option>
                 <option value="<">&lt;</option>
                 <option value="CONTAINS">CONTAINS</option>
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Target Value</label>
               <input value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} className="w-full bg-[#1a1a1b] border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-zinc-300" placeholder="10000" />
             </div>
          </div>

          <div className="flex justify-end gap-3">
             <button onClick={() => setShowNewRule(false)} className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleCreateRule} className="px-4 py-2 text-sm font-bold bg-primary text-white rounded hover:bg-primary/80 transition-colors">Deploy Rule</button>
          </div>
        </div>
      )}

      <div className="bg-[#0c0c0d] rounded-lg border border-[#27272a] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1a1b] border-b border-[#27272a] text-xs uppercase tracking-wider text-zinc-500">
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Rule Name</th>
              <th className="p-4 font-bold">Severity</th>
              <th className="p-4 font-bold">Condition Logic</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-500 animate-pulse">Loading Rules...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No stream logic rules deployed.</td></tr>
            ) : (
              rules.map(rule => (
                <tr key={rule.id} className="hover:bg-[#1a1a1b]/50 transition-colors">
                  <td className="p-4">
                    {rule.is_active ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-zinc-600" />}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-zinc-100">{rule.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">{rule.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                      rule.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      rule.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <code className="text-[11px] font-mono bg-[#0c0c0d] p-1.5 rounded border border-[#27272a] text-zinc-400">
                      {rule.condition_json.field} {rule.condition_json.operator} {rule.condition_json.value}
                    </code>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(rule.id)} className="text-zinc-500 hover:text-red-500 transition-colors p-2">
                       <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
