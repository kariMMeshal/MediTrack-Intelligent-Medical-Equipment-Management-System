import { useState } from "react";
import { Outlet } from "react-router-dom";
import Dashboard from "../../features/dashboard/pages/Dashboard";
import SideBar from "./SideBar";
import Header from "./Header";
import PopUp from "../ui/PopUp";
import ChatBot from "../../features/chatbot/pages/ChatBot";
import Reports from "../../features/reports/pages/Reports";
import Inventory from "../../features/inventory/pages/Inventory";

import "../../index.css";

function MainDashboard() {
  const [menu, setMenu] = useState(true);
  const [info, setInfo] = useState({
    open: false,
    index: null,
  });
  const [notification, setNotification] = useState(false);

  let userData = {};
  try {
    userData = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    localStorage.removeItem("user");
  }

  return (
    <div>
      <div
        className={`w-full fixed top-0 bottom-0 right-0 left-0 lg:hidden ${info.open ? "bg-black/50" : "hidden"} `}
        onClick={() => {
          setInfo((prev) => ({
            ...prev,
            open: false,
          }));
        }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <PopUp index={info.index} info={info} setInfo={setInfo} />
        </div>
      </div>
      <div className="flex h-screen">
        <SideBar menu={menu} setMenu={setMenu} />
        <div
          className={`w-full fixed top-0 bottom-0 right-0 left-0  lg:hidden ${!menu ? "backdrop-blur-[4px] opacity-100" : "opacity-0 pointer-events-none"} z-20 duration-500  `}
          onClick={() => {
            setMenu(!menu);
          }}
        ></div>

        <div
          className={`relative w-full h-full px-[20px] ${menu ? "lg:pl-[330px]" : ""} pt-[80px]`}
        >
          <Header
            menu={menu}
            setMenu={setMenu}
            notification={notification}
            setNotification={setNotification}
          />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
