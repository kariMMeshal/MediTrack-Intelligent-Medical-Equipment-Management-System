import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import { adminRoleCards } from "../../../constants";
import axios from "axios";
import User from "../components/User";
import UserEdit from "../components/UserEdit";
import editIcon from "../../../assets/Edit.svg";
import AddUser from "../components/AddUser";
import plusIcon from "../../../assets/Plus.svg";
import { adminAlerts } from "../../../constants";
import alertWarningIcon from "../../../assets/Error-Warning.svg";
import alertRedIcon from "../../../assets/Error-Red.svg";
import alertGreenIcon from "../../../assets/Error-Green.svg";
import LineGraph from "../../../components/ui/LineGraph";
import SystemAlerts from "../../analysis/components/SystemAlerts";
import { getHighestRole } from "../../../utils/roleUtils";
import DepartmentsManagement from "../components/DepartmentsManagement";
import RolesManagement from "../components/RolesManagement";

function AdminRole() {
  const token = localStorage.getItem("token");

  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const result = await axios.get("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAllUsers(result.data);
      } catch (e) {
      }
    };

    getAllUsers();
  }, [token]);

  const filteredUsers = Array.isArray(allUsers) 
    ? allUsers.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const [userRole, setUserRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userDeleted, setUserDeleted] = useState("");
  const [userEnabled, setUserEnabled] = useState(false);
  const [userColor, setUserColor] = useState();
  const [userID, setUserID] = useState();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const colors = [
    "bg-gradient-to-bl from-indigo-600 to-indigo-700",
    "bg-gradient-to-tr from-sky-700 to-sky-600",
    "bg-gradient-to-tr from-green-500 to-green-600",
    "bg-gradient-to-tr from-amber-500 to-amber-600",
    "bg-gradient-to-tr from-pink-500 to-pink-600",
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/*  ==== Stats Grid ====  */}
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

      {/*  ==== Users Management Section ====  */}
      <div className="bg-color-gray1 border border-color-white/10 rounded-[8px] p-6 pb-2 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight">System Users</h2>
              <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">Access Control</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name or email..."
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

            <button 
              onClick={() => {
                setUserName("");
                setUserEmail("");
                setUserRole("");
                setAddOpen(true);
              }}
              className="w-full sm:w-auto bg-color-purple text-white px-5 py-2.5 rounded-[8px] font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-color-purple/20"
            >
              <img src={plusIcon} alt="" className="w-4" /> 
              <span>Add New User</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto user-card overflow-y-auto max-h-[500px] custom-scrollbar pr-4">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-color-gray1  border-b border-color-white/10">
              <tr>
                <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                  User Identity
                </th>
                <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-color-white/50 font-normal text-[13px] py-4 uppercase tracking-wider text-right pr-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((items, index) => (
                  <tr
                    key={items.id}
                    className="border-b border-color-white/5 hover:bg-color-white/[0.02] transition-all"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`${colors[index % colors.length]} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[16px] shadow-sm`}
                        >
                          {items.username
                            ? items.username[0].toUpperCase()
                            : "?"}
                        </div>
                        <span className="text-[17px] font-bold text-white tracking-tight leading-none">
                          {items.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="text-[16px] text-color-white/40 font-medium leading-none">
                        {items.email}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {items.roles && Array.from(items.roles).map((role) => (
                          <span
                            key={role}
                            className={`px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider border ${
                              role === "ROLE_ADMIN"
                                ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                                : role === "ROLE_USER"
                                  ? "bg-sky-500/10 border-sky-500 text-sky-400"
                                  : "bg-color-pink/10 border-color-pink text-color-pink"
                            }`}
                          >
                            {role === "ROLE_ADMIN"
                              ? "Admin"
                              : role === "ROLE_USER"
                                ? "User"
                                : "Biomedical"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-wider border ${
                          items.deleted
                            ? "bg-color-red/10 border-color-red text-color-red"
                            : items.enabled
                              ? "bg-color-green/10 border-color-green text-color-green"
                              : "bg-orange-500/10 border-orange-500 text-orange-500"
                        }`}
                      >
                        {items.deleted
                          ? "Deleted"
                          : items.enabled
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        className="p-1.5 hover:bg-color-white/5 rounded-md transition-colors opacity-40 hover:opacity-100"
                        onClick={() => {
                          setEditOpen(true);
                          setUserName(items.username);
                          setUserDeleted(items.deleted);
                          setUserEnabled(items.enabled);
                          setUserEmail(items.email);
                          setUserRole(getHighestRole(items.roles));
                          setUserRoles(items.roles ? Array.from(items.roles) : []);
                          setUserColor(index % colors.length);
                          setUserID(items.id);
                        }}
                      >
                        <img src={editIcon} alt="Edit" className="w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <AddUser
          addOpen={addOpen}
          setAddOpen={setAddOpen}
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          userDeleted={userDeleted}
          userColor={userColor}
          userID={userID}
        />
        <UserEdit
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          userRole={userRole}
          userRoles={userRoles}
          userName={userName}
          userEmail={userEmail}
          userDeleted={userDeleted}
          userEnabled={userEnabled}
          userColor={userColor}
          userID={userID}
        />
      </div>

      {/*  ==== Departments & Roles Management Section ====  */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DepartmentsManagement />
        <RolesManagement />
      </div>

      {/*  ==== Alerts & Year View Section ====  */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Alerts Card */}
        <SystemAlerts token={token} />

        {/* Year View Graph */}
        <div className="bg-color-gray1 border border-color-white/10 rounded-[12px] p-8 user-card flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white tracking-tight">
                Performance Analytics
              </h2>
              <p className="text-[12px] text-color-white/40 uppercase tracking-widest font-semibold">
                Annual Equipment View
              </p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <LineGraph />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRole;
