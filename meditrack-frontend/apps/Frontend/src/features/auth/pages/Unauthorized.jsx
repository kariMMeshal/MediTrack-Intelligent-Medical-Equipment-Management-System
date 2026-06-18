import React from 'react'
import { Link } from 'react-router-dom'


function Unauthorized() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  return (
    <div className='flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 bg-black/40 z-50 p-8'>
        <div className='sm:p-14 p-9 bg-color-gray1 rounded-[12px] flex flex-col justify-center items-center gap-6'>
            <div className='flex flex-col gap-1'>
                <h2 className='text-[25px] font-semibold text-center'>Want to use <span className='text-color-purple'>MedicalEqu</span>?</h2>
                <p className='text-color-white/50 text-center'>Log in or Sign up Now!</p>
            </div>
            <div className='w-full flex flex-col gap-3'>
                <Link to="/signup">
                    <button type='submit' className='w-full h-12 max-sm:h-11 bg-color-white rounded-full text-color-gray1 font-semibold'>
                        Sign up
                    </button>
                </Link>
                <Link to="/login">
                    <button type='submit' className='w-full h-12 max-sm:h-11 bg-color-white rounded-full text-color-gray1 font-semibold'>
                        Log in
                    </button>
                </Link>
                
            </div>
        </div>
        
    </div>
  )
}

export default Unauthorized