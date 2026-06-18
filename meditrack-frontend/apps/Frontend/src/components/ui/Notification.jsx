import { useState, useEffect } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Notification = ({ notification, setNotification }) => {
  const token = localStorage.getItem("token");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/alerts?size=20&sort=createdAt,desc', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data.content || res.data || []);
    } catch (err) {
      console.error("Error fetching notification alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Polling every 15 seconds
    const interval = setInterval(() => {
      fetchAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus !== 'NEW' || !token) return;
    try {
      await axios.put(`/api/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadAlerts = alerts.filter(a => a.status === 'NEW');
    if (unreadAlerts.length === 0 || !token) return;

    try {
      await Promise.all(
        unreadAlerts.map(a => 
          axios.put(`/api/alerts/${a.id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      fetchAlerts();
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-color-red';
      case 'WARNING': return 'bg-yellow-500';
      default: return 'bg-color-green';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-[65px] right-0 w-[310px] sm:w-[400px] md:w-[450px] bg-color-gray2 border border-color-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px] z-50"
    >
      <div className='border-b border-color-white/10 p-4 flex justify-between items-center bg-color-gray3/30'>
        <h2 className='text-[17px] font-semibold text-color-white'>Notifications</h2>
        <button 
          className='text-[14px] text-color-purple hover:text-color-purple/80 transition-colors font-medium cursor-pointer'
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      
      <div className='overflow-y-auto notification-div p-2 flex flex-col gap-1 custom-scrollbar'>
        {loading && alerts.length === 0 ? (
          <div className="py-10 text-center text-color-white/40 text-[14px]">
            Synchronizing notifications...
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex py-4 px-4 gap-4 hover:bg-color-white/5 rounded-xl transition-colors cursor-pointer group relative ${alert.status === 'NEW' ? 'bg-color-purple/[0.03]' : ''}`}
              onClick={() => handleMarkAsRead(alert.id, alert.status)}
            >
              <div className='pt-1.5'>
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${alert.status === 'NEW' ? 'bg-color-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-transparent'}`}></div>
              </div>
              <div className='flex flex-col gap-1 flex-1'>
                <div className="flex justify-between items-center gap-2">
                  <h3 className={`text-[15px] leading-tight transition-colors group-hover:text-color-white ${alert.status === 'NEW' ? 'text-color-white font-semibold' : 'text-color-white/60 font-normal'}`}>
                    {alert.type?.replace('_', ' ')}
                  </h3>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getSeverityColor(alert.severity)}`} title={`Severity: ${alert.severity}`} />
                </div>
                <p className='font-normal text-color-white/50 text-[13px] leading-relaxed'>
                  {alert.message}
                </p>
                <p className='font-medium text-color-white/30 text-[11px] mt-1 italic'>
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-color-white/40 text-[14px]">
            No notifications yet
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Notification;
