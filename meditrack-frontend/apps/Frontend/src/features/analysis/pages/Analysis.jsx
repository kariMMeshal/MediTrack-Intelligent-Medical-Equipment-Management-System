import React from 'react';
import SystemAlerts from '../components/SystemAlerts';
import AIPredictionList from '../components/AIPredictionList';
import AIRiskAssessmentList from '../components/AIRiskAssessmentList';
import MaintenanceInsights from '../components/MaintenanceInsights';

function Analysis() {
  const token = localStorage.getItem("token");

  return (
    <div className="flex flex-col gap-8 pt-2 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-white tracking-tight">AI Analysis & Insights</h1>
        <p className="text-[14px] text-color-white/50">Global monitoring, predictive maintenance, and system alerts</p>
      </div>

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-4">
        {/* Left Column: Alerts and Predictions */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <AIPredictionList token={token} />
          <AIRiskAssessmentList token={token} />
          
          <div className=" gap-8">
            <div className="h-[500px]">
              <SystemAlerts token={token} maxHeight="350px" />
            </div>
          </div>
        </div>

        {/* Right Column: Maintenance History */}
        <div className="lg:col-span-4 h-[760px]">
          <MaintenanceInsights token={token} />
        </div>
      </div>
    </div>
  );
}

export default Analysis;



