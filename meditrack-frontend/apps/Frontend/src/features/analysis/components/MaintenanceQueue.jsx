import React from 'react';

const MaintenanceQueue = ({ devices }) => {
  return (
    <div className="bg-color-gray1 rounded-[12px] p-6 overflow-x-auto user-card border border-color-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-color-purple/10 flex items-center justify-center text-color-purple">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        </div>
        <h3 className="text-[16px] font-semibold text-white">Maintenance Queue</h3>
      </div>

      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="border-b border-color-white/10">
            <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Device Info</th>
            <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Risk Level</th>
            <th className="text-color-white/50 font-normal text-[13px] py-4 pr-4 uppercase tracking-wider">Est. Failure</th>
            <th className="text-color-white/50 font-normal text-[13px] py-4 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr key={index} className="border-b border-color-white/5 hover:bg-color-white/5 duration-100 cursor-pointer group">
              <td className="py-4 pr-4">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-white group-hover:text-color-purple transition-colors">{device.name}</span>
                  <span className="text-[12px] text-color-white/40">{device.department} · {device.model}</span>
                </div>
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-color-white/5 rounded-full overflow-hidden max-w-[80px]">
                    <div 
                      className={`h-full rounded-full ${device.risk > 80 ? 'bg-color-red' : device.risk > 50 ? 'bg-color-warning' : 'bg-color-green'}`}
                      style={{ width: `${device.risk}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-color-white/70">{device.risk}%</span>
                </div>
              </td>
              <td className="py-4 pr-4">
                <span className={`text-[13px] font-medium ${device.risk > 80 ? 'text-color-red' : 'text-color-white/80'}`}>
                  {device.estFailure}
                </span>
              </td>
              <td className="py-4 text-right">
                <button className="px-4 py-1.5 rounded-full bg-color-purple/15 text-color-purple text-[13px] font-medium hover:bg-color-purple hover:text-white transition-all">
                  Schedule
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceQueue;

