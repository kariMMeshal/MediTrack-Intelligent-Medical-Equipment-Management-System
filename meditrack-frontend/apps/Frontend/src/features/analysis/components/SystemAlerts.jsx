import React, { useState, useEffect } from 'react';
import axios from 'axios';
import alertWarningIcon from '../../../assets/Error-Warning.svg';
import alertRedIcon from '../../../assets/Error-Red.svg';
import alertGreenIcon from '../../../assets/Error-Green.svg';
import closeIcon from '../../../assets/Close.svg';

const SystemAlerts = ({ token, maxHeight = "400px" }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Report States
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportError, setReportError] = useState("");

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

    // Periodic polling as a fallback since EventSource requires backend changes for headers
    const interval = setInterval(() => {
      fetchAlerts();
    }, 15000); // Fetch every 15 seconds

    return () => clearInterval(interval);
  }, [token]);

  const handleAlertAction = async (id, action) => {
    try {
      await axios.put(`/api/alerts/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (err) {
      console.error(`Error ${action}ing alert:`, err);
    }
  };

  const handleGenerateAIReport = async () => {
    setReportLoading(true);
    setReportOpen(true);
    setReportError("");
    setReportData(null);
    try {
      const res = await axios.get('/api/alerts/report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Error generating alert report:", err);
      setReportError("Failed to generate AI report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const getSeverityData = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          colorClass: 'bg-color-red/10 text-color-red',
          icon: alertRedIcon,
          borderClass: 'border-color-red/20 bg-color-red/5'
        };
      case 'INFO':
        return {
          colorClass: 'bg-color-green/10 text-color-green',
          icon: alertGreenIcon,
          borderClass: 'border-color-green/20 bg-color-green/5'
        };
      default:
        return {
          colorClass: 'bg-color-warning/10 text-color-warning',
          icon: alertWarningIcon,
          borderClass: 'border-color-warning/20 bg-color-warning/5'
        };
    }
  };

  return (
    <div className="bg-color-gray1 border border-color-white/10 rounded-[12px] p-8 user-card flex flex-col gap-6 h-full relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-color-red/10 flex items-center justify-center text-color-red">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white tracking-tight">
              System Alerts
            </h2>
            <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">
              Priority Notifications
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateAIReport}
          className="bg-color-purple text-white px-4 py-2 rounded-[8px] font-bold text-[12px] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-color-purple/20 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          AI Report
        </button>
      </div>

      <div className={`flex flex-col gap-4 overflow-y-auto user-card custom-scrollbar pr-2`} style={{ maxHeight }}>
        {loading && alerts.length === 0 ? (
          <div className="py-10 text-center text-color-white/30 text-sm animate-pulse">Synchronizing alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-10 text-center text-color-white/30 text-sm">No active alerts found.</div>
        ) : (
          alerts.map((alert, idx) => {
            const severity = getSeverityData(alert.severity);
            return (
              <div
                key={alert.id || idx}
                className={`p-5 rounded-[12px] flex flex-col gap-4 bg-color-white/5 border border-color-white/5 hover:bg-color-white/[0.08] transition-all duration-300 ${alert.status === 'NEW' ? 'border-color-purple/20 bg-color-purple/5 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : ''}`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${severity.colorClass} border ${severity.borderClass}`}>
                    <img src={severity.icon} alt="Alert" className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-white text-[14px] font-bold uppercase tracking-wider">
                        {alert.type?.replace('_', ' ')}
                      </h3>
                      <span className="text-[11px] text-color-white/30 font-medium bg-color-white/5 px-2 py-0.5 rounded-full">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-color-white/60 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* AI Insight Section */}
                {alert.aiExplanation && (
                  <div className="mt-1 p-4 rounded-[8px] bg-color-purple/10 border border-color-purple/20 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-color-purple">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 8v4l3 3"></path></svg>
                      <span className="text-[11px] font-bold uppercase tracking-widest">AI Intelligence Insight</span>
                    </div>
                    <p className="text-[12px] text-color-white/50 leading-relaxed italic">
                      "{alert.aiExplanation}"
                    </p>
                    {alert.aiProvider && (
                      <div className="flex justify-end">
                        <span className="text-[9px] text-color-purple/40 font-bold uppercase italic">Powered by {alert.aiProvider}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-color-white/5 mt-1">
                  <div className="flex gap-3">
                    {alert.status === 'NEW' && (
                      <button 
                        onClick={() => handleAlertAction(alert.id, 'read')} 
                        className="text-[11px] text-color-purple hover:underline font-bold uppercase cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    {(alert.status === 'NEW' || alert.status === 'READ') && (
                      <button 
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')} 
                        className="text-[11px] text-sky-400 hover:underline font-bold uppercase cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button 
                        onClick={() => handleAlertAction(alert.id, 'resolve')} 
                        className="text-[11px] text-color-green hover:underline font-bold uppercase cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-color-white/30 font-bold uppercase tracking-wider">{alert.status}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReportOpen(false)}
          />

          <div className="relative w-full max-w-[600px] bg-color-gray1 border border-color-white/10 rounded-[8px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-color-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-white leading-tight">AI Summary Report</h3>
                  <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Active alerts consolidation</p>
                </div>
              </div>
              <button 
                onClick={() => setReportOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white cursor-pointer"
              >
                <img src={closeIcon} alt="Close" className="w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-4">
              {reportLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-8 h-8 border-2 border-color-purple border-t-transparent rounded-full animate-spin" />
                  <span className="text-[14px] text-color-white/50">Consolidating active alerts...</span>
                </div>
              ) : reportError ? (
                <div className="bg-color-red/10 border border-color-red/20 p-4 rounded-[8px] text-[13px] text-color-red font-semibold text-center">
                  {reportError}
                </div>
              ) : reportData ? (
                <div className="space-y-4 text-left">
                  {/* Risk Level Alert */}
                  <div className={`p-4 rounded-[8px] border ${reportData.riskLevel === 'CRITICAL' ? 'bg-color-red/10 border-color-red/30 text-color-red' : reportData.riskLevel === 'WARNING' ? 'bg-color-warning/10 border-color-warning/30 text-[#EAE546]' : 'bg-color-green/10 border-color-green/30 text-color-green'}`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Consolidated Risk Level</div>
                    <div className="text-[16px] font-bold uppercase tracking-widest">{reportData.riskLevel || 'NORMAL'}</div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-[12px] font-bold text-color-purple uppercase tracking-wider mb-1">Executive Summary</h4>
                    <p className="text-[14px] text-color-white/80 leading-relaxed bg-color-gray2 border border-color-white/5 p-4 rounded-[8px]">{reportData.summary}</p>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h4 className="text-[12px] font-bold text-color-purple uppercase tracking-wider mb-1">Key Findings</h4>
                    <p className="text-[13px] text-color-white/70 leading-relaxed bg-color-gray2 border border-color-white/5 p-4 rounded-[8px] whitespace-pre-line">{reportData.keyFindings}</p>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-[12px] font-bold text-color-purple uppercase tracking-wider mb-1">Recommended Actions</h4>
                    <p className="text-[13px] text-color-white/70 leading-relaxed bg-color-gray2 border border-color-white/5 p-4 rounded-[8px] whitespace-pre-line font-medium text-color-green">{reportData.recommendedActions}</p>
                  </div>

                  {/* Disclaimer */}
                  <div className="pt-2 border-t border-color-white/5 flex flex-col gap-1">
                    <p className="text-[10px] text-color-white/30 italic leading-relaxed">{reportData.disclaimer}</p>
                    <div className="flex justify-between items-center text-[9px] text-color-white/20 mt-1 uppercase font-bold">
                      <span>Provider: {reportData.provider}</span>
                      <span>Generated: {new Date(reportData.generatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-color-white/5 flex justify-end bg-color-gray1/50">
              <button
                onClick={() => setReportOpen(false)}
                className="px-6 py-2 rounded-[8px] bg-color-purple text-white font-bold text-[13px] hover:opacity-90 transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAlerts;
