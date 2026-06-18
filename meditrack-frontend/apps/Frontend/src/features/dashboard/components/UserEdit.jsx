import axios from 'axios';
import React, { useState, useEffect } from 'react'
import trashIcon from '../../../assets/Trash.svg'
import conformIcon from '../../../assets/Checkmark.svg'
import closeIcon from '../../../assets/Close.svg'

function UserEdit({editOpen, setEditOpen, userName, userRole, userRoles, userEmail, userDeleted, userEnabled, userColor, userID}) {

  const token = localStorage.getItem("token");
  const [ newUserRole, setNewUserRole ] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [modalUserRoles, setModalUserRoles] = useState([]);
  const [roleToAdd, setRoleToAdd] = useState("");

  useEffect(() => {
    if (editOpen) {
      setNewUserRole(userRole);
      setModalUserRoles(userRoles || []);
      setRoleToAdd("");
    }
  }, [editOpen, userRole, userRoles]);

  useEffect(() => {
    const fetchAvailableRoles = async () => {
      try {
        const res = await axios.get("/api/roles", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableRoles(res.data);
      } catch (e) {
        console.error("Failed to fetch roles in edit modal:", e);
      }
    };

    if (editOpen) {
      fetchAvailableRoles();
    }
  }, [editOpen]);

 

    const handleToggleStatus = async () => {
      const action = userEnabled ? 'deactivate' : 'activate';
      if (!window.confirm(`Are you sure you want to ${action} user ${userName}?`)) return;

      try {
        await axios.patch(`/api/users/${userID}/${action}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setEditOpen(false);
        window.location.reload();
      } catch (e) {
        console.error(`${action} Failed! Response Data:`, e.response?.data);
        alert(`Operation Failed: ${e.response?.data?.message || e.message}`);
      }
    };

    const handleDeleteUser = async () => {
      if (!window.confirm(`Are you sure you want to delete user ${userName}? This action is irreversible.`)) return;

      try {
        await axios.delete(`/api/users/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setEditOpen(false);
        window.location.reload();
      } catch (e) {
        console.error("Delete Failed! Response Data:", e.response?.data);
        alert(`Delete Failed: ${e.response?.data?.message || e.message}`);
      }
    };

    const handleRemoveRole = async (roleName) => {
      if (modalUserRoles.length <= 1) {
        alert("User must have at least one role");
        return;
      }

      const roleObj = availableRoles.find(r => r.role === roleName);
      if (!roleObj) return;

      if (!window.confirm(`Are you sure you want to remove the role ${roleName.replace("ROLE_", "")}?`)) return;

      try {
        await axios.delete(`/api/users/${userID}/roles/${roleObj.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.location.reload();
      } catch (e) {
        console.error("Failed to remove role:", e);
        alert(`Failed to remove role: ${e.response?.data?.message || e.message}`);
      }
    };

    const handleAddRole = async () => {
      if (!roleToAdd) return;
      if (modalUserRoles.includes(roleToAdd)) return;

      const roleObj = availableRoles.find(r => r.role === roleToAdd);
      if (!roleObj) return;

      try {
        await axios.post(`/api/users/${userID}/roles/${roleObj.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.location.reload();
      } catch (e) {
        console.error("Failed to add role:", e);
        alert(`Failed to add role: ${e.response?.data?.message || e.message}`);
      }
    };

    const handleClose = () => {
      setEditOpen(false);
    };

    const unassignedRoles = availableRoles.filter(r => !modalUserRoles.includes(r.role));

    const colors = ["bg-gradient-to-bl from-indigo-600 to-indigo-700", "bg-gradient-to-tr from-sky-700 to-sky-600", "bg-gradient-to-tr from-green-500 to-green-600", "bg-gradient-to-tr from-amber-500 to-amber-600", "bg-gradient-to-tr from-pink-500 to-pink-600"];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${editOpen ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-[450px] bg-color-gray1 border border-color-white/10 rounded-[8px] transition-all duration-300 transform
          ${editOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-color-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
            <div>
              <h3 className="font-bold text-[18px] text-white leading-tight">Edit User Access</h3>
              <p className="text-[12px] text-color-white/40 font-semibold uppercase tracking-wider">Modify Permissions</p>
            </div>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
            onClick={handleClose}
          >
            <img src={closeIcon} alt="Close" className="w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className={`${colors[userColor]} w-20 h-20 rounded-full flex justify-center items-center text-white font-bold text-2xl border-4 border-color-white/5 shadow-xl`}>
              {userName ? userName[0].toUpperCase() : "?"}
            </div>
            <div className="text-center">
              <h2 className="text-[20px] font-bold text-white tracking-tight">{userName}</h2>
              <p className="text-[14px] text-color-white/40 font-medium">{userEmail}</p>
            </div>
          </div>

          <div className="w-full bg-color-gray2/40 border border-color-white/5 rounded-[8px] p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 px-2">
              <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-widest">Access Roles</label>
              
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {modalUserRoles.map((roleName) => (
                  <div
                    key={roleName}
                    className={`px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                      roleName === "ROLE_ADMIN"
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                        : roleName === "ROLE_USER"
                          ? "bg-sky-500/10 border-sky-500 text-sky-400"
                          : "bg-color-pink/10 border-color-pink text-color-pink"
                    }`}
                  >
                    <span>
                      {roleName === "ROLE_ADMIN"
                        ? "Admin"
                        : roleName === "ROLE_USER"
                          ? "User"
                          : "Biomedical"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(roleName)}
                      className="hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      title="Remove Role"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {unassignedRoles.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={roleToAdd}
                    onChange={(e) => setRoleToAdd(e.target.value)}
                    className="flex-1 bg-color-gray1 border border-color-white/10 text-white p-2 rounded-[8px] text-[13px] font-bold focus:outline-none focus:border-color-purple transition-all outline-none cursor-pointer"
                  >
                    <option value="">Select role to add...</option>
                    {unassignedRoles.map((r) => {
                      const cleanName = r.role.replace("ROLE_", "");
                      const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
                      return (
                        <option key={r.id} value={r.role}>
                          {displayName}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="bg-color-purple text-white px-4 py-2 rounded-[8px] font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-2 pt-4 border-t border-color-white/5">
              <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-widest">Status</label>
              {userDeleted ? (
                <span className="px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider border bg-color-red/10 border-color-red text-color-red">
                  Deleted
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5
                    ${userEnabled
                      ? 'bg-color-green/10 border border-color-green text-color-green hover:bg-color-green/20'
                      : 'bg-orange-500/10 border border-orange-500 text-orange-400 hover:bg-orange-500/20'
                    }`}
                >
                  {userEnabled ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </div>

          <div className="w-full">
            <button 
              onClick={handleDeleteUser}
              className="w-full p-3 bg-color-red/10 border border-color-red/20 text-color-red rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:bg-color-red hover:text-white active:scale-95 cursor-pointer"
            >
              <img src={trashIcon} alt="Trash" className="w-5" />
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserEdit
