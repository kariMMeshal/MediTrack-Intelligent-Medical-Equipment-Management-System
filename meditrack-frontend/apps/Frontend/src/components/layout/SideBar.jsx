/* import { useState } from 'react'; */
import { useLocation } from "react-router-dom";
import { mainPages } from "../../constants";
import { Link } from "react-router-dom";
import { recordsPages } from "../../constants";
import { settingAboutPages } from "../../constants";
import textLogo from "../../assets/Logo-Text.svg";
import menuIcon from "../../assets/Menu.svg";
import { useTheme } from "../../context/ThemeContext";
import { getHighestRole, getDashboardPath } from "../../utils/roleUtils";
import "../../index.css";

const SideBar = ({ menu, setMenu }) => {
  const displayCenter = "flex justify-center items-center";
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const pagesStyle = `relative w-full px-4 py-3 rounded-[12px] flex justify-start items-center  hover:bg-color-gray3/90 transition-all duration-200 gap-3`;

  return (
    <div className={`flex`}>
      <div
        className={`fixed z-30 sidebar-bg
      ${menu ? "lg:translate-x-0 max-lg:-translate-x-full" : "lg:-translate-x-full max-lg:translate-x-0"}
      top-0 left-0 h-[100vh] w-[310px]  border-r border-color-white/5 
      pl-5 pr-3 
      flex flex-col 
      transition-all duration-300
       overflow-y-auto`}
      >
        {/* ==== Main logo & Menu bar ==== */}
        <div className={`py-6  ${displayCenter} justify-between px-3`}>
          <a href="#" className="ml-1">
            <img src={textLogo} alt="" className="w-[125px]" />
          </a>
          <button
            className={`hover:bg-color-gray2 transition-all w-9 h-9 ${displayCenter} rounded-[12px]`}
            onClick={() => {
              setMenu(!menu);
            }}
          >
            <img src={menuIcon} alt="Menu" className="w-4" />
          </button>
        </div>

        {/* ==== Main pages & Record Pages ==== */}
        <div className="pr-2 flex flex-col gap-5 flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {mainPages.map((items) => {
                let targetUrl = items.url;
                if (items.title === 'Dashboard') {
                  const savedUser = localStorage.getItem("user");
                  if (savedUser && savedUser !== "undefined") {
                    try {
                      const userObj = JSON.parse(savedUser);
                      const highestRole = getHighestRole(userObj.roles);
                      if (highestRole === "ROLE_ADMIN") {
                        targetUrl = "dashboard/adminrole";
                      } else if (highestRole === "ROLE_USER") {
                        targetUrl = "dashboard/userrole";
                      } else {
                        targetUrl = "dashboard/biomedrole";
                      }
                    } catch (e) {
                      console.error("Failed to parse user roles in sidebar:", e);
                    }
                  }
                }
                const isActive = location.pathname.includes(targetUrl);
                return (
                  <Link key={items.key} to={targetUrl}>
                    <div
                      className={`${pagesStyle}
                      ${isActive ? "bg-color-gray2" : "bg-transparent"} `}
                    >
                      <div
                        className={`absolute h-7 w-[6px] bg-color-purple -left-[22px] rounded-e-[4px]  
                        ${isActive ? "bg-color-purple" : "bg-transparent"}  
                        `}
                      ></div>
                      <img
                        src={items.icon}
                        alt={items.title}
                        className="w-[15px]"
                      />
                      <h3 className="text-[14.5px]">{items.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="px-4 text-color-white/50 text-[14px]">Records</h2>
            <div className="flex flex-col gap-2">
              {recordsPages.map((items) => (
                <Link key={items.key} to={items.url}>
                  <div
                    className={`${pagesStyle}
                    ${location.pathname.includes(items.url) ? "bg-color-gray2" : "bg-transparent"}
                    `}
                  >
                    <div
                      className={`absolute h-7 w-[6px] bg-color-purple -left-[21px] rounded-e-[4px] 
                      ${location.pathname.includes(items.url) ? "bg-color-purple" : "bg-transparent"}  
                      `}
                    ></div>
                    <img
                      src={items.icon}
                      alt={items.title}
                      className="w-[15px]"
                    />
                    <h3 className="text-[14.5px]">{items.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ==== Dark / Light Mode Toggle ==== */}
        <div className="pr-2 my-6 flex items-end">
          <div className="w-full flex flex-col gap-2">
            {/* Divider */}
            <div className="w-full h-[1px] bg-color-white/10 mb-1" />

            {/* Toggle row */}
            <div
              className={`w-full px-4 py-3 rounded-[12px] flex justify-between items-center`}
            >
              <div className="flex items-center gap-3">
                {/* animated icon */}
                <div
                  className={`w-[34px] h-[34px] rounded-[10px] flex justify-center items-center transition-all duration-300
                  ${isDark ? "bg-color-gray2" : "bg-color-purple/20"}`}
                >
                  {isDark ? (
                    /* Moon icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8878F0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                    </svg>
                  ) : (
                    /* Sun icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8878F0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  )}
                </div>
                <h3 className="text-[14px]">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </h3>
              </div>

              {/* Toggle switch */}
              <button
                onClick={toggleTheme}
                className={`relative w-[44px] h-[24px] rounded-full transition-all duration-300 
                  ${isDark ? "bg-color-purple" : "bg-color-purple/40"}`}
              >
                <span
                  className={`absolute top-[3px] w-[18px] h-[18px] bg-color-white rounded-full shadow-md
                  transition-all duration-300 
                  ${isDark ? "left-[23px]" : "left-[3px]"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
