import { categoriesConditionData } from '../../constants'
import closeIcon from '../../assets/Close.svg'
import React from 'react'

function PopUp({ index, setInfo }) {
    const items = categoriesConditionData[index];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setInfo(prev => ({ ...prev, open: false }))}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-color-gray1 border border-color-white/10 rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-5 border-b border-color-white/5">
          <h3 className="text-[18px] font-bold text-white">{items?.categoryName}</h3>
          <button 
            onClick={() => setInfo(prev => ({ ...prev, open: false }))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
          >
            <img src={closeIcon} alt="Close" className="w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center p-3 bg-color-white/5 rounded-[8px] border border-color-white/5">
              <span className="text-color-white/60 font-medium">Working Devices</span>
              <span className="bg-color-green/15 text-color-green px-3 py-1 rounded-[8px] font-bold text-sm">
                {items?.working}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-color-white/5 rounded-[8px] border border-color-white/5">
              <span className="text-color-white/60 font-medium">Devices with Issues</span>
              <span className="bg-color-red/15 text-color-red px-3 py-1 rounded-[8px] font-bold text-sm">
                {items?.issues}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-color-white/5 rounded-[8px] border border-color-white/5">
              <span className="text-color-white/60 font-medium">General Status</span>
              <span className={`px-3 py-1 rounded-[8px] font-bold text-sm
                ${(items?.statusColor) == 1 ? 'bg-color-green/15 text-color-green' : (items?.statusColor) == 2 ? 'bg-color-warning/15 text-color-warning' : 'bg-color-red/15 text-color-red'}`}
              >
                {items?.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopUp
