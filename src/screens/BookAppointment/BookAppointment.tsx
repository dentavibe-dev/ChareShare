import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  profile_image: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export const BookAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<number>(8); // Default to 8th
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM');
  const [isFollowing, setIsFollowing] = useState(false);

  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Previous month's last few days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthLastDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthLastDays.push(prevMonthDays - i);
  }

  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(i);
  }

  // Next month's first few days
  const totalCells = 42; // 6 rows × 7 days
  const remainingCells = totalCells - prevMonthLastDays.length - currentMonthDays.length;
  const nextMonthDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i);
  }

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '09:30 AM', available: true },
    { id: '3', time: '10:00 AM', available: true },
    { id: '4', time: '10:30 AM', available: true },
    { id: '5', time: '11:00 AM', available: true },
    { id: '6', time: '11:30 AM', available: true },
    { id: '7', time: '02:00 PM', available: true },
    { id: '8', time: '02:30 PM', available: true },
    { id: '9', time: '03:00 PM', available: true },
    { id: '10', time: '03:30 PM', available: true },
    { id: '11', time: '04:00 PM', available: true },
    { id: '12', time: '04:30 PM', available: true },
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    if (id) {
      fetchDoctorProfile();
    }
  }, [id]);

  const fetchDoctorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization, profile_image')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (day: number, type: 'prev' | 'current' | 'next') => {
    if (type === 'current') {
      setSelectedDate(day);
    }
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleConfirmAppointment = () => {
    // Here you would typically save the appointment to your database
    alert(`Appointment confirmed with ${doctor?.full_name} on ${selectedDate} at ${selectedTimeSlot}`);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Doctor not found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-lg">Book Appointment</span>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <img
            src={doctor.profile_image}
            alt={doctor.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{doctor.full_name}</h2>
            <p className="text-gray-600 text-sm truncate">{doctor.specialization}</p>
          </div>
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isFollowing
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Select Date */}
      <div className="bg-white px-4 sm:px-6 py-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm text-gray-500 py-2 font-medium">
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {prevMonthLastDays.map((day) => (
            <button
              key={`prev-${day}`}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm text-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => handleDateSelect(day, 'prev')}
            >
              {day}
            </button>
          ))}

          {/* Current month days */}
          {currentMonthDays.map((day) => (
            <button
              key={`current-${day}`}
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm rounded-lg transition-colors ${
                selectedDate === day
                  ? 'bg-blue-500 text-white font-medium'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => handleDateSelect(day, 'current')}
            >
              {day}
            </button>
          ))}

          {/* Next month days */}
          {nextMonthDays.map((day) => (
            <button
              key={`next-${day}`}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm text-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => handleDateSelect(day, 'next')}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Available Time Slots */}
      <div className="bg-white px-4 sm:px-6 py-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
        
        {/* Morning Slots */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Morning</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.slice(0, 6).map((slot) => (
              <button
                key={slot.id}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeSlot === slot.time
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTimeSlotSelect(slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Afternoon Slots */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Afternoon</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.slice(6).map((slot) => (
              <button
                key={slot.id}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeSlot === slot.time
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTimeSlotSelect(slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleConfirmAppointment}
            className="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
          >
            Confirm Appointment
          </button>
        </div>
      </div>
    </div>
  );
};