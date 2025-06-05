import React from 'react';
import { ArrowLeftIcon, CalendarIcon, HomeIcon, MessageSquareIcon, UserIcon, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Messages = () => {
  const navigate = useNavigate();

  const conversations = [
    {
      id: 1,
      name: 'Dr. Sarah Smith',
      image: 'https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Your test results look good!',
      time: '10:30 AM',
      unread: 2
    },
    {
      id: 2,
      name: 'Dr. Mike Johnson',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'See you at your appointment tomorrow',
      time: 'Yesterday',
      unread: 0
    },
    {
      id: 3,
      name: 'Dr. Lisa Park',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Please remember to bring your records',
      time: 'Yesterday',
      unread: 1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold">Messages</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="divide-y divide-gray-100">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="bg-white p-4 flex items-center gap-4">
            <img
              src={conversation.image}
              alt={conversation.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold truncate">{conversation.name}</h3>
                <span className="text-sm text-gray-500">{conversation.time}</span>
              </div>
              <p className="text-gray-600 text-sm truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unread > 0 && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{conversation.unread}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1">
            <HomeIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center gap-1">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Calendar</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-1">
            <MessageSquareIcon className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-blue-500">Messages</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1">
            <UserIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};