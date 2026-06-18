import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIAlerts = ({ token }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/alerts?size=20&sort=createdAt,desc', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data.content || res.data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Polling every 30 seconds since we can't modify the backend to support SSE with JWT in URL
    const interval = setInterval(() => {
      fetchAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      await axios.put(`/api/alerts/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // SSE will handle the UI update usually, but we can optimistic update or refetch
      fetchAlerts();
    } catch (err) {
      console.error(`Error ${action}ing alert:`, err);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-color-red/10 border-color-red text-color-red';
      case 'WARNING': return 'bg-color-warning/10 border-color-warning text-[#EAE546]';
      default: return 'bg-sky-500/10 border-sky-500 text-sky-500';
    }
  };

  return (
    <div className="bg-color-gray1 rounded-[12px]  border border-color-white/10 overflow-hidden flex flex-col h-full user-card">
      <div className="p-5 border-b border-color-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-color-red/10 flex items-center justify-center text-color-red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3 className="text-[15px] font-semibold text-white">System Alerts</h3>
        </div>
        {alerts.filter(a => a.status === 'NEW').length > 0 && (
          <span className="w-2 h-2 rounded-full bg-color-red animate-ping"></span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-color-white/30 py-10 text-sm">Synchronizing alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-center text-color-white/30 py-10 text-sm">All systems normal.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`bg-color-white/5 border border-color-white/5 rounded-[12px] p-4 transition-all ${alert.status === 'NEW' ? 'ring-1 ring-color-purple/30 bg-color-purple/5' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getSeverityStyle(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-[11px] text-color-white/30">{new Date(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <h4 className="text-[14px] font-medium text-white mb-1">{alert.type.replace('_', ' ')}</h4>
              <p className="text-[13px] text-color-white/60 leading-normal mb-3">{alert.message}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-color-white/5">
                <div className="flex gap-2">
                  {alert.status === 'NEW' && (
                    <button onClick={() => handleAction(alert.id, 'read')} className="text-[10px] text-color-purple hover:underline font-bold uppercase">Mark Read</button>
                  )}
                  {(alert.status === 'NEW' || alert.status === 'READ') && (
                    <button onClick={() => handleAction(alert.id, 'acknowledge')} className="text-[10px] text-sky-400 hover:underline font-bold uppercase">Acknowledge</button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button onClick={() => handleAction(alert.id, 'resolve')} className="text-[10px] text-color-green hover:underline font-bold uppercase">Resolve</button>
                  )}
                </div>
                <span className="text-[10px] text-color-white/30 font-bold uppercase">{alert.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAlerts;