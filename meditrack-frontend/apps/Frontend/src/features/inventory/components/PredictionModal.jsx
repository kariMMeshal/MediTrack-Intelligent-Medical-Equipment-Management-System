import React, { useState, useEffect } from "react";
import axios from "axios";

function PredictionModal({ device, token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `/api/ai/device-predictions/${device.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const results = response.data.content || response.data;
        setData(Array.isArray(results) ? results : [results]);
      } catch (err) {
        console.error(`Error fetching prediction:`, err);
        setError(err.response?.data?.message || "Failed to fetch device analysis.");
      } finally {
        setLoading(false);
      }
    };

    if (device) fetchData();
  }, [device, token]);

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-color-gray1 border border-color-white/10 rounded-[8px] w-full max-w-lg overflow-hidden flex flex-col transition-all duration-300 transform scale-100" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-color-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-color-purple/20 flex items-center justify-center text-color-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">AI Failure Analysis</h2>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">{device.name} · {device.model}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-color-gray1/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-color-purple/20 border-t-color-purple rounded-full animate-spin"></div>
              <p className="text-white font-medium animate-pulse">Running AI Analysis...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-color-red/10 border border-color-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-color-red text-2xl font-bold">!</span>
              </div>
              <p className="text-color-red font-medium mb-2">Analysis Failed</p>
              <p className="text-sm text-color-white/50">{error}</p>
              <button onClick={onClose} className="mt-6 px-8 py-2.5 bg-color-gray2 border border-color-white/10 rounded-[8px] text-sm text-white font-bold hover:bg-color-white/5 transition-all">Dismiss</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {data.length > 0 ? (
                  data.map((item, idx) => (
                    <div key={item.id || idx} className="bg-color-gray2/40 border border-color-white/5 rounded-[8px] p-5 flex flex-col gap-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[11px] text-color-white/30 uppercase font-bold tracking-wider">Model Version</span>
                          <p className="text-sm font-bold text-color-purple">{item.modelVersion}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-[8px] text-[11px] font-bold border shadow-sm ${item.failurePredicted ? "bg-color-red/15 text-color-red border-color-red/30" : "bg-color-green/15 text-color-green border-color-green/30"}`}>
                          {item.failurePredicted ? "FAILURE PREDICTED" : "SYSTEM HEALTHY"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-color-gray1/40 rounded-[8px] p-3 border border-white/5 flex flex-col gap-1">
                          <span className="text-[10px] text-color-white/40 uppercase font-bold tracking-widest">Confidence</span>
                          <p className="text-[20px] font-bold text-white leading-none">{(item.probability * 100).toFixed(2)}%</p>
                        </div>
                        <div className="bg-color-gray1/40 rounded-[8px] p-3 border border-white/5 flex flex-col gap-1">
                          <span className="text-[10px] text-color-white/40 uppercase font-bold tracking-widest">Status</span>
                          <p className="text-[20px] font-bold text-white leading-none">{item.status}</p>
                        </div>
                      </div>

                      {item.avgTemperatureVariance && (
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/30 font-bold uppercase">Temperature</span>
                            <span className="text-[13px] font-bold text-white">{item.avgTemperatureVariance.toFixed(2)}°C</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/30 font-bold uppercase">Vibration</span>
                            <span className="text-[13px] font-bold text-white">{item.avgMotorVibration.toFixed(2)} Hz</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-white/30 font-bold uppercase">Voltage</span>
                            <span className="text-[13px] font-bold text-white">{item.avgVoltageDrop.toFixed(2)}V</span>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-color-white/20 text-right font-medium">
                        Analyzed on: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-color-white/40 py-10 italic">No prediction records found.</p>
                )}
              </div>

              <button onClick={onClose} className="w-full py-3.5 bg-color-purple rounded-[8px] font-bold text-[14px] text-white hover:opacity-90 transition-all">
                Close Analysis Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionModal;
