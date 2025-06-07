import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShareIcon, StarIcon, MapPinIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  bio: string;
  profile_image: string;
  locations: Array<{
    address: string;
    position: {
      lat: number;
      lng: number;
    };
  }>;
  booking_links: Array<{
    url: string;
  }>;
  is_active: boolean;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
}

export const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data for demonstration
  const mockReviews: Review[] = [
    {
      id: 1,
      name: "John Cooper",
      rating: 5,
      comment: "Excellent doctor! Very thorough and caring. Takes time to explain everything clearly.",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 2,
      name: "Emma Thompson",
      rating: 5,
      comment: "Very professional and knowledgeable. The wait times can be a bit long though.",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  const specialties = ["Cardiology", "Heart Disease", "Hypertension"];

  useEffect(() => {
    if (id) {
      fetchDoctorProfile();
    }
  }, [id]);

  const fetchDoctorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
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

  const handleBookAppointment = () => {
    navigate(`/book-appointment/${id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Dr. ${doctor?.full_name}`,
        text: `Check out Dr. ${doctor?.full_name} on CareCircle`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-lg">Doctor Profile</span>
        </div>
        <button onClick={handleShare} className="p-2">
          <ShareIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-white px-6 py-6">
        <div className="flex items-start gap-4 mb-6">
          <img
            src={doctor.profile_image}
            alt={doctor.full_name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{doctor.full_name}</h1>
            <p className="text-gray-600 mb-2">{doctor.specialization}</p>
            <div className="flex items-center gap-1 mb-3">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold">4.9</span>
              <span className="text-gray-500">(238 reviews)</span>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around py-4 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">15+</div>
            <div className="text-sm text-gray-500">Years Exp.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">2.5k+</div>
            <div className="text-sm text-gray-500">Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.9</div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* About */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-600 leading-relaxed">
            {doctor.bio || `Dr. ${doctor.full_name} is a board-certified ${doctor.specialization.toLowerCase()} with over 15 years of experience in treating various medical conditions. They specialize in preventive care and comprehensive health management.`}
          </p>
        </div>

        {/* Specialties */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
          {doctor.locations && doctor.locations.length > 0 ? (
            doctor.locations.map((location, index) => (
              <div key={index} className="flex items-start gap-3 mb-3">
                <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">CareCircle Medical Center</h3>
                  <p className="text-gray-600 text-sm">{location.address}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">CareCircle Medical Center</h3>
                <p className="text-gray-600 text-sm">123 Healthcare Ave, Suite 200<br />San Francisco, CA 94105</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
            <button className="text-blue-600 text-sm">See all</button>
          </div>
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{review.name}</h4>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Appointment Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleBookAppointment}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
        >
          Book Appointment
        </button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-20"></div>
    </div>
  );
};