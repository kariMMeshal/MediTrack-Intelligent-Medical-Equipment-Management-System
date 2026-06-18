import React, { useState, useEffect, useRef } from "react";
import sendIcon from "../../../assets/Email_Send.svg";
import closeIcon from "../../../assets/Close.svg";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function ChatBot({ username }) {
  const [req, setReq] = useState("");
  const [currentReq, setCurrentReq] = useState("");
  const [chat, setChat] = useState(() => {
    const savedChat = sessionStorage.getItem("chatbot_chat");
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [res, setRes] = useState(() => {
    const savedChat = sessionStorage.getItem("chatbot_chat");
    return (savedChat && JSON.parse(savedChat).length > 0) ? "started" : "";
  });
  const [sessionId, setSessionId] = useState(() => {
    return sessionStorage.getItem("chatbot_sessionId") || crypto.randomUUID();
  });
  const token = localStorage.getItem("token");
  const messagesRef = useRef();
  const [aiThinking, setAiThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/api/ai/chat/history?size=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryList(res.data.content || []);
    } catch (e) {
      console.error("Failed to fetch chat history:", e);
    }
  };

  const handleSelectSession = (session) => {
    setSessionId(session.sessionId);
    setChat(session.messages);
    setRes("started");
    setHistoryOpen(false);
  };

  // Group messages by sessionId, preserving order
  const sessions = [];
  const sessionMap = {};

  historyList.forEach((msg) => {
    const sId = msg.sessionId;
    if (!sessionMap[sId]) {
      sessionMap[sId] = {
        sessionId: sId,
        title: msg.userMessage,
        messages: [],
        createdAt: msg.createdAt
      };
      sessions.push(sessionMap[sId]);
    }
    sessionMap[sId].messages.push(msg);
  });

  sessions.forEach((s) => {
    s.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const AiRes = async (e) => {
    e.preventDefault();

    if (!req.trim()) return;

    setCurrentReq(req);
    setReq("");
    setAiThinking(true);

    try {
      const response = await axios.post(
        "/api/ai/chat",
        {
          sessionId: sessionId,
          message: req,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setRes(response.data);
      setChat((prevChat) => [...prevChat, response.data]);
      setAiThinking(false);
    } catch (error) {
      setAiThinking(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("chatbot_chat", JSON.stringify(chat));
    sessionStorage.setItem("chatbot_sessionId", sessionId);

    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chat, sessionId]);

  const handleNewChat = () => {
    setChat([]);
    setRes("");
    setSessionId(crypto.randomUUID());
    sessionStorage.removeItem("chatbot_chat");
    sessionStorage.removeItem("chatbot_sessionId");
  };

  return (
    <div className="relative h-[calc(100vh-100px)] w-full flex flex-col justify-between items-center pt-4">
      {/* Top Header Bar */}
      <div className="w-full max-w-[800px] px-4 flex justify-between items-center pb-2 border-b border-color-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-color-purple animate-pulse" />
          <span className="text-[14px] font-bold text-white tracking-wide">MedicalEqu AI Assistant</span>
        </div>
        <button
          onClick={() => {
            fetchHistory();
            setHistoryOpen(true);
          }}
          className="p-2 hover:bg-color-white/5 rounded-[8px] transition-all text-color-white/60 hover:text-white cursor-pointer flex items-center gap-1.5"
          title="Chat History"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
          <span className="text-[12px] font-bold">History</span>
        </button>
      </div>
      
      {/* Welcome Message or Chat Messages */}
      <div className={`w-full flex-1 flex flex-col items-center overflow-hidden ${res === "" ? "justify-center" : ""}`}>
        <div
          className={`flex flex-col justify-center items-center text-center px-4 animate-in fade-in zoom-in duration-700 ${res === "" ? "" : "hidden"}`}
        >
          <h2 className="text-[28px] lg:text-[35px] font-bold">
            Hi,{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-color-purple to-color-pink ">
              {username}
            </span>
          </h2>
          <h3 className="text-[20px] lg:text-[25px] font-medium text-color-white/60">
            What do you want to ask about?
          </h3>
        </div>

        <div
          className={`flex flex-col items-start w-full max-w-[800px] flex-1 pb-4 overflow-hidden ${res != "" ? "" : "hidden"}`}
        >
          <div
            className="w-full flex-1 p-4 lg:p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
            ref={messagesRef}
          >
            {chat.map((items, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <h3 className="bg-color-purple p-4 rounded-[8px] rounded-br-[2px] px-6 max-w-[85%] lg:max-w-[75%] font-medium text-[15px] shadow-lg">
                    {items.userMessage}
                  </h3>
                </div>
                <div>
                  <p className="text-[15px] bg-color-gray2 p-4 rounded-[8px] rounded-bl-[2px] px-6 max-w-[85%] lg:max-w-[75%] font-medium border border-color-white/5 shadow-md">
                    {items.aiResponse}
                  </p>
                </div>
              </div>
            ))}

            {aiThinking && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <h3 className="bg-color-purple p-4 rounded-[8px] rounded-br-[2px] px-6 max-w-[85%] lg:max-w-[75%] font-medium text-[15px] opacity-70">
                  {currentReq}
                </h3>
              </div>
                <div>
                  <p className="text-[15px] bg-color-gray2 p-4 rounded-[8px] rounded-bl-[2px] px-6 w-fit font-medium animate-pulse border border-color-white/5">
                    🤖 MedicalEqu Thinking...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions & Input */}
      <div className="w-full max-w-[800px] px-4 pb-6 flex flex-col gap-4">
        {chat.length > 0 && (
          <div className="flex justify-center lg:justify-end">
            <button
              onClick={handleNewChat}
              className="font-bold bg-color-white/10 hover:bg-color-white text-color-white hover:text-color-gray1 border border-color-white/10 px-4 py-2 rounded-[8px] text-[12px] shadow-lg transition-all flex items-center gap-2 group backdrop-blur-md"
            >
              <span className="group-hover:rotate-12 transition-transform">✨</span> New Chat
            </button>
          </div>
        )}
        
        <form
          className={`flex item-center w-full gap-3 border p-2 px-3 rounded-[8px] shadow-xl transition-all duration-300 bg-color-gray1/80 backdrop-blur-md
            ${req.trim() ? 'border-color-purple/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-color-white/10'}`}
          onSubmit={AiRes}
        >
          <input
            type="text"
            onChange={(e) => setReq(e.target.value)}
            value={req}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent px-4 py-2"
          />
          <button
            type="submit"
            disabled={!req.trim() || aiThinking}
            className={`w-11 h-11 rounded-[12px] flex items-center justify-center transition-all 
              ${req.trim() && !aiThinking ? 'bg-color-purple shadow-lg shadow-color-purple/20 scale-100' : 'bg-color-gray3/50 scale-95 opacity-50 cursor-not-allowed'}`}
          >
            <img src={sendIcon} alt="Send" className="w-5" />
          </button>
        </form>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs cursor-pointer rounded-[12px]"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 z-50 bg-color-gray1 border-l border-color-white/10 p-6 flex flex-col gap-6 shadow-2xl rounded-r-[12px]"
            >
              {/* Sidebar Header */}
              <div className="flex justify-between items-center border-b border-color-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
                  <h3 className="font-bold text-[16px] text-white">Chat History</h3>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-color-white/5 text-color-white/40 hover:text-white transition-all cursor-pointer"
                >
                  <img src={closeIcon} alt="Close" className="w-4" />
                </button>
              </div>

              {/* Sidebar List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 text-color-white/30 text-[13px] font-medium">
                    No past chat sessions found.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.sessionId}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left p-3.5 rounded-[8px] border transition-all flex flex-col gap-1 cursor-pointer
                        ${sessionId === session.sessionId
                          ? "bg-color-purple/15 border-color-purple text-white"
                          : "bg-color-gray2/40 border-color-white/5 hover:border-color-white/10 hover:bg-color-white/[0.02] text-color-white/60 hover:text-white"
                        }`}
                    >
                      <span className="text-[13px] font-bold truncate w-full">
                        {session.title || "Untitled Chat"}
                      </span>
                      <span className="text-[11px] font-medium text-color-white/30">
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatBot;
