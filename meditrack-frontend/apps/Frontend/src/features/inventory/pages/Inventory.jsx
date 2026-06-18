import React, { useState, useEffect } from "react";
import axios from "axios";
import searchIcon from "../../../assets/Gray-Search.svg";
import plusIcon from "../../../assets/Plus.svg";
import AddDevice from "../components/AddDevice";
import DeviceDetailsModal from "../components/DeviceDetailsModal";
import PredictionModal from "../components/PredictionModal";

function Inventory() {
  const token = localStorage.getItem("token");

  const [devices, setDevices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state for columns
  const [filters, setFilters] = useState({
    model: "",
    location: "",
    status: "",
    purchaseDate: "",
  });

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [predictionDevice, setPredictionDevice] = useState(null);
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

  const getDevices = async () => {
    try {
      const res = await axios.get(
        "/api/medical-devices?size=1000",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDevices(res.data.content || res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getDepartments = async () => {
    try {
      const res = await axios.get(
        "/api/departments?size=1000",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDepartments(res.data.content || res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getDevices();
    getDepartments();
  }, [token]);

  // Filtering logic
  const validDevices = Array.isArray(devices) ? devices : [];
  const validDepartments = Array.isArray(departments) ? departments : [];

  const filteredDevices = validDevices.filter((device) => {
    // Search by name
    if (
      searchQuery &&
      !device.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Filter by department tab
    if (
      activeDepartment !== "All" &&
      device.departmentId !== activeDepartment
    ) {
      return false;
    }
    // Additional filters from popup
    if (
      filters.model &&
      !device.model?.toLowerCase().includes(filters.model.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.location &&
      !device.location?.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.status && device.status?.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    if (filters.purchaseDate && device.purchaseDate !== filters.purchaseDate) {
      return false;
    }
    return true;
  });

  const getDepartmentName = (id) => {
    const dept = validDepartments.find((d) => d.id === id);
    return dept ? dept.name : "Unknown";
  };

  const handleRowClick = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setIsDetailsOpen(true);
  };

  const openPrediction = (device) => {
    setPredictionDevice(device);
    setIsPredictionOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-white tracking-tight">
          Equipment Inventory
        </h1>
        <p className="text-[14px] text-color-white/50">
          Manage and track all medical assets across various departments
        </p>
      </div>

      {/* Top Departments Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto user-card pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveDepartment("All")}
          className={`px-4 py-1.5 rounded-[8px] whitespace-nowrap text-[15px] font-medium duration-200 ${activeDepartment === "All" ? "bg-color-purple/15 text-color-purple" : "bg-color-gray1 text-color-white/60 hover:text-white"}`}
        >
          All Departments
        </button>
        {validDepartments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setActiveDepartment(dept.id)}
            className={`px-4 py-1.5 rounded-[8px] whitespace-nowrap text-[15px] font-medium duration-200 ${activeDepartment === dept.id ? "bg-color-purple/15 text-color-purple" : "bg-color-gray1 text-color-white/60 hover:text-white"}`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Controls: Search, Filter, Add Device */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-[400px]">
          <img
            src={searchIcon}
            alt="Search"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4"
          />
          <input
            type="text"
            placeholder="Search By Device Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-color-gray1 border border-color-white/10 rounded-[8px] py-3 pl-11 pr-4 text-[14px] text-white placeholder-color-white/50 focus:border-color-purple outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-5 py-3 bg-color-gray1 border border-color-white/10 rounded-[8px] flex items-center gap-2 hover:bg-color-white/5 duration-200"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 3.5H14.5M4.16667 8H11.8333M6.83333 12.5H9.16667"
                  stroke="#ECECEC"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[14px] font-medium">Filter</span>
            </button>

            {/* Filter Popup */}
            {filterOpen && (
              <div className="absolute right-0 top-14 mt-2 w-72 bg-color-gray2 border border-color-white/10 rounded-[8px] p-5 z-20 shadow-lg flex flex-col gap-4">
                <h3 className="font-semibold text-white border-b border-color-white/10 pb-2">
                  Filter Options
                </h3>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] text-color-white/70">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="bg-color-gray1 border border-color-white/10 rounded-lg p-2.5 text-[14px] w-full focus:border-color-purple outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PASSIVE">PASSIVE</option>
                    <option value="SEMI_ACTIVE">SEMI_ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] text-color-white/70">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="Enter model"
                    value={filters.model}
                    onChange={(e) =>
                      setFilters({ ...filters, model: e.target.value })
                    }
                    className="bg-color-gray1 border border-color-white/10 rounded-lg p-2.5 text-[14px] w-full focus:border-color-purple outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] text-color-white/70">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="bg-color-gray1 border border-color-white/10 rounded-lg p-2.5 text-[14px] w-full focus:border-color-purple outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] text-color-white/70">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={filters.purchaseDate}
                    onChange={(e) =>
                      setFilters({ ...filters, purchaseDate: e.target.value })
                    }
                    className="bg-color-gray1 border border-color-white/10 rounded-lg p-2.5 text-[14px] w-full focus:border-color-purple outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setFilters({
                      status: "",
                      location: "",
                      model: "",
                      purchaseDate: "",
                    });
                    setFilterOpen(false);
                  }}
                  className="mt-2 text-[14px] text-color-white/50 hover:text-white text-center py-2 bg-color-white/5 rounded-lg duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="px-5 py-3 bg-color-purple rounded-[8px] text-white flex items-center gap-2 hover:opacity-90 duration-200 shadow-lg shadow-color-purple/20"
          >
            <img src={plusIcon} alt="Add" className="w-4" />
            <span className="text-[14px] font-medium">Add device</span>
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-color-gray1 rounded-[8px] flex-1 p-6 overflow-x-auto user-card h-[600px] custom-scrollbar border border-color-white/5 shadow-xl">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="border-b border-color-white/10">
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Name
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Model
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Department
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Location
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Start Date
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Last Maintenance
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                Next Maintenance
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4">
                State
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr
                key={device.id}
                onClick={() => handleRowClick(device.id)}
                className="border-b border-color-white/5 hover:bg-color-white/5 duration-100 cursor-pointer"
              >
                <td className="py-4 font-medium pr-4">{device.name}</td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {device.model}
                </td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {getDepartmentName(device.departmentId)}
                </td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {device.location}
                </td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {device.purchaseDate}
                </td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {device.lastMaintenanceDate}
                </td>
                <td className="py-4 text-color-white/80 text-[14px] pr-4">
                  {device.nextMaintenanceDate}
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[13px] font-semibold border ${
                      device.status?.toUpperCase() === "ACTIVE"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : device.status?.toUpperCase() === "PASSIVE"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : device.status?.toUpperCase() === "SEMI_ACTIVE"
                            ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                            : device.status?.toUpperCase() === "MAINTENANCE"
                              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                              : device.status?.toUpperCase() === "OUT_OF_SERVICE"
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                : "bg-color-white/10 border-color-white/20 text-color-white/80"
                    }`}
                  >
                    {device.status}
                  </span>
                </td>
                <td className="py-4 font-medium">
                  ${device.purchasePrice?.toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredDevices.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-8 text-color-white/50"
                >
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddDevice
        addOpen={addOpen}
        setAddOpen={setAddOpen}
        departments={validDepartments}
        refreshDevices={getDevices}
      />

      {isDetailsOpen && (
        <DeviceDetailsModal
          deviceId={selectedDeviceId}
          token={token}
          onClose={() => setIsDetailsOpen(false)}
          onGetPrediction={openPrediction}
        />
      )}

      {isPredictionOpen && (
        <PredictionModal
          device={predictionDevice}
          token={token}
          onClose={() => setIsPredictionOpen(false)}
        />
      )}
    </div>
  );
}

export default Inventory;
