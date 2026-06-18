import axios from 'axios';
import React, { useState } from 'react'
import trashIcon from '../../../assets/Trash.svg'
import conformIcon from '../../../assets/Checkmark.svg'
import closeIcon from '../../../assets/Close.svg'
import CreateAccount from '../../auth/components/CreateAccount';

function AddUser({addOpen, setAddOpen, userName, userRole, userEmail, userDeleted, userColor, userID}) {
    const token = localStorage.getItem("token");

    const updateRole = async () => {
      try{
        const res = await axios.put(`/api/users/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: {
            id: userID,
            username: userName,
            email: userEmail,
            roles: [`${newUserRole}`],
            deleted: userDeleted
          }
        })

      }catch (e){
      }
    } 

    const colors = ["bg-gradient-to-bl from-indigo-600 to-indigo-700", "bg-gradient-to-tr from-sky-700 to-sky-600", "bg-gradient-to-tr from-green-500 to-green-600", "bg-gradient-to-tr from-amber-500 to-amber-600", "bg-gradient-to-tr from-pink-500 to-pink-600"];
    const [ newUserRole, setNewUserRole ] = useState('');

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${addOpen ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setAddOpen(false)}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[500px] bg-color-gray1 border border-color-white/10 rounded-[8px] transition-all duration-300 transform
          ${addOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-color-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </div>
            <div>
              <h3 className="font-bold text-[20px] text-white">Create New User</h3>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Access Management</p>
            </div>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
            onClick={() => setAddOpen(false)}
          >
            <img src={closeIcon} alt="Close" className="w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <CreateAccount addOpen={addOpen} setAddOpen={setAddOpen} />
        </div>
      </div>
    </div>
  );
}

export default AddUser;
