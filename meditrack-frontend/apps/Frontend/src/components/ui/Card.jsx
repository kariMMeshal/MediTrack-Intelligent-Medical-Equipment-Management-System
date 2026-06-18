import React from 'react'
import greenUpIcon from '../../assets//Green-up.svg'
import downRedIcon from '../../assets/Down-red.svg'

function Card({ title, number, status, increaseNum }) {
  return (
    <div>
        <div className='flex flex-1 border border-color-white/10 rounded-[12px] gap-3 h-full justify-between items-center px-10 py-[25px]'>
            <div className='flex flex-col gap-[1px]'>
                <p className='text-color-white/50 text-[15px]'>{title}</p>
                <h2 className='text-[30px] font-bold'>{number}</h2>
                <p className='text-color-white/50 text-[15px]'>{status? "+" : '-'}{increaseNum}% from last week</p>
            </div>
            <div className={`${status ? 'bg-color-green/10' : 'bg-color-red/10'} h-[48px] w-[48px] flex justify-center items-center rounded-[8px]`}>
                <img src={status? greenUpIcon : downRedIcon} alt="" className='w-6'/>
            </div>
        </div>
    </div>
  )
}

export default Card