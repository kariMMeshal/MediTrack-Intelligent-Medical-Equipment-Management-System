import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../../components/ui/Card";
import plusIcon from "../../../assets/Plus.svg";
import { adminRoleCards } from "../../../constants";
import MaintenanceInsights from "../../analysis/components/MaintenanceInsights";

function UserRole() {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    priority: "MEDIUM",
    issueDescription: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoadingDevices(true);
      // Fetch all devices (set high size limit to fetch all)
      const devRes = await axios.get("/api/medical-devices?size=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(devRes.data.content || devRes.data || []);
    } catch (err) {
      console.error("Error fetching devices:", err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Filter devices list based on search query & status selection
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.assetTag?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      device.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const handleOpenReportModal = (device) => {
    setSelectedDevice(device);
    setFormData({
      priority: "MEDIUM",
      issueDescription: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDevice) return;

    try {
      setSubmitting(true);
      const payload = {
        deviceId: selectedDevice.id,
        performedById: currentUser.id || 1,
        issueDescription: formData.issueDescription,
        maintenanceStatus: "PENDING",
        priority: formData.priority,
        notes: formData.notes,
        maintenanceDate: new Date().toISOString().split("T")[0],
        cost: 0,
      };

      await axios.post("/api/maintenance-logs", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optionally update the device status to NEEDS_MAINTENANCE so it reflects immediately
      try {
        await axios.put(
          `/api/medical-devices/${selectedDevice.id}`,
          {
            ...selectedDevice,
            status: "NEEDS_MAINTENANCE",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.warn("Failed to automatically update device status to NEEDS_MAINTENANCE:", err);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error reporting issue: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
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

      {/* Main Content Area: Device Directory & My Tickets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Devices Column (Left, col-span 2) */}
        <div className="xl:col-span-2 bg-color-gray1 border border-color-white/10 rounded-[12px] p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight">Available Equipment</h2>
                <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">Inventory Directory</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search by name, model, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-color-gray2 border border-color-white/10 rounded-[8px] pl-9 pr-4 py-2 text-[13px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/20"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-color-white/20"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-color-gray2 border border-color-white/10 text-white px-3 py-2 rounded-[8px] text-[12px] font-bold focus:outline-none focus:border-color-purple cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
              </select>
            </div>
          </div>

          {/* Devices Table Container */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
            {loadingDevices ? (
              <p className="text-center text-color-white/30 py-10 text-sm">Loading inventory...</p>
            ) : filteredDevices.length === 0 ? (
              <p className="text-center text-color-white/30 py-10 text-sm">No devices matching search criteria.</p>
            ) : (
              <table className="w-full text-left border-collapse table-auto">
                <thead className="sticky top-0 bg-color-gray1 border-b border-color-white/10 z-10">
                  <tr>
                    <th className="text-color-white/50 font-normal text-[12px] py-3 uppercase tracking-wider">Asset Tag / Name</th>
                    <th className="text-color-white/50 font-normal text-[12px] py-3 uppercase tracking-wider">Details</th>
                    <th className="text-color-white/50 font-normal text-[12px] py-3 uppercase tracking-wider">Status</th>
                    <th className="text-color-white/50 font-normal text-[12px] py-3 uppercase tracking-wider text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <tr key={device.id} className="border-b border-color-white/5 hover:bg-color-white/[0.01] transition-all">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-white leading-tight">{device.name}</span>
                          <span className="text-[11px] text-color-white/35 font-medium">{device.assetTag || "No Tag"}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] text-color-white/60">{device.model} ({device.manufacturer})</span>
                          <span className="text-[11px] text-color-white/30">SN: {device.serialNumber}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider border ${
                            device.status?.toUpperCase() === "ACTIVE"
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : device.status?.toUpperCase() === "MAINTENANCE"
                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}
                        >
                          {device.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => handleOpenReportModal(device)}
                          className="bg-color-purple/10 border border-color-purple/30 text-color-purple px-4 py-2 rounded-[6px] text-[14px] font-bold hover:bg-color-purple hover:text-white transition-all active:scale-95 cursor-pointer"
                        >
                          Report Issue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Maintenance Logs Column (Right, col-span 1) */}
        <div className="xl:col-span-1 h-[590px]">
          <MaintenanceInsights token={token} />
        </div>
      </div>

      {/* Report Issue Modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
          showModal ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
        
        <div
          className={`relative bg-color-gray1 border border-color-white/10 rounded-[12px] w-full max-w-lg duration-300 flex flex-col overflow-hidden ${
            showModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-color-white/5">
            <div>
              <h3 className="text-[18px] font-bold text-white">Report Equipment Issue</h3>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">
                Device: {selectedDevice?.name}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleReportSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white transition-all cursor-pointer"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Describe the Problem *</label>
              <textarea
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                placeholder="What seems to be malfunctioning or broken? Please list any details..."
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-24 resize-none transition-all placeholder:text-color-white/10"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-color-white/55 uppercase tracking-wider">Additional Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any specific context or location markers..."
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-2.5 outline-none focus:border-color-purple text-[14px] text-white h-20 resize-none transition-all placeholder:text-color-white/10"
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
                disabled={submitting}
                className="px-8 py-2.5 bg-color-purple text-white rounded-[8px] text-[14px] font-bold hover:opacity-90 transition-all shadow-lg shadow-color-purple/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserRole;