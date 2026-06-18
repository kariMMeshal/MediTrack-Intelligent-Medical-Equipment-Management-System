import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIPredictionList = ({ token }) => {
  const [predictions, setPredictions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predRes, devRes] = await Promise.all([
          axios.get('/api/ai/predictions?size=100', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/medical-devices?size=100', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setPredictions(predRes.data.content || predRes.data);
        setDevices(devRes.data.content || devRes.data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getDeviceName = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : `Device #${deviceId}`;
  };

  return (
    <div className="bg-color-gray1 rounded-[12px] p-6 user-card border border-color-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <h3 className="text-[16px] font-semibold text-white">Global AI Predictions</h3>
      </div>

      <div className="overflow-x-auto user-card overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-color-white/10">
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Device</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Risk Score</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Status</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 uppercase tracking-wider text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-color-white/30 text-sm">Loading neural data...</td></tr>
            ) : predictions.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-color-white/30 text-sm">No predictions found.</td></tr>
            ) : (
              predictions.map((pred, index) => (
                <tr key={pred.id || index} className="border-b border-color-white/5 hover:bg-color-white/5 duration-100 group">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-white group-hover:text-color-purple transition-colors">{pred.deviceName || getDeviceName(pred.deviceId)}</span>
                      <span className="text-[12px] text-color-white/40">v{pred.modelVersion}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-color-white/5 rounded-full overflow-hidden max-w-[80px]">
                        <div 
                          className={`h-full rounded-full ${pred.failurePredicted ? 'bg-color-red' : 'bg-color-green'}`}
                          style={{ width: `${(pred.probability * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-medium text-color-white/70">{(pred.probability * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${pred.failurePredicted ? 'bg-color-red/10 border-color-red text-color-red' : 'bg-color-green/10 border-color-green text-color-green'}`}>
                      {pred.failurePredicted ? 'CRITICAL' : 'HEALTHY'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-[12px] text-color-white/30">{new Date(pred.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIPredictionList;
