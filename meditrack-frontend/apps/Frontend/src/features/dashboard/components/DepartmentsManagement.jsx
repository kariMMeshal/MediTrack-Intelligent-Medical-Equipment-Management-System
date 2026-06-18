import React, { useState, useEffect } from 'react';
import axios from 'axios';
import plusIcon from '../../../assets/Plus.svg';
import closeIcon from '../../../assets/Close.svg';
import trashIcon from '../../../assets/Trash.svg';
import conformIcon from '../../../assets/Checkmark.svg';

function DepartmentsManagement() {
  const token = localStorage.getItem("token");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/departments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch (e) {
      console.error("Failed to fetch departments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await axios.post("/api/departments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setAddOpen(false);
      setFormData({ name: "", description: "" });
      fetchDepartments();
    } catch (e) {
      console.error("Failed to create department:", e);
      alert("Failed to create department: " + (e.response?.data?.message || e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" department?`)) return;

    try {
      await axios.delete(`/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
    } catch (e) {
      console.error("Failed to delete department:", e);
      alert("Failed to delete department: " + (e.response?.data?.message || e.message));
    }
  };

  const filteredDepts = Array.isArray(departments)
    ? departments.filter(dept =>
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const colors = [
    "bg-gradient-to-bl from-indigo-600 to-indigo-700",
    "bg-gradient-to-tr from-sky-700 to-sky-600",
    "bg-gradient-to-tr from-green-500 to-green-600",
    "bg-gradient-to-tr from-amber-500 to-amber-600",
    "bg-gradient-to-tr from-pink-500 to-pink-600",
  ];

  return (
    <div className="bg-color-gray1 border border-color-white/10 rounded-[8px] p-6 pb-2 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Row 1: Title & Action Button */}
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h2 className="text-[18px] md:text-[20px] font-bold text-white tracking-tight leading-tight">System Departments</h2>
              <p className="text-[11px] md:text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">Hospital Infrastructure</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setFormData({ name: "", description: "" });
              setAddOpen(true);
            }}
            className="bg-color-purple text-white px-4 py-2 rounded-[8px] font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-color-purple/20 cursor-pointer shrink-0"
          >
            <img src={plusIcon} alt="" className="w-4" /> 
            <span className="hidden sm:inline">Add Department</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Row 2: Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-color-gray1 border border-color-white/10 rounded-[8px] pl-10 pr-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/20"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-color-white/20" 
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto user-card overflow-y-auto max-h-[400px] custom-scrollbar pr-4">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="sticky top-0 bg-color-gray1 border-b border-color-white/10">
            <tr>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                Department Name
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                Description
              </th>
              <th className="text-color-white/50 font-normal text-[13px] py-4 uppercase tracking-wider text-right pr-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-color-white/30 text-[14px]">
                  Loading departments...
                </td>
              </tr>
            ) : filteredDepts.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-color-white/30 text-[14px]">
                  No departments found.
                </td>
              </tr>
            ) : (
              filteredDepts.map((dept, index) => (
                <tr
                  key={dept.id}
                  className="border-b border-color-white/5 hover:bg-color-white/[0.02] transition-all"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${colors[index % colors.length]} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px] shadow-sm`}
                      >
                        {dept.name ? dept.name[0].toUpperCase() : "?"}
                      </div>
                      <span className="text-[17px] font-bold text-white tracking-tight leading-none">
                        {dept.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-[15px] text-color-white/50 font-medium leading-normal block max-w-lg">
                      {dept.description || "No description provided."}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      className="p-1.5 hover:bg-color-red/10 rounded-md transition-colors opacity-40 hover:opacity-100 text-color-red cursor-pointer"
                      onClick={() => handleDelete(dept.id, dept.name)}
                      title="Delete Department"
                    >
                      <img src={trashIcon} alt="Delete" className="w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Department Modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${addOpen ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        />

        {/* Modal Container */}
        <div
          className={`relative w-full max-w-[450px] bg-color-gray1 border border-color-white/10 rounded-[8px] transition-all duration-300 transform
            ${addOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-color-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-white leading-tight">New Department</h3>
                <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Hospital Infrastructure</p>
              </div>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white cursor-pointer"
              onClick={() => setAddOpen(false)}
            >
              <img src={closeIcon} alt="Close" className="w-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleAddSubmit} className="p-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Department Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all placeholder:text-color-white/10" 
                placeholder="e.g. Radiology"
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white h-28 resize-none transition-all placeholder:text-color-white/10" 
                placeholder="Describe department responsibilities..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 p-3 bg-color-purple text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg shadow-color-purple/20"
              >
                <img src={conformIcon} alt="Check" className="w-5" />
                Create Department
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DepartmentsManagement;
