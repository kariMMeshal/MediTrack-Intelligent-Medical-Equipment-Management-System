import whiteLogo from '../../assets/White-Logo.svg'
import React from 'react'

function AuthLayout() {
  return (
    <div className='fixed top-0 right-0 left-0 bg-color-gray1'>
        <div className='m-5 mx-8  flex gap-2'>
            <img src={whiteLogo} alt="MedicalEqu Logo" className='w-5' />
            <h2 className='text-[17px] font-semibold'>MedicalEqu</h2>
        </div>
    </div>
  )
}

export default AuthLayout
