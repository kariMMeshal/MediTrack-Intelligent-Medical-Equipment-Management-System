import React from 'react'
import {useState, useEffect} from 'react'
import Notification from '../ui/Notification'
import whiteSearchIcon from '../../assets/White-Search.svg'
import ringIcon from '../../assets/Ring.svg'
import userIcon from '../../assets/Profile.svg'
import settingsIcon from '../../assets/Settings.svg'
import closeIcon from '../../assets/Close.svg'
import menuIcon from '../../assets/Menu.svg'
import { motion, AnimatePresence } from 'framer-motion'
import SettingsModal from '../ui/SettingsModal'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../index.css'

const Header = ({ menu, setMenu, notification, setNotification }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const userData = JSON.parse(localStorage.getItem("user")) || { 
        name: 'User', 
        email: 'user@example.com' 
    };

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get('/api/alerts?size=50', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const alerts = res.data.content || res.data || [];
                const count = alerts.filter(a => a.status === 'NEW').length;
                setUnreadCount(count);
            } catch (err) {
                console.error("Failed to fetch unread count:", err);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [notification]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            
            await axios.post("/api/auth/logout", {
                accessToken: token
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error("Logout failed:", e);
        } finally {
            localStorage.clear();
            navigate("/login");
        }
    };

    const displayCenter = 'flex justify-center items-center' 
    const bgHover = 'hover:bg-color-white/10 transition-all'
  return (
    <header  className={` fixed top-0 right-0 ${menu? "left-[310px]" : "left-0"} max-lg:left-0 p-5 inline ${displayCenter} justify-between h-[75px] mb-1 bg-color-gray1/50 backdrop-blur-2xl z-10 `}>

        {/* ==== Menu & Dashboard word div ==== */}
        <div className={`${displayCenter}  max-w-[250px] ${search? 'hidden' : 'block'}`}>
            <div className={` h-[80px] ${displayCenter} ${menu?'lg:hidden ' : 'flex'}`}>
                <button className='bg-color-gray2 w-[38px] h-[38px] p-[9px] rounded-full mr-3 hover:bg-color-gray3 transition-all '
                onClick={() => { setMenu(!menu)}}
                >
                <img src={menuIcon} alt="Menu Icon" className='w-[55px]'/>
                </button>
            </div>
            <a href="#" className={`${displayCenter} bg-color-gray2 text-[17px] w-[125px] h-[50px] font-semibold rounded-full ${bgHover} max-sm:hidden
            `}>
                <h2>Dashboard</h2>
            </a>
        </div>

        {/* ==== Search Bar div ==== */}
        <div className={`flex-1 ${displayCenter} mx-4 max-sm:hidden `}>
            <div className={`w-full max-w-[430px] bg-color-gray2 ${displayCenter} h-[53px] px-4 py-[10px] rounded-full`}>
                <div className={`flex-1 ${displayCenter} rounded-full w-full h-full border-[1px] border-color-white/40 px-4`}>
                    <input type="text" className='flex-1 h-full bg-transparent placeholder:text-[13px] placeholder:text-color-white/50 text-[14px]' placeholder='Search for anything'/>
                </div>
                <button className='bg-color-purple w-[34px] p-[10px]  rounded-full ml-3 h-full hover:bg-color-purple/70 transition-all'>
                    <img src={whiteSearchIcon} alt="Search Icon" className='w-[70px]'/>
                </button>
            </div>

            
        </div>
        
        {/* ==== Account & Notification Bar div ==== */}
        <div className={`${displayCenter} gap-3 ${search? 'hidden' : 'block'}`}>
            <button className={`bg-color-gray3 w-[43px] p-[13px]  rounded-full ml-3 h-full max-sm:block hidden ${bgHover}`} onClick={()=>(setSearch(!search))}>
                    <img src={whiteSearchIcon} alt="Search Icon" className='w-[60px]'/>
            </button>
            <div className={`${displayCenter} relative bg-color-gray2 w-[115px] h-[51px] rounded-full`}>
                <button className={` bg-color-gray3 w-[34px] h-[34px] rounded-full ${displayCenter}
                ${bgHover} relative
                `} 
                onClick={() => {
                    setNotification(!notification);
                    setUserMenu(false);
                    setIsSettingsOpen(false);
                }}
                >    
                    <img src={ringIcon} alt="Ring Icon" className='w-[17px]' />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-color-purple text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                        {unreadCount}
                      </span>
                    )}
                </button>
                <button 
                    className={`w-[34px] h-[34px] ml-4 rounded-full ${displayCenter} ${bgHover} bg-color-gray3`}
                    onClick={() => {
                        setUserMenu(!userMenu);
                        setNotification(false);
                        setIsSettingsOpen(false);
                    }}
                >
                    <img src={userIcon} alt="User Icon" className='w-[20px] opacity-80'/>
                </button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                    {userMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-[65px] right-0 w-[240px] bg-color-gray2 border border-color-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-4"
                        >
                            <div className="flex flex-col items-center gap-3 pb-4 border-b border-color-white/10">
                                <div className="w-14 h-14 rounded-full bg-color-gray3 flex items-center justify-center border border-color-white/10">
                                    <img src={userIcon} alt="User" className="w-7 opacity-90" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-[16px] text-color-white">{userData.username || userData.name}</h3>
                                    <p className="text-[13px] text-color-white/50">{userData.email}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex flex-col gap-1">
                                <button 
                                    className={`flex items-center gap-3 w-full p-3 rounded-xl ${bgHover} text-color-white/80 group`}
                                    onClick={() => {
                                        setUserMenu(false);
                                        setNotification(false);
                                        setIsSettingsOpen(true);
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-color-gray3 flex items-center justify-center group-hover:bg-color-purple/20 transition-colors">
                                        <img src={settingsIcon} alt="Settings" className="w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[14px]">Settings</span>
                                </button>
                                <button 
                                    className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-color-red/10 text-color-red/80 transition-all group`}
                                    onClick={handleLogout}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-color-red/5 flex items-center justify-center group-hover:bg-color-red/20 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                    </div>
                                    <span className="text-[14px]">Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                    {notification && (
                        <Notification notification={notification} setNotification={setNotification} />
                    )}
                </AnimatePresence>
                <SettingsModal 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)} 
                />
            </div>
        </div>

        {/* ==== Hidden Search Bar div ==== */}
        <div className={`fixed top-0 right-0 left-0 m-4 flex-1 ${displayCenter} ${search? 'block' : 'hidden'} z-10`}>
            <div className={`w-full max-w-[430px] bg-color-gray2 ${displayCenter} h-[55px] px-4 py-[10px] rounded-full`}>
                <div className={`flex-1 ${displayCenter} rounded-full w-full h-full border-[1px] border-color-white/40 px-4`}>
                    <input type="text" className='flex-1 h-full bg-transparent placeholder:text-[12.5px] placeholder:text-color-white/50 text-[12.5px]' placeholder='Search for anything'/>
                </div>
                <button className={`bg-color-purple w-[34px] p-[10px]  rounded-full ml-3 h-full hover:bg-color-purple/70 transition-all`}>
                    <img src={whiteSearchIcon} alt="Search Icon" className='w-[70px]'/>
                </button>
            </div>
            <button className={`w-[40px] h-[40px] bg-color-gray2 rounded-full ${displayCenter} ml-3 ${bgHover}`}onClick={()=>(setSearch(!search))}>
                <img src={closeIcon} alt="" className='w-5' />
            </button>
        </div>
    </header>
  )
}

export default Header
