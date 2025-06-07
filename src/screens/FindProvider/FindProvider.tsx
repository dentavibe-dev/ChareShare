import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, Search, MapPinIcon, StarIcon, BookmarkIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export const FindProvider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    // Get specialty from URL params if navigated from dashboard
    const urlParams = new URLSearchParams(location.search);
    const specialty = urlParams.get('specialty');
    if (specialty) {
      setSelectedSpecialty(specialty);
      setSearchTerm(specialty); // Pre-fill search with specialty
    }
    fetchProviders();
  }, [location.search]);

  const fetchProviders = async () => {
    try {
      // Fetch only from doctors table
      const { data: doctors, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Format doctors
      const formattedDoctors = (doctors || []).map(doctor => ({
        id: doctor.id,
        name: doctor.full_name,
        specialty: doctor.specialization,
        rating: 5.0,
        reviews: 0,
        distance: 0,
        image: doctor.profile_image || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
        availability: "Contact for availability",
        education: "Professional Healthcare Provider",
        languages: ["English"],
        location: doctor.locations?.[0]?.address || "Location available on request",
        type: 'doctor'
      }));

      setProviders(formattedDoctors);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    return providers.filter(provider => {
      const matchesSearch = 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !locationInput || 
        provider.location.toLowerCase().includes(locationInput.toLowerCase());
      
      // If there's a selected specialty from dashboard, filter by it
      const matchesSpecialty = !selectedSpecialty || 
        provider.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
      
      return matchesSearch && matchesLocation && matchesSpecialty;
    });
  };

  const filteredProviders = filterProviders();

  const clearSpecialtyFilter = () => {
    setSelectedSpecialty('');
    setSearchTerm('');
    // Update URL to remove specialty parameter
    navigate('/find-provider', { replace: true });
  };

  const handleProviderClick = (provider: any) => {
    navigate(`/doctor/${provider.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold">Find Provider</span>
        </div>
        <BookmarkIcon className="w-5 h-5 text-gray-600" />
      </div>

      {/* Specialty Filter Badge */}
      {selectedSpecialty && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtered by:</span>
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span>{selectedSpecialty}</span>
              <button 
                onClick={clearSpecialtyFilter}
                className="hover:bg-blue-200 rounded-full p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Inputs */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search specialty or provider's name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <MapPinIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Enter location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-4">
        <p className="text-gray-600">
          {isLoading ? 'Loading providers...' : `${filteredProviders.length} providers found`}
          {selectedSpecialty && ` for ${selectedSpecialty}`}
        </p>
      </div>

      {/* Provider List */}
      <div className="px-4 space-y-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500 mb-4">
              {selectedSpecialty 
                ? `No ${selectedSpecialty.toLowerCase()}s found matching your criteria.`
                : 'No providers found matching your search criteria.'
              }
            </p>
            {selectedSpecialty && (
              <button
                onClick={clearSpecialtyFilter}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear specialty filter
              </button>
            )}
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div 
              key={`${provider.type}-${provider.id}`} 
              className="bg-white p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProviderClick(provider)}
            >
              <img
                src={provider.image}
                alt={provider.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-gray-600">{provider.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviews} reviews)</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">{provider.availability}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};