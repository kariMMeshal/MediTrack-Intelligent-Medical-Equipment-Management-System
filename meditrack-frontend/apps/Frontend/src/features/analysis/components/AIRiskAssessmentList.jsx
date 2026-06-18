import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plusIcon from '../../../assets/Plus.svg';
import closeIcon from '../../../assets/Close.svg';
import conformIcon from '../../../assets/Checkmark.svg';

const AIRiskAssessmentList = ({ token }) => {
  const [assessments, setAssessments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    deviceId: "",
    device_Type: "",
    manufacturer: "GE",
    model: "",
    country: "USA",
    age: 5,
    maintenance_Cost: 1000,
    downtime: 10,
    maintenance_Frequency: 3,
    failure_Event_Count: 0,
    maintenance_Class: "Medium",
    operational_Hours_Est: 5000,
    expected_Lifespan_Est: 10,
    mtbf: 2000,
    cost_Per_Hour: 0.5,
    lifespan_Usage_Ratio: 0.5
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ai/risk-assessment?size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessments(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching risk assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('/api/medical-devices?size=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching medical devices:", err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchDevices();
  }, [token]);

  // Handle auto-calculation of lifespan usage ratio and cost per hour when fields change
  useEffect(() => {
    const age = parseFloat(formData.age) || 0;
    const expected = parseFloat(formData.expected_Lifespan_Est) || 0;
    const cost = parseFloat(formData.maintenance_Cost) || 0;
    const hours = parseFloat(formData.operational_Hours_Est) || 0;

    const ratio = expected > 0 ? Math.min(1.0, Math.max(0.0, age / expected)) : 0;
    const cph = hours > 0 ? cost / hours : 0;

    setFormData(prev => ({
      ...prev,
      lifespan_Usage_Ratio: parseFloat(ratio.toFixed(2)),
      cost_Per_Hour: parseFloat(cph.toFixed(2))
    }));
  }, [formData.age, formData.expected_Lifespan_Est, formData.maintenance_Cost, formData.operational_Hours_Est]);

  const handleDeviceChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData(prev => ({ ...prev, deviceId: "", device_Type: "", model: "" }));
      return;
    }

    const device = devices.find(d => d.id === parseInt(selectedId));
    if (device) {
      setFormData(prev => ({
        ...prev,
        deviceId: device.id,
        device_Type: device.name || "",
        model: device.model || ""
      }));
    }
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceId) {
      setError("Please select a device.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    // Prepare payload with correct numeric types
    const payload = {
      deviceId: parseInt(formData.deviceId),
      device_Type: formData.device_Type,
      manufacturer: formData.manufacturer,
      model: formData.model,
      country: formData.country,
      age: parseFloat(formData.age),
      maintenance_Cost: parseFloat(formData.maintenance_Cost),
      downtime: parseFloat(formData.downtime),
      maintenance_Frequency: parseFloat(formData.maintenance_Frequency),
      failure_Event_Count: parseInt(formData.failure_Event_Count),
      maintenance_Class: formData.maintenance_Class,
      operational_Hours_Est: parseFloat(formData.operational_Hours_Est),
      expected_Lifespan_Est: parseFloat(formData.expected_Lifespan_Est),
      mtbf: parseFloat(formData.mtbf),
      cost_Per_Hour: parseFloat(formData.cost_Per_Hour),
      lifespan_Usage_Ratio: parseFloat(formData.lifespan_Usage_Ratio)
    };

    try {
      const response = await axios.post('/api/ai/risk-assessment/general', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setSuccess(`Assessment created! Class: ${response.data.riskLabel || 'N/A'}`);
      setAddOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error("Failed to run risk assessment:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Error running risk assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (riskClass) => {
    switch (riskClass) {
      case 2: return 'text-color-red border-color-red bg-color-red/10';
      case 1: return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 0: return 'text-color-green border-color-green bg-color-green/10';
      default: return 'text-color-white/50 border-color-white/10 bg-color-white/5';
    }
  };

  const getConfidenceColor = (riskClass) => {
    switch (riskClass) {
      case 2: return 'bg-color-red';
      case 1: return 'bg-yellow-500';
      case 0: return 'bg-color-green';
      default: return 'bg-color-white/50';
    }
  };

  // Sort assessments descending (newest first)
  const sortedAssessments = Array.isArray(assessments)
    ? [...assessments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <div className="bg-color-gray1 rounded-[12px] p-6 user-card border border-color-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 className="text-[16px] font-semibold text-white">Long-term Risk Assessments</h3>
        </div>

        <button 
          onClick={() => {
            setError("");
            setSuccess("");
            setAddOpen(true);
          }}
          className="bg-color-purple text-white p-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-color-purple/20 cursor-pointer"
          title="Run New Risk Assessment"
        >
          <img src={plusIcon} alt="Add" className="w-4 h-4" />
        </button>
      </div>

      {success && (
        <div className="bg-color-green/10 border border-color-green/20 p-3 rounded-[8px] text-[12px] text-color-green font-semibold mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-color-red/10 border border-color-red/20 p-3 rounded-[8px] text-[12px] text-color-red font-semibold mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto user-card overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-color-white/10">
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Device</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Risk Level</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Confidence</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Recommendation</th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 uppercase tracking-wider text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && sortedAssessments.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-color-white/30 text-sm">Loading risk assessments...</td></tr>
            ) : sortedAssessments.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-color-white/30 text-sm">No risk assessments found.</td></tr>
            ) : (
              sortedAssessments.map((item, index) => (
                <tr key={item.assessmentId || index} className="border-b border-color-white/5 hover:bg-color-white/5 duration-100 group">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-white group-hover:text-color-purple transition-colors">{item.deviceName || `Device #${item.deviceId}`}</span>
                      <span className="text-[12px] text-color-white/40">v{item.modelVersion}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getRiskColor(item.riskClass)}`}>
                      {item.riskLabel ? item.riskLabel.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    {item.confidence !== null ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-color-white/5 rounded-full overflow-hidden max-w-[60px]">
                          <div 
                            className={`h-full rounded-full ${getConfidenceColor(item.riskClass)}`}
                            style={{ width: `${(item.confidence * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-medium text-color-white/70">{(item.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-color-white/40">N/A</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 max-w-[200px]">
                    <p className="text-[12px] text-color-white/60 truncate" title={item.recommendation}>
                      {item.recommendation}
                    </p>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-[12px] text-color-white/30">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Assessment Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[750px] max-h-[90vh] bg-color-gray1 border border-color-white/10 rounded-[8px] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-color-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-white leading-tight">Run Long-term Risk Assessment</h3>
                  <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">AI Random Forest Classification</p>
                </div>
              </div>
              <button 
                onClick={() => setAddOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white cursor-pointer"
              >
                <img src={closeIcon} alt="Close" className="w-5" />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Device Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Select Device *</label>
                  <select 
                    value={formData.deviceId}
                    onChange={handleDeviceChange}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all w-full"
                    required
                  >
                    <option value="">-- Choose Equipment --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.model})</option>
                    ))}
                  </select>
                </div>

                {/* Device Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Device Type *</label>
                  <input 
                    type="text" 
                    value={formData.device_Type}
                    onChange={e => handleFormChange('device_Type', e.target.value)}
                    placeholder="e.g. CT Scanner"
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Model */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Model *</label>
                  <input 
                    type="text" 
                    value={formData.model}
                    onChange={e => handleFormChange('model', e.target.value)}
                    placeholder="e.g. Somatom"
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Manufacturer */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Manufacturer *</label>
                  <input 
                    type="text" 
                    value={formData.manufacturer}
                    onChange={e => handleFormChange('manufacturer', e.target.value)}
                    placeholder="e.g. Siemens"
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Country *</label>
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={e => handleFormChange('country', e.target.value)}
                    placeholder="e.g. Germany"
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Age (Years) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.age}
                    min="0"
                    onChange={e => handleFormChange('age', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Maintenance Cost */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Maintenance Cost ($) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.maintenance_Cost}
                    min="0"
                    onChange={e => handleFormChange('maintenance_Cost', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Operational Hours */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Operational Hours *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.operational_Hours_Est}
                    min="0"
                    onChange={e => handleFormChange('operational_Hours_Est', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Cost Per Hour */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Cost Per Hour ($) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.cost_Per_Hour}
                    min="0"
                    onChange={e => handleFormChange('cost_Per_Hour', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white/50 focus:outline-none transition-all cursor-not-allowed bg-color-gray3"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expected Lifespan */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Expected Lifespan (Y) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.expected_Lifespan_Est}
                    min="0"
                    onChange={e => handleFormChange('expected_Lifespan_Est', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Usage Ratio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Usage Ratio (0 to 1) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.lifespan_Usage_Ratio}
                    min="0"
                    max="1"
                    onChange={e => handleFormChange('lifespan_Usage_Ratio', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white/50 focus:outline-none transition-all cursor-not-allowed bg-color-gray3"
                    disabled
                  />
                </div>

                {/* Downtime */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Downtime (Hours) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.downtime}
                    min="0"
                    onChange={e => handleFormChange('downtime', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Maintenance Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Maint. Frequency *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.maintenance_Frequency}
                    min="0"
                    onChange={e => handleFormChange('maintenance_Frequency', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Failure Count */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Failure Count *</label>
                  <input 
                    type="number" 
                    value={formData.failure_Event_Count}
                    min="0"
                    onChange={e => handleFormChange('failure_Event_Count', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>

                {/* Maintenance Class */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">Maint. Class *</label>
                  <select 
                    value={formData.maintenance_Class}
                    onChange={e => handleFormChange('maintenance_Class', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all w-full"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* MTBF */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-color-white/60 uppercase tracking-wide">MTBF (Hours) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.mtbf}
                    min="0"
                    onChange={e => handleFormChange('mtbf', e.target.value)}
                    className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-2 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-color-white/5 bg-color-gray1/50">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-5 py-2.5 rounded-[8px] text-[14px] font-bold text-color-white/40 hover:text-white hover:bg-color-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-color-purple text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg shadow-color-purple/20"
                >
                  <img src={conformIcon} alt="Check" className="w-5" />
                  {submitting ? "Analyzing..." : "Analyze Device Risk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRiskAssessmentList;
