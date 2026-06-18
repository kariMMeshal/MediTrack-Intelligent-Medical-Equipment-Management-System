import React, { useState, useEffect, useRef } from 'react';
import searchIcon from '../../../assets/Gray-Search.svg';
import userIcon from '../../../assets/Profile.svg';
import sendIcon from '../../../assets/Email_Send.svg';
import axios from 'axios';

const COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-sky-500",
];

function Inbox() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  // Load messages from localStorage or empty object
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatEndRef = useRef(null);

  // Fetch real users from database
  useEffect(() => {
    const fetchUsers = async () => {
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const token = localStorage.getItem("token");
      let dbUsersList = [];

      try {
        if (token) {
          const response = await axios.get("/api/users", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Array.isArray(response.data)) {
            dbUsersList = response.data;
          }
        }
      } catch (err) {
        console.warn("Error fetching users from database, will fall back to mock users:", err);
      }

      // Filter out the current user
      let finalUsers = dbUsersList.filter(u => u.username !== currentUser.username);

      // If the list is empty (no other users in database, or failed to fetch), use mock users fallback
      if (finalUsers.length === 0) {
        const mockUsers = [
          { id: 991, username: "admin", email: "admin@hospital.com", role: "Admin" },
          { id: 992, username: "biomed_tech", email: "biomed@hospital.com", role: "Biomedical Tech" },
          { id: 993, username: "dr_sarah", email: "sarah@hospital.com", role: "Doctor" },
          { id: 994, username: "nurse_john", email: "john@hospital.com", role: "Nurse" },
          { id: 995, username: "dr_roma", email: "roma@hospital.com", role: "Doctor" }
        ];
        finalUsers = mockUsers.filter(u => u.username !== currentUser.username);
      }

      const contactsMapped = finalUsers.map((u, index) => ({
        id: u.id,
        name: u.username,
        role: u.role || (u.id === 991 ? "Admin" : u.id === 992 ? "Biomedical Tech" : "Staff"),
        status: "online",
        lastMessage: "No messages yet",
        time: "",
        unread: 0,
        color: COLORS[index % COLORS.length]
      }));

      setContacts(contactsMapped);
      if (contactsMapped.length > 0) setSelectedContact(contactsMapped[0]);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact, messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const contactId = selectedContact.id.toString();
    const msgObj = {
      id: Date.now(),
      senderId: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), msgObj]
    }));

    setContacts(prev => prev.map(c => 
      c.id === selectedContact.id ? { ...c, lastMessage: newMessage, time: 'Now' } : c
    ));

    setNewMessage('');
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-color-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 pt-1">
      <div className="flex flex-col gap-1 px-2">
        <h1 className="text-[26px] font-bold text-white tracking-tight">Messaging Center</h1>
        <p className="text-[14px] text-color-white/50 font-medium">Coordinate with hospital staff and biomedical experts in real-time</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        
        {/* Sidebar */}
        <div className={`w-[360px] max-lg:w-full flex flex-col bg-color-gray1/40 backdrop-blur-md border border-color-white/10 rounded-[8px] overflow-hidden transition-all duration-300
          ${showMobileChat ? 'max-lg:hidden' : 'max-lg:flex'}`}>
          <div className="p-5 border-b border-color-white/5">
            <div className="relative">
              <img src={searchIcon} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 opacity-40" />
              <input 
                type="text" 
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-color-gray1 border border-color-white/5 rounded-[8px] py-2.5 pl-11 pr-4 text-[14px] text-white focus:border-color-purple/40 outline-none transition-all placeholder:text-color-white/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  setShowMobileChat(true);
                }}
                className={`flex items-center gap-4 p-4 rounded-[8px] transition-all duration-300 relative group
                  ${selectedContact.id === contact.id ? 'bg-color-purple/15 border border-color-purple/20' : 'hover:bg-color-white/[0.03] border border-transparent'}`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-[18px] shadow-lg shadow-black/20`}>
                    {contact.name[0]}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-color-gray1 
                    ${contact.status === 'online' ? 'bg-color-green' : 'bg-color-gray3'}`} />
                </div>
                
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-[15.5px] text-white truncate">{contact.name}</h3>
                    <span className="text-[11px] text-color-white/30 font-semibold uppercase">
                      {messages[contact.id.toString()]?.slice(-1)[0]?.time || ""}
                    </span>
                  </div>
                  <p className="text-[13px] text-color-white/40 truncate group-hover:text-color-white/60 transition-colors">
                    {messages[contact.id.toString()]?.slice(-1)[0]?.text || "No messages yet"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-color-gray1/40 backdrop-blur-md border border-color-white/10 rounded-[8px] overflow-hidden relative transition-all duration-300
          ${showMobileChat ? 'max-lg:flex' : 'max-lg:hidden'}`}>
          
          {selectedContact ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-5 px-6 lg:px-8 border-b border-color-white/10 flex items-center justify-between bg-color-white/[0.01]">
                <div className="flex items-center gap-3 lg:gap-4">
                  {/* Back Button for Mobile */}
                  <button 
                    onClick={() => setShowMobileChat(false)}
                    className="lg:hidden p-2 -ml-2 hover:bg-color-white/5 rounded-full text-color-white/50"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>

                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full ${selectedContact.color} flex items-center justify-center text-white font-bold text-[17px]`}>
                      {selectedContact.name[0]}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-color-gray1 
                      ${selectedContact.status === 'online' ? 'bg-color-green' : 'bg-color-gray3'}`} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-white leading-tight">{selectedContact.name}</h2>
                    <p className="text-[12px] text-color-white/40 font-medium">{selectedContact.role} • {selectedContact.status === 'online' ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Window */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar scroll-smooth">
                {(messages[selectedContact.id.toString()] || []).map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group relative`}>
                      <div className={`px-5 py-3 rounded-[8px] text-[14.5px]
                        ${msg.senderId === 'me' 
                          ? 'bg-color-purple text-white rounded-br-[4px]' 
                          : 'bg-color-gray2 text-color-white/90 rounded-bl-[4px] border border-color-white/5'}`}
                      >
                        {msg.text}
                      </div>
                      <div className={`mt-1 flex px-1 ${msg.senderId === 'me' ? 'text-right' : 'text-left'}`}>
                        <span className="text-[10px] text-color-white/20 font-bold uppercase">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-color-white/10">
                <form onSubmit={handleSendMessage} className="relative flex items-center bg-color-gray2/40 border border-color-white/10 rounded-[8px] p-2 pl-4 focus-within:border-color-purple/40 transition-all">
                  <input 
                    type="text" 
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2 text-[14.5px] text-white outline-none"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className={`w-11 h-11 rounded-[8px] flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-color-purple' : 'bg-color-gray3/50 opacity-50'}`}>
                    <img src={sendIcon} alt="Send" className="w-5" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
              <img src={sendIcon} alt="" className="w-16 mb-4" />
              <p className="text-[16px] font-bold">Select a contact to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Inbox;
