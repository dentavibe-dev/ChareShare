import React from 'react';
import { CalendarIcon, HomeIcon, MessageSquareIcon, UserIcon, PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Profile = () => {
  const navigate = useNavigate();
  const careTeam = [
    { name: 'Dr. Sarah', image: 'https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { name: 'Dr. Mike', image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { name: 'Dr. Lisa', image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150' },
  ];

  const appointments = [
    {
      doctor: 'Dr. Sarah Smith',
      type: 'General Check-up',
      date: 'Tomorrow, 10:00 AM',
    },
    {
      doctor: 'Dr. Mike Johnson',
      type: 'Dental Cleaning',
      date: 'Feb 15, 2025 • 2:30 PM',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
            />
            <span className="font-semibold">My Care Team</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2">
            <img src="/langing-pg-1.svg" alt="Notifications" className="w-5 h-5" />
          </button>
          <Link to="/messages" className="p-2">
            <img src="/langing-pg-2.svg" alt="Messages" className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">My Care Team</h2>
        
        {/* Care Team Grid */}
        <div className="flex gap-4 mb-8">
          {careTeam.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-1">
              <img
                src={member.image}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
          <button className="flex flex-col items-center justify-center gap-1">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-gray-500" />
            </div>
            <span className="text-sm">Add New</span>
          </button>
        </div>

        {/* Upcoming Appointments */}
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <div className="space-y-4 mb-8">
          {appointments.map((appointment, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{appointment.doctor}</h3>
                <p className="text-gray-600">{appointment.type}</p>
                <p className="text-sm text-gray-500">{appointment.date}</p>
              </div>
              <button className="text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Link to="/calendar" className="bg-white p-4 rounded-lg flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm">Book Visit</span>
          </Link>
          <button className="bg-white p-4 rounded-lg flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm">Insurance</span>
          </button>
          <button className="bg-white p-4 rounded-lg flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span className="text-sm">Health Feed</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1">
            <HomeIcon className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-blue-500">Home</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center gap-1">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Calendar</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-1">
            <MessageSquareIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Messages</span>
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