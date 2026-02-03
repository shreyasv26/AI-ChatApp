import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const stompClient = useRef(null);
  const [connected, setConnected] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [aiMessages, setAiMessages] = useState([]); 
  const [showAI, setShowAI] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const stylesList = ["Professional", "Casual", "Polite", "Confident", "Shorter", "Clearer", "Grammar fix"];
  const languages = ["Spanish", "French", "German", "Hindi", "Kannada"];

  const messagesEndRef = useRef(null);
  const aiMessagesEndRef = useRef(null);
  const currentUser = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  

  if (!token) return <Navigate to="/login" />;


  useEffect(() => {
    if (messagesEndRef.current) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]); 

  useEffect(() => {
    if (aiMessagesEndRef.current) {
      aiMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, isAiLoading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      console.log("Using token:", token);
      try {
        const res = await axios.get(`http://localhost:8080/chat/history/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data && res.data.content) {
          setMessages([...res.data.content].reverse());
        } else if (Array.isArray(res.data)) {
          setMessages([...res.data].reverse());
        }
      } catch (err) {
        console.error("History load failed", err);
      }
    };
  
    fetchHistory(); 
  
    const socket = new SockJS('http://localhost:8080/ws-chat');
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true);
        stompClient.current.subscribe(`/topic/room/${roomId}`, (payload) => {
          const newMessage = JSON.parse(payload.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker error: ' + frame.headers['message']);
        setConnected(false);
      }
    });
  
    stompClient.current.activate();
  
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [roomId, token]);

  const sendMessage = () => {
    if (input.trim() && stompClient.current?.connected) {
      const chatMessage = {
        roomId: roomId,
        content: input,
        sender: currentUser,
        type: 'CHAT'
      };
  
      stompClient.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage)
      });
      setInput('');
    } else {
      console.warn("Wait for connection...");
    }
  };

  const handleSummarize = async () => {
    try {
      setSummary("AI is thinking...");
      setShowSummary(true);
      const response = await axios.get(`http://localhost:8080/ai/summarize/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error("AI Summary failed", error);
      setSummary("Failed to generate summary.");
    }
  };

  const handleAutoReply = async () => {
    try {
      const currentUsername = localStorage.getItem('username');
      
      const response = await axios.get(`http://localhost:8080/ai/autoreply/${roomId}`, {
        params: { username: currentUsername },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (stompClient.current && connected) {
        // Create a payload that matches what sendMessage expects
        const aiPayload = {
          roomId: roomId,
          sender: response.data.sender, // e.g., "SV (AI)"
          content: response.data.content,
          ai: true // Tell the backend this is an AI message
        };
  
        // Publish to /app/chat.send so the Controller processes it
        stompClient.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(aiPayload)
        });
      }
    } catch (err) {
      console.error("Auto-reply broadcast failed:", err);
    }
  };

  const handleAiFeature = async (featureName, additionalData = null) => {
    try {
        setSummary(`AI is processing ${featureName.toLowerCase()}...`);
        setShowSummary(true);

        const requestBody = {
            feature: featureName, 
            input: input,
            roomId: roomId,
            styles: featureName === 'REPHRASE' ? additionalData : [],
            targetLanguage: featureName === 'TRANSLATE' ? additionalData : null 
        };

        const response = await axios.post(`http://localhost:8080/ai/process`, requestBody, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if(featureName==='TRANSLATE'){
          setSummary("");
          setInput(response.data);
        }else{
          setSummary(response.data);
        }
    } catch (error) {
        console.error("AI Error:", error);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Clear all chat history?")) {
        try {
            await axios.delete(`http://localhost:8080/ai/clear/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages([]);
            setAiMessages([]);
            setSummary("");
            setShowSummary(false);
        } catch (err) {
            console.error("Clear failed", err);
        }
    }
  };

  const sendAiMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true); 

    try {
      const response = await axios.post(`http://localhost:8080/ai/chat`, 
        { input: text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: response.data }]);
    } catch (err) {
      console.error("AI Assistant error", err);
    } finally {
      setIsAiLoading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] p-4 text-[#e2e8f0]">
      <div className="flex flex-col w-full max-w-4xl mx-auto bg-[#1e293b] rounded-xl shadow-2xl overflow-hidden border border-[#334155]">
        <div className="p-4 bg-[#3b82f6] text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold uppercase">Room: {roomId}</h2>
            <span className={`text-xs ${connected ? 'text-green-300' : 'text-red-300'}`}>
              {connected ? '● Online' : '○ Offline'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSummarize} className="bg-[#2563eb] hover:bg-[#1d4ed8] px-3 py-1 rounded text-xs font-medium shadow-2xl transition">Summarize AI</button>
            <button onClick={handleClearChat} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs font-medium transition">Clear Chat</button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-medium transition">Logout</button>
          </div>
        </div>

        {showSummary && summary && (
          <div className="relative p-3 bg-blue-50 border-b italic text-sm text-blue-900 rounded-xl shadow-inner mb-4">
              <button 
                  onClick={() => setShowSummary(false)}
                  className="absolute top-1 right-2 text-blue-400 hover:text-blue-600"
              >
                  &times;
              </button>

              <strong>✨ AI Result:</strong> 
              <p className="mt-1">"{summary}"</p>
              
              <button 
                  onClick={() => setInput(summary)}
                  className="mt-2 text-[10px] bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition"
              >
                  Use this message
              </button>
          </div>
      )}

        <div className="flex-1 p-6 overflow-y-auto  overflow-x-hidden bg-[#0f172a] flex flex-col gap-4">
        {messages.map((msg, i) => {
          const senderName = msg.sender || "Unknown";
          const currentUsername = localStorage.getItem('username');
          
          const isMe = senderName === currentUsername || senderName === `${currentUsername} (AI)`;

          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`p-3 rounded-2xl max-w-[70%] shadow-sm ${
                isMe ? 'bg-[#2563eb] text-white rounded-tr-none' : 'bg-[#1e293b] text-[#e2e8f0] border border-[#334155] rounded-tl-none'
              }`}>
                {(!isMe || senderName.includes("(AI)")) && (
                  <span className="block text-[10px] font-black text-blue-400 uppercase mb-1">
                    {senderName}
                  </span>
                )}
                <p className="text-sm">{msg.content}</p>
                <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
</div>


        <div className="px-4 py-2 flex gap-2 bg-[#0f172a] border-t border-[#334155] items-center">
          <button onClick={handleAutoReply} className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-300 transition">
            ✨ Auto Reply
          </button>

        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'rephrase' ? null : 'rephrase')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex font-medium hover:bg-blue-200 transitionitems-center gap-1"
          >
            ✍️ Rephrase {activeMenu === 'rephrase' ? '▲' : ''}
          </button>
          {activeMenu === 'rephrase' && (
            <div className="absolute bottom-full mb-3 left-0 w-48  bg-blue-100 text-blue-700 rounded-2xl font-medium shadow-2xl p-2 z-50 border border-blue-200">
              {stylesList.map(style => (
                <label key={style} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-200 rounded-xl font-medium cursor-pointer text-xs bg-blue-100 text-blue-700">
                  <input 
                    type="checkbox" 
                    checked={selectedStyles.includes(style)}
                    onChange={() => {
                      const updated = selectedStyles.includes(style) 
                        ? selectedStyles.filter(s => s !== style) 
                        : [...selectedStyles, style];
                      setSelectedStyles(updated);
                    }}
                    className="accent-blue-600"
                  />
                  {style}
                </label>
              ))}
              <button 
                onClick={() => { handleAiFeature('REPHRASE', selectedStyles); setActiveMenu(null); }}
                className="w-full mt-2 bg-blue-600 text-white py-2 rounded-xl cursor-pointer text-[10px] font-bold uppercase"
              >
                Apply Styles ✨
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'translate' ? null : 'translate')}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200 flex items-center gap-1"
          >
            🌐 Translate {activeMenu === 'translate' ? '▲' : ''}
          </button>
          
          {activeMenu === 'translate' && (
            <div className="absolute bottom-full mb-3 left-0 w-26 bg-[#dcfce7] rounded-2xl shadow-2xl py-2 z-50 border border-green-200 flex flex-col">
              {languages.map(lang => (
                <button 
                  key={lang}
                  onClick={() => { handleAiFeature('TRANSLATE', lang); setActiveMenu(null); }}
                  className="px-4 py-2 text-xs text-green-900 hover:bg-green-200 text-center rounded-2xl font-medium transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          onClick={() => handleAiFeature('TONE_DETECTION')} 
          className="whitespace-nowrap px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 transition"
        >
            🎭 Detect Tone
        </button>
        </div>
        <div className="p-4 bg-[#1e293b] border-t border-[#334155] flex gap-2">
          <input
            className="flex-1 p-3 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!connected} className="bg-[#3b82f6] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#2563eb] transition">Send</button>
          <button onClick={() => setShowAI(!showAI)} className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold transition">
            {showAI ? "Close AI" : "AI Chat"}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className="ml-4 w-80 bg-[#1e293b] rounded-xl shadow-2xl flex flex-col border border-[#334155] overflow-hidden transition-all duration-300 h-full">

          <div className="p-3 bg-purple-600 font-bold text-white shadow-md">
            AI Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-purple-600 rounded-tr-none' : 'bg-gray-700 rounded-tl-none'}`}>
                  <p className="text-sm text-white">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Pulsing Dots Loader */}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-2 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={aiMessagesEndRef} />
          </div>

          <div className="p-3 border-t border-[#334155] bg-[#1e293b]">
            <input
              className="w-full p-2 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500"
              placeholder="Ask AI..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  sendAiMessage(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
