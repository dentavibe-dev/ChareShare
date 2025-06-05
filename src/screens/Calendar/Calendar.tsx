import React from 'react';
import { ArrowLeftIcon, CalendarIcon, HomeIcon, MessageSquareIcon, UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Calendar = () => {
  const navigate = useNavigate();
  
  const appointments = [
    {
      doctor: 'Dr. Sarah Smith',
      type: 'General Check-up',
      date: 'Feb 14, 2025',
      time: '10:00 AM',
      location: 'Main Street Clinic'
    },
    {
      doctor: 'Dr. Mike Johnson',
      type: 'Dental Cleaning',
      date: 'Feb 15, 2025',
      time: '2:30 PM',
      location: 'Dental Care Center'
    },
    {
      doctor: 'Dr. Lisa Park',
      type: 'Follow-up',
      date: 'Feb 20, 2025',
      time: '3:00 PM',
      location: 'Medical Plaza'
    }
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold">Calendar</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">February 2025</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-sm text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(day => (
              <button
                key={day}
                className={`aspect-square rounded-full flex items-center justify-center text-sm
                  ${day === 14 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <div key={index} className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{appointment.doctor}</h4>
                  <p className="text-gray-600">{appointment.type}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>{appointment.date} • {appointment.time}</span>
                    <span>•</span>
                    <span>{appointment.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1">
            <HomeIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center gap-1">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-blue-500">Calendar</span>
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