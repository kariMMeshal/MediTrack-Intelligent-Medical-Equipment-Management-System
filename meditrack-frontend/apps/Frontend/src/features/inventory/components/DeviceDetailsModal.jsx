import React, { useState, useEffect } from "react";
import axios from "axios";

function DeviceDetailsModal({ deviceId, token, onClose, onGetPrediction }) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/medical-devices/${deviceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDevice(res.data);
      } catch (err) {
        console.error("Error fetching device details:", err);
        setError("Failed to load device details.");
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) {
      fetchDeviceDetails();
    }
  }, [deviceId, token]);

  const handleDeleteDevice = async () => {
    if (!window.confirm(`Are you sure you want to delete ${device?.name || "this device"}? This action is irreversible.`)) return;

    try {
      await axios.delete(`/api/medical-devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete device:", err);
      alert(`Delete Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (!deviceId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative bg-color-gray1 border border-color-white/10 rounded-[8px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-color-white/5">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white">
              Device Specifications
            </h2>
            <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">
              Technical & Operational Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-color-gray1/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-color-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="text-color-white/60 animate-pulse font-medium">
                Fetching details...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-color-red/10 border border-color-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-color-red text-2xl font-bold">!</span>
              </div>
              <p className="text-color-red font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-color-gray2 rounded-[8px] text-sm hover:bg-color-white/5 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            device && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Section */}
                <div className="flex flex-col gap-4">
                  <SectionTitle title="General Information" />
                  <div className="bg-color-gray2/40 border border-color-white/5 rounded-[8px] p-4 flex flex-col gap-4">
                    <InfoItem label="Device Name" value={device.name} />
                    <InfoItem label="Model" value={device.model} />
                    <InfoItem
                      label="Manufacturer"
                      value={device.manufacturer}
                    />
                    <InfoItem
                      label="Serial Number"
                      value={device.serialNumber}
                    />
                    <InfoItem label="Asset Tag" value={device.assetTag} />
                  </div>
                </div>

                {/* Status & Location Section */}
                <div className="flex flex-col gap-4">
                  <SectionTitle title="Status & Location" />
                  <div className="bg-color-gray2/40 border border-color-white/5 rounded-[8px] p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-color-white/30 uppercase tracking-tight">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-[8px] text-[12px] font-bold border ${
                          device.status?.toUpperCase() === "ACTIVE"
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : device.status?.toUpperCase() === "PASSIVE"
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : device.status?.toUpperCase() === "MAINTENANCE"
                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                : device.status?.toUpperCase() === "OUT_OF_SERVICE"
                                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                  : "bg-color-purple/10 border-color-purple text-color-purple"
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>
                    <InfoItem
                      label="Condition"
                      value={device.conditionDescription}
                    />
                    <InfoItem
                      label="Department ID"
                      value={device.departmentId}
                    />
                    <InfoItem label="Location" value={device.location} />
                    <InfoItem label="Supplier" value={device.supplier} />
                  </div>
                </div>

                {/* Financial & Maintenance Section */}
                <div className="flex flex-col gap-4 md:col-span-2">
                  <SectionTitle title="Financial & Maintenance" />
                  <div className="bg-color-gray2/40 border border-color-white/5 rounded-[8px] p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                    <InfoItem
                      label="Purchase Price"
                      value={`$${device.purchasePrice?.toLocaleString()}`}
                      highlight
                    />
                    <InfoItem
                      label="Purchase Date"
                      value={device.purchaseDate}
                    />
                    <InfoItem
                      label="Warranty Expiry"
                      value={device.warrantyExpiryDate}
                    />
                    <InfoItem
                      label="Last Maintenance"
                      value={device.lastMaintenanceDate}
                    />
                    <InfoItem
                      label="Next Maintenance"
                      value={device.nextMaintenanceDate}
                      color="text-color-warning"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && (
          <div className="p-6 bg-color-gray1 border-t border-color-white/5 flex justify-end gap-3">
            <button
              onClick={handleDeleteDevice}
              className="px-6 py-3 bg-color-red/10 border border-color-red/25 text-color-red rounded-[8px] font-bold text-sm hover:bg-color-red hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete Device
            </button>
            <button
              onClick={() => onGetPrediction(device)}
              className="px-8 py-3 bg-color-purple text-white rounded-[8px] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Get AI Prediction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-[13px] uppercase tracking-wider font-bold text-color-purple/80 px-1">
      {title}
    </h3>
  );
}

function InfoItem({ label, value, highlight, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-color-white/30 uppercase tracking-tight">
        {label}
      </span>
      <span
        className={`text-[14px] font-medium ${color || (highlight ? "text-white" : "text-color-white/80")} truncate`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default DeviceDetailsModal;
