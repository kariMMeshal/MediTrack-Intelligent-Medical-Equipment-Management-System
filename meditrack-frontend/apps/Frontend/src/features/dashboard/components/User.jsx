import React from 'react'
import { useState, useEffect } from 'react'
import Profile from '../../../assets/Profile.svg'
import editIcon from '../../../assets/Edit.svg'
import { Link, Outlet } from 'react-router-dom';

function User({ id, deleted, email, roles, username, open, setOpen}) {
  return (
    <div key={id} className='flex gap-4 items-center justify-between bg-color-gray3/40 p-4 rounded-[8px] border border-color-white/5'>
        <div className='flex items-center gap-4 flex-1 min-w-0'>
            <div className="w-11 h-11 rounded-full bg-color-purple/20 flex items-center justify-center text-color-purple font-bold shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className='flex flex-col min-w-0'>
                <h3 className='text-[16px] font-bold text-white truncate'>{username}</h3>
                <h3 className='text-[13px] text-color-white/40 truncate'>{email}</h3>
            </div>
        </div>
        <button className='hover:bg-color-white/10 p-2 rounded-[8px] transition-all bg-color-white/5'
            onClick={() => setOpen(true)}
        >
            <img src={editIcon} alt="Edit" className='w-5 opacity-70' />
        </button>
    </div>
    
  )
}

export default User