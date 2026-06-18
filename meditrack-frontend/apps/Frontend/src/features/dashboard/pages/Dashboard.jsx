import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminRole from './AdminRole'
import BiomedRole from './BiomedRole'
import UserRole from './UserRole'
import '../../../index.css'

const Dashboard = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
  return (
    <div className=' flex flex-col gap-8 py-1 pb-3'> 
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-white tracking-tight">
          Welcome Back, {userData.username.charAt(0).toUpperCase() + userData.username.slice(1)} 🎉
        </h1>
        <p className="text-[14px] text-color-white/50">
          Overview of medical equipment status, health metrics, and active maintenance
        </p>
      </div>
        <Outlet />  
    </div>
  )
}

export default Dashboard
