import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaintenanceInsights = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingLog, setEditingLog] = useState(null);

  const filteredLogs = logs.filter((log) => {
    const logStatus = log.status || log.maintenanceStatus || 'PENDING';
    return statusFilter === "ALL" || logStatus.toUpperCase() === statusFilter.toUpperCase();
  });
  
  const [formData, setFormData] = useState({
    deviceId: 1,
    performedById: 1,
    issueDescription: '',
    actionTaken: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    cost: 0,
    notes: '',
    maintenanceDate: '',
    nextMaintenanceDate: ''
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = '/api/maintenance-logs?size=100&sort=createdAt,desc';
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.content || res.data || []);
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deviceId: parseInt(formData.deviceId, 10),
        performedById: parseInt(formData.performedById, 10),
        issueDescription: formData.issueDescription,
        actionTaken: formData.actionTaken,
        maintenanceStatus: formData.status, // maps correctly to backend
        priority: formData.priority,
        cost: parseFloat(formData.cost),
        notes: formData.notes,
        maintenanceDate: formData.maintenanceDate || null,
        nextMaintenanceDate: formData.nextMaintenanceDate || null
      };

      if (editingLog) {
        await axios.put(`/api/maintenance-logs/${editingLog.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/maintenance-logs', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchLogs();
    } catch (err) {
      alert("Error saving log: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditClick = (log) => {
    setEditingLog(log);
    setFormData({
      deviceId: log.deviceId,
      performedById: log.performedById || 1,
      issueDescription: log.issueDescription,
      actionTaken: log.actionTaken || '',
      status: log.status || log.maintenanceStatus || 'PENDING',
      priority: log.priority || 'MEDIUM',
      cost: log.cost || 0,
      notes: log.notes || '',
      maintenanceDate: log.maintenanceDate || '',
      nextMaintenanceDate: log.nextMaintenanceDate || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this maintenance log?")) return;

    try {
      await axios.delete(`/api/maintenance-logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) {
      alert("Error deleting log: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-color-gray1 rounded-[8px] p-6 user-card border border-color-white/10 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6 border-b border-color-white/5 pb-4">
        {/* Row 1: Title & Add Button */}
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-color-green/10 flex items-center justify-center text-color-green shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 className="text-[16px] font-semibold text-white">Maintenance Logs</h3>
          </div>
          <button 
            onClick={() => {
              setEditingLog(null);
              setFormData({
                deviceId: 1,
                performedById: 1,
                issueDescription: '',
                actionTaken: '',
                status: 'PENDING',
                priority: 'MEDIUM',
                cost: 0,
                notes: '',
                maintenanceDate: new Date().toISOString().split('T')[0],
                nextMaintenanceDate: ''
              });
              setShowModal(true);
            }}
            className="w-8 h-8 rounded-full bg-color-purple text-white flex items-center justify-center hover:opacity-90 transition-all shrink-0 shadow-lg shadow-color-purple/20 cursor-pointer"
            title="Add Maintenance Log"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        {/* Row 2: Status Dropdown Filter */}
        <div className="w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-color-gray2 border border-color-white/10 text-white px-3 py-2 rounded-[8px] text-[12px] font-bold focus:outline-none focus:border-color-purple cursor-pointer w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto user-card custom-scrollbar pr-2">
        {loading ? (
          <p className="text-center text-color-white/30 py-10 text-sm">Loading logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center text-color-white/30 py-10 text-sm">No maintenance history.</p>
        ) : (
          filteredLogs.map((log) => {
            const logStatus = log.status || log.maintenanceStatus || 'PENDING';
            return (
              <div key={log.id} className="bg-color-white/5 border border-color-white/5 rounded-[12px] p-4 hover:bg-color-white/[0.08] transition-all">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      log.priority === 'CRITICAL' ? 'bg-color-red/10 border-color-red text-color-red' : 
                      log.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 
                      'bg-sky-500/10 border-sky-500 text-sky-500'
                    }`}>
                      {log.priority}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      logStatus === 'COMPLETED' ? 'bg-color-green/10 border-color-green text-color-green' :
                      logStatus === 'CANCELLED' ? 'bg-color-white/5 border-color-white/10 text-color-white/40' :
                      logStatus === 'IN_PROGRESS' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' :
                      'bg-orange-500/10 border-orange-500 text-orange-500'
                    }`}>
                      {logStatus}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-color-white/5 pt-2 sm:border-t-0 sm:pt-0">
                    <span className="text-[11px] text-color-white/30">{log.maintenanceDate || 'No Date'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(log)}
                        className="p-1 hover:bg-color-white/5 rounded text-color-white/40 hover:text-white transition-colors cursor-pointer"
                        title="Edit Log"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(log.id)}
                        className="p-1 hover:bg-color-red/10 rounded text-color-white/40 hover:text-color-red transition-colors cursor-pointer"
                        title="Delete Log"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <h4 className="text-[14px] font-semibold text-white mb-1">Device: {log.deviceName || `ID ${log.deviceId}`}</h4>
                {log.performedByUsername && (
                  <p className="text-[11px] text-color-white/30 mb-1">Performed by: {log.performedByUsername}</p>
                )}
                <p className="text-[13px] text-color-white/60 line-clamp-2 mb-2">{log.issueDescription}</p>
                {log.actionTaken && (
                  <p className="text-[12px] text-color-white/45 bg-color-white/[0.02] border border-color-white/5 p-2 rounded mb-2 font-medium">
                    <span className="font-bold text-white text-[11px] block uppercase tracking-wider mb-0.5">Action Taken:</span>
                    {log.actionTaken}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-color-white/5">
                  <span className="text-[12px] font-bold text-white">${log.cost?.toLocaleString() || 0}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Log Modal */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${showModal ? "visible opacity-100" : "invisible opacity-0"}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
        
        {/* Modal Container */}
        <div className={`relative bg-color-gray1 border border-color-white/10 rounded-[8px] w-full max-w-xl duration-300 flex flex-col overflow-hidden
          ${showModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-color-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-color-purple/10 flex items-center justify-center text-color-purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white leading-tight">
                  {editingLog ? "Edit Maintenance Log" : "Add Maintenance Log"}
                </h3>
                <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Service Record</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[480px] custom-scrollbar">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Device ID *</label>
                  <input 
                    type="number" 
                    value={formData.deviceId} 
                    onChange={e => setFormData({...formData, deviceId: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all placeholder:text-color-white/10" 
                    placeholder="e.g. 1"
                    required 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Performed By User ID *</label>
                  <input 
                    type="number" 
                    value={formData.performedById} 
                    onChange={e => setFormData({...formData, performedById: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all placeholder:text-color-white/10" 
                    placeholder="e.g. 1"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all cursor-pointer"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Repair Cost ($)</label>
                  <input 
                    type="number" 
                    value={formData.cost} 
                    onChange={e => setFormData({...formData, cost: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all placeholder:text-color-white/10" 
                    placeholder="e.g. 500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Maintenance Date</label>
                  <input 
                    type="date" 
                    value={formData.maintenanceDate} 
                    onChange={e => setFormData({...formData, maintenanceDate: e.target.value})} 
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Next Maintenance Date</label>
                <input 
                  type="date" 
                  value={formData.nextMaintenanceDate} 
                  onChange={e => setFormData({...formData, nextMaintenanceDate: e.target.value})} 
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Issue Description *</label>
                <textarea 
                  value={formData.issueDescription} 
                  onChange={e => setFormData({...formData, issueDescription: e.target.value})} 
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10" 
                  placeholder="Describe the issue detected..."
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Action Taken</label>
                <textarea 
                  value={formData.actionTaken} 
                  onChange={e => setFormData({...formData, actionTaken: e.target.value})} 
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10" 
                  placeholder="Describe action taken..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10" 
                  placeholder="Add optional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-color-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-2.5 border border-color-white/10 rounded-[8px] text-[14px] font-bold text-color-white/60 hover:bg-color-white/5 transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-color-purple text-white rounded-[8px] text-[14px] font-bold hover:opacity-90 transition-all shadow-lg shadow-color-purple/20 cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceInsights;
