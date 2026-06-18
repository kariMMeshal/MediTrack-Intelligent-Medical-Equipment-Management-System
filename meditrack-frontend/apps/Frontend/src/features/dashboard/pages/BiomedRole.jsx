import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../../components/ui/Card";
import { adminRoleCards } from "../../../constants";

function BiomedRole() {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  const [devices, setDevices] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Filters
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");
  const [devStatusFilter, setDevStatusFilter] = useState("ALL");
  const [devSearchQuery, setDevSearchQuery] = useState("");

  // Modal State for updating logs
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logFormData, setLogFormData] = useState({
    status: "PENDING",
    actionTaken: "",
    cost: 0,
    notes: "",
    nextMaintenanceDate: "",
  });

  const fetchData = async () => {
    try {
      setLoadingDevices(true);
      const devRes = await axios.get("/api/medical-devices?size=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devRes.data.content || devRes.data || []);
    } catch (err) {
      console.error("Error fetching devices:", err);
    } finally {
      setLoadingDevices(false);
    }

    try {
      setLoadingLogs(true);
      const logRes = await axios.get("/api/maintenance-logs?size=1000&sort=createdAt,desc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(logRes.data.content || logRes.data || []);
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);



  // Filters logic
  const filteredLogs = logs.filter((log) => {
    const logStatus = log.maintenanceStatus || log.status || "PENDING";
    return logStatusFilter === "ALL" || logStatus.toUpperCase() === logStatusFilter.toUpperCase();
  });

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
      device.model?.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
      device.serialNumber?.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
      device.assetTag?.toLowerCase().includes(devSearchQuery.toLowerCase());

    const matchesStatus =
      devStatusFilter === "ALL" ||
      device.status?.toUpperCase() === devStatusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Open log update modal
  const handleOpenLogModal = (log) => {
    setSelectedLog(log);
    const logStatus = log.maintenanceStatus || log.status || "PENDING";
    setLogFormData({
      status: logStatus,
      actionTaken: log.actionTaken || "",
      cost: log.cost || 0,
      notes: log.notes || "",
      nextMaintenanceDate: log.nextMaintenanceDate || "",
    });
    setShowLogModal(true);
  };

  // Submit log updates (PUT)
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLog) return;

    try {
      setSubmittingLog(true);
      const payload = {
        deviceId: selectedLog.deviceId,
        performedById: currentUser.id || 1, // Set to current logged in user
        issueDescription: selectedLog.issueDescription,
        maintenanceStatus: logFormData.status,
        priority: selectedLog.priority,
        actionTaken: logFormData.actionTaken,
        cost: parseFloat(logFormData.cost) || 0,
        notes: logFormData.notes,
        maintenanceDate: selectedLog.maintenanceDate || new Date().toISOString().split("T")[0],
        nextMaintenanceDate: logFormData.nextMaintenanceDate || null,
      };

      await axios.put(`/api/maintenance-logs/${selectedLog.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Automatically update the device status based on completed/in-progress maintenance
      try {
        let newDeviceStatus = null;
        if (logFormData.status === "COMPLETED") {
          newDeviceStatus = "ACTIVE";
        } else if (logFormData.status === "IN_PROGRESS") {
          newDeviceStatus = "MAINTENANCE";
        }

        if (newDeviceStatus) {
          // Fetch full device payload first
          const devRes = await axios.get(`/api/medical-devices/${selectedLog.deviceId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const devicePayload = devRes.data;

          await axios.put(
            `/api/medical-devices/${selectedLog.deviceId}`,
            {
              ...devicePayload,
              status: newDeviceStatus,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      } catch (devErr) {
        console.warn("Failed to update corresponding device status:", devErr);
      }

      setShowLogModal(false);
      fetchData();
    } catch (err) {
      alert("Error updating record: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingLog(false);
    }
  };

  // Toggle/Update Device status directly
  const handleDeviceStatusChange = async (device, newStatus) => {
    try {
      const payload = {
        ...device,
        status: newStatus,
      };
      await axios.put(`/api/medical-devices/${device.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Error updating device status: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {adminRoleCards.map((items, index) => (
          <Card
            key={index}
            title={items.title}
            number={items.number}
            status={items.status}
            increaseNum={items.increaseNum}
          />
        ))}
      </div>

      {/* Main Grid: Maintenance Orders & Device Directory */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Maintenance Tickets */}
        <div className="bg-color-gray1 border border-color-white/10 rounded-[12px] p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-white tracking-tight">Service Tickets</h2>
              <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">Active Work Orders</p>
            </div>
            
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="bg-color-gray2 border border-color-white/10 text-white px-3 py-2 rounded-[8px] text-[12px] font-bold focus:outline-none focus:border-color-purple cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Logs scroll area */}
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-2 flex flex-col gap-4">
            {loadingLogs ? (
              <p className="text-center text-color-white/30 py-10 text-sm">Loading logs...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center text-color-white/30 py-10 text-sm">No maintenance orders found.</p>
            ) : (
              filteredLogs.map((log) => {
                const logStatus = log.maintenanceStatus || log.status || "PENDING";
                return (
                  <div
                    key={log.id}
                    className="bg-color-white/5 border border-color-white/5 rounded-[12px] p-5 flex flex-col gap-4 hover:bg-color-white/[0.08] transition-all"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            log.priority === "CRITICAL"
                              ? "bg-color-red/10 border-color-red text-color-red"
                              : log.priority === "HIGH"
                                ? "bg-orange-500/10 border-orange-500 text-orange-500"
                                : "bg-sky-500/10 border-sky-500 text-sky-500"
                          }`}
                        >
                          {log.priority}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            logStatus === "COMPLETED"
                              ? "bg-color-green/10 border-color-green text-color-green"
                              : logStatus === "CANCELLED"
                                ? "bg-color-white/5 border-color-white/10 text-color-white/40"
                                : logStatus === "IN_PROGRESS"
                                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                                  : "bg-orange-500/10 border-orange-500 text-orange-500"
                          }`}
                        >
                          {logStatus}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenLogModal(log)}
                        className="bg-color-purple text-white px-3 py-1 rounded-[6px] text-[11px] font-bold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-md shadow-color-purple/15"
                      >
                        Update Order
                      </button>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-bold text-white">Device: {log.deviceName || `ID ${log.deviceId}`}</h4>
                      {log.performedByUsername && (
                        <p className="text-[11px] text-color-white/30 mt-0.5">Assigned to: {log.performedByUsername}</p>
                      )}
                      <p className="text-[13px] text-color-white/60 mt-2 font-medium">{log.issueDescription}</p>
                    </div>

                    {log.actionTaken && (
                      <div className="bg-color-white/[0.02] border border-color-white/5 p-3 rounded-[8px]">
                        <span className="text-[10px] font-bold text-white block uppercase tracking-wider mb-1">Actions Performed:</span>
                        <p className="text-[12.5px] text-color-white/50">{log.actionTaken}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-color-white/5 text-[12px]">
                      <span className="font-bold text-white">${log.cost?.toLocaleString() || 0}</span>
                      <span className="text-color-white/30">{log.maintenanceDate || "No date logged"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Device Status Directory */}
        <div className="bg-color-gray1 border border-color-white/10 rounded-[12px] p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-white tracking-tight">Device Status Control</h2>
              <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">Active Inventory</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={devSearchQuery}
                onChange={(e) => setDevSearchQuery(e.target.value)}
                className="w-full sm:w-40 bg-color-gray2 border border-color-white/10 rounded-[8px] px-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-color-purple transition-all"
              />
              <select
                value={devStatusFilter}
                onChange={(e) => setDevStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-color-gray2 border border-color-white/10 text-white px-3 py-1.5 rounded-[8px] text-[12px] font-bold focus:outline-none focus:border-color-purple cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
              </select>
            </div>
          </div>

          {/* Devices scroll list */}
          <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-2 flex flex-col gap-3">
            {loadingDevices ? (
              <p className="text-center text-color-white/30 py-10 text-sm">Loading devices...</p>
            ) : filteredDevices.length === 0 ? (
              <p className="text-center text-color-white/30 py-10 text-sm">No devices found.</p>
            ) : (
              filteredDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="bg-color-white/[0.03] border border-color-white/5 rounded-[10px] p-4 flex items-center justify-between hover:bg-color-white/[0.05] transition-all gap-4"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13.5px] font-bold text-white truncate leading-tight">{dev.name}</span>
                    <span className="text-[11px] text-color-white/35 mt-0.5 truncate">{dev.model} • SN: {dev.serialNumber}</span>
                  </div>

                  <select
                    value={dev.status}
                    onChange={(e) => handleDeviceStatusChange(dev, e.target.value)}
                    className={`bg-color-gray2 border rounded-[6px] px-2.5 py-1 text-[11px] font-bold cursor-pointer outline-none focus:border-color-purple ${
                      dev.status?.toUpperCase() === "ACTIVE"
                        ? "border-green-500/30 text-green-450"
                        : dev.status?.toUpperCase() === "MAINTENANCE"
                          ? "border-yellow-500/30 text-yellow-400"
                          : "border-red-500/30 text-red-400"
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Update Log Status Modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
          showLogModal ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogModal(false)}></div>

        <div
          className={`relative bg-color-gray1 border border-color-white/10 rounded-[12px] w-full max-w-lg duration-300 flex flex-col overflow-hidden ${
            showLogModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-color-white/5">
            <div>
              <h3 className="text-[18px] font-bold text-white">Update Maintenance Record</h3>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">
                Order Ref: #{selectedLog?.id}
              </p>
            </div>
            <button
              onClick={() => setShowLogModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Service Status</label>
              <select
                value={logFormData.status}
                onChange={(e) => setLogFormData({ ...logFormData, status: e.target.value })}
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Repair Cost ($)</label>
                <input
                  type="number"
                  value={logFormData.cost}
                  onChange={(e) => setLogFormData({ ...logFormData, cost: e.target.value })}
                  placeholder="0.00"
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Next Maintenance Date</label>
                <input
                  type="date"
                  value={logFormData.nextMaintenanceDate}
                  onChange={(e) => setLogFormData({ ...logFormData, nextMaintenanceDate: e.target.value })}
                  className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Actions Taken / Repairs Performed</label>
              <textarea
                value={logFormData.actionTaken}
                onChange={(e) => setLogFormData({ ...logFormData, actionTaken: e.target.value })}
                placeholder="Describe parts replaced, calibrations performed, or service resolution..."
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Technician Notes</label>
              <textarea
                value={logFormData.notes}
                onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                placeholder="Add secondary comments or observations..."
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-color-white/5">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-6 py-2.5 border border-color-white/10 rounded-[8px] text-[14px] font-bold text-color-white/60 hover:bg-color-white/5 transition-all cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submittingLog}
                className="px-8 py-2.5 bg-color-purple text-white rounded-[8px] text-[14px] font-bold hover:opacity-90 transition-all shadow-lg shadow-color-purple/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingLog ? "Saving..." : "Commit Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BiomedRole;