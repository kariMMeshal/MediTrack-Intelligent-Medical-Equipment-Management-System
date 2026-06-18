import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import closeIcon from "../../assets/Close.svg";
import userIcon from "../../assets/Profile.svg";
import settingsIcon from "../../assets/Settings.svg";
import ringIcon from "../../assets/Ring.svg";
import infoIcon from "../../assets/Info.svg";

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${
      enabled ? "bg-color-purple" : "bg-color-gray3"
    }`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
        enabled ? "left-6" : "left-1"
      }`}
    />
  </button>
);

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");

  const { isDark, toggleTheme } = useTheme();
  const [notifToggles, setNotifToggles] = useState({
    email: true,
    push: true,
    critical: false,
  });

  const userData = JSON.parse(localStorage.getItem("user")) || {
    username: "User",
    email: "user@example.com",
    id: 1,
  };

  const userRegex = /^[a-z][a-z0-9_]{3,20}$/;
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  const [formData, setFormData] = useState({
    username: userData.username || userData.name || "",
    email: userData.email || "",
    password: "",
  });

  const isValidName = userRegex.test(formData.username);
  const isValidPassword =
    formData.password === "" || passwordRegex.test(formData.password);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = userData.id || userData.userId || userData._id;

      if (!userId) {
        showToast("Error: User ID not found.", "error");
        setLoading(false);
        return;
      }

      if (!token) {
        showToast("Error: Auth token not found.", "error");
        setLoading(false);
        return;
      }

      if (!isValidName) {
        showToast("Error: Invalid username format.", "error");
        setLoading(false);
        return;
      }

      if (formData.password !== "" && !isValidPassword) {
        showToast("Error: Invalid password format.", "error");
        setLoading(false);
        return;
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password || "password123", // Using placeholder if empty
        enabled: true,
      };

      const response = await axios.put(
        `/api/users/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 204) {
        const updatedUser = { ...userData, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showToast("Profile updated successfully!", "success");
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
      const errorMsg =
        e.response?.data?.message || e.message || "Unknown error";
      const status = e.response?.status || "No Status";
      showToast(`Error (${status}): ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userData.roles && userData.roles.includes("ROLE_ADMIN");

  const tabs = [
    { id: "profile", label: "Profile", icon: userIcon },
    { id: "general", label: "General", icon: settingsIcon },
    { id: "notifications", label: "Notifications", icon: ringIcon },
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-2xl bg-color-gray1 border border-color-white/10 rounded-[8px] pointer-events-auto flex overflow-hidden relative"
              style={{ height: "520px" }}
            >
              {/* Toast Message */}
              <AnimatePresence>
                {toast.show && (
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 20, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-[8px] flex items-center gap-2 whitespace-nowrap border border-white/5 ${
                      toast.type === "success"
                        ? "bg-color-green text-color-gray1"
                        : "bg-color-red text-white"
                    }`}
                  >
                    <span className="text-[13px] font-bold">
                      {toast.message}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Left Sidebar */}
              <div className="w-56 flex-shrink-0 bg-color-gray1 border-r border-color-white/5 p-6 flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-widest text-color-white/30 mb-6 px-2">
                  Control Panel
                </p>
                <div className="flex flex-col gap-1.5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-color-purple/15 text-white"
                          : "text-color-white/40 hover:text-white hover:bg-color-white/5"
                      }`}
                    >
                      <img
                        src={tab.icon}
                        alt={tab.label}
                        className={`w-4 h-4 flex-shrink-0 transition-all ${activeTab === tab.id ? "opacity-100 brightness-200 scale-110" : "opacity-30"}`}
                      />
                      <span className="text-[13px] font-bold">
                        {tab.label}
                      </span>
                      {activeTab === tab.id && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-color-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Content Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-color-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-color-purple/10 flex items-center justify-center">
                      <img src={tabs.find(t => t.id === activeTab)?.icon} className="w-4 opacity-70 brightness-150" alt="" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-color-white capitalize">
                        {activeTab} Settings
                      </h3>
                      <p className="text-[12px] text-color-white/40 font-medium">
                        {activeTab === "profile" && "Manage your personal account details"}
                        {activeTab === "general" && "Personalize your workspace experience"}
                        {activeTab === "notifications" && "Configure system alert preferences"}
                        {activeTab === "roles" && "Configure and manage available user roles"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
                  >
                    <img src={closeIcon} alt="Close" className="w-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {/* ── Profile ── */}
                    {activeTab === "profile" && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        {/* Avatar row */}
                        <div className="flex items-center gap-4 p-4 bg-color-gray2 border border-color-white/5 rounded-[8px]">
                          <div className="w-12 h-12 rounded-full bg-color-purple/10 border border-color-purple/20 flex items-center justify-center">
                            <img
                              src={userIcon}
                              alt="User"
                              className="w-6 opacity-70"
                            />
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-white">
                              {userData.username || userData.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-color-green" />
                              <p className="text-[12px] font-bold text-color-white/40 uppercase tracking-wider">
                                {userData.role || "System Administrator"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                username: e.target.value,
                              })
                            }
                            className={`w-full bg-color-gray2 border rounded-[8px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all ${
                              formData.username === ""
                                ? "border-color-white/10"
                                : isValidName
                                  ? "border-color-green/40"
                                  : "border-color-red/40"
                            }`}
                          />
                          {!isValidName && formData.username !== "" && (
                            <div className="flex gap-3 bg-color-red/5 p-3 rounded-[8px] border border-color-red/20 mt-2">
                              <img
                                src={infoIcon}
                                alt="Info"
                                className="w-4 h-4 mt-0.5 opacity-60"
                              />
                              <ul className="text-[11px] text-color-red/80 font-medium list-disc pl-3">
                                <li>Lowercase letters only, 4-20 chars.</li>
                                <li>Numbers and underscores allowed.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="w-full bg-color-gray2 border border-color-white/10 rounded-[8px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">
                            Account Password
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            placeholder="Update password (optional)"
                            className={`w-full bg-color-gray2 border rounded-[8px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/20 ${
                              formData.password === ""
                                ? "border-color-white/10"
                                : isValidPassword
                                  ? "border-color-green/40"
                                  : "border-color-red/40"
                            }`}
                          />
                          {!isValidPassword && formData.password !== "" && (
                            <div className="flex gap-3 bg-color-red/5 p-3 rounded-[8px] border border-color-red/20 mt-2">
                              <img
                                src={infoIcon}
                                alt="Info"
                                className="w-4 h-4 mt-0.5 opacity-60"
                              />
                              <ul className="text-[11px] text-color-red/80 font-medium list-disc pl-3">
                                <li>
                                  Min 8 chars, Uppercase, Lowercase, Number.
                                </li>
                                <li>
                                  Include 1 special char (# ? ! @ $ % ^ & * -).
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* ── General ── */}
                    {activeTab === "general" && (
                      <motion.div
                        key="general"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-2"
                      >
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between py-3 border-b border-color-white/5">
                          <div>
                            <p className="text-[13px] text-color-white font-medium">
                              Dark Mode
                            </p>
                            <p className="text-[12px] text-color-white/35">
                              Switch between light and dark themes
                            </p>
                          </div>
                          <Toggle enabled={isDark} onToggle={toggleTheme} />
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-[13px] text-color-white font-medium">
                              Language
                            </p>
                            <p className="text-[12px] text-color-white/35">
                              Choose your preferred language
                            </p>
                          </div>
                          <select
                            className="bg-color-gray3 border border-color-white/10 text-[12px] text-color-white rounded-lg px-3 py-1.5 focus:outline-none transition-colors appearance-none cursor-not-allowed opacity-50"
                            disabled
                          >
                            <option value="en">English (US)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Notifications ── */}
                    {activeTab === "notifications" && (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-2"
                      >
                        {[
                          {
                            id: "email",
                            label: "Email Notifications",
                            desc: "Receive updates in your inbox",
                          },
                          {
                            id: "push",
                            label: "Push Notifications",
                            desc: "Real-time browser alerts",
                          },
                          {
                            id: "critical",
                            label: "Critical Alerts Only",
                            desc: "Only high-risk equipment issues",
                          },
                        ].map((item, i, arr) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-color-white/5" : ""}`}
                          >
                            <div>
                              <p className="text-[13px] text-color-white font-medium">
                                {item.label}
                              </p>
                              <p className="text-[12px] text-color-white/35">
                                {item.desc}
                              </p>
                            </div>
                            <Toggle
                              enabled={notifToggles[item.id]}
                              onToggle={() =>
                                setNotifToggles((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}


                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-color-white/5 flex justify-end gap-3 bg-color-gray1/50">
                    <>
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-[8px] text-[14px] font-bold text-color-white/40 hover:text-white hover:bg-color-white/5 transition-all cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-8 py-2.5 rounded-[8px] text-[14px] font-bold bg-color-purple text-white hover:opacity-90 transition-all cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {loading ? "Updating..." : "Save Changes"}
                      </button>
                    </>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default SettingsModal;
