import React, { useState } from 'react';
import axios from 'axios';
import closeIcon from '../../../assets/Close.svg';
import plusIcon from '../../../assets/Plus.svg';

function AddDevice({ addOpen, setAddOpen, departments, refreshDevices }) {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    assetTag: '',
    status: 'ACTIVE',
    conditionDescription: '',
    departmentId: '',
    location: '',
    supplier: '',
    purchasePrice: '',
    purchaseDate: '',
    warrantyExpiryDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'departmentId' || name === 'purchasePrice' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/medical-devices", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      refreshDevices();
      setAddOpen(false);
      // Reset form
      setFormData({
        name: '', model: '', manufacturer: '', serialNumber: '', assetTag: '', status: 'ACTIVE',
        conditionDescription: '', departmentId: '', location: '', supplier: '', purchasePrice: '',
        purchaseDate: '', warrantyExpiryDate: '', lastMaintenanceDate: '', nextMaintenanceDate: ''
      });
    } catch (error) {
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${addOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setAddOpen(false)}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-3xl bg-color-gray1 border border-color-white/10 rounded-[8px] transition-all duration-300 transform
        ${addOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-color-white/5'>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
              <img src={plusIcon} alt="" className="w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[20px] text-white">Add New Medical Device</h3>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Asset Inventory Management</p>
            </div>
          </div>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white" 
            onClick={() => setAddOpen(false)}
          >
            <img src={closeIcon} alt="Close" className="w-5" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-color-gray1/50">
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Device Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. MRI Scanner" />
              </div>
              
              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Model *</label>
                <input required type="text" name="model" value={formData.model} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. MAGNETOM Vida" />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Manufacturer</label>
                <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. Siemens" />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Serial Number</label>
                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. SN-MRI-001" />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Department *</label>
                <select required name="departmentId" value={formData.departmentId} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all appearance-none cursor-pointer'>
                  <option value="" disabled>Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. Room 101" />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all appearance-none cursor-pointer'>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PASSIVE">PASSIVE</option>
                  <option value="SEMI_ACTIVE">SEMI_ACTIVE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Purchase Price</label>
                <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' placeholder="e.g. 1500000" />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Purchase Date</label>
                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Next Maintenance</label>
                <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white transition-all' />
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-[13px] font-bold text-color-white/60 uppercase tracking-wide'>Condition Description</label>
              <textarea name="conditionDescription" value={formData.conditionDescription} onChange={handleChange} rows="3" className='bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 outline-none focus:border-color-purple text-[14px] text-white resize-none transition-all' placeholder="e.g. Brand new, fully calibrated."></textarea>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t border-color-white/5'>
              <button type="button" onClick={() => setAddOpen(false)} className='px-8 py-3 border border-color-white/10 rounded-[8px] text-[14px] font-bold text-color-white/60 hover:bg-color-white/5 hover:text-white transition-all'>Cancel</button>
              <button type="submit" className='px-8 py-3 bg-color-purple text-white rounded-[8px] text-[14px] font-bold hover:opacity-90 transition-all'>Add Device</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddDevice;
