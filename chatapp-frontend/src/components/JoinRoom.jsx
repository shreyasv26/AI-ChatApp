import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
    const [roomName, setRoomName] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomName.trim()) {
            console.log("Navigating to room:", roomName); // Check your console
            navigate(`/chat/${roomName}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
            <div className="p-8 bg-[#1e293b] rounded-xl shadow-xl w-96 text-center border border-[#334155]">
                <h2 className="mb-6 text-2xl font-bold text-[#e2e8f0]">Join a Chat Room</h2>
                <form onSubmit={handleJoin}>
                <input
                    type="text"
                    placeholder="Enter Room Name (e.g. tech, music)"
                    className="w-full p-3 mb-4 bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full p-3 text-white bg-[#3b82f6] rounded-xl hover:bg-[#60a5fa] transition font-semibold"
                >
                    Enter Chat
                </button>
                </form>
            </div>
            </div>
    );
};

export default JoinRoom;