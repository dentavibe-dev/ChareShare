import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, Search, MapPinIcon, StarIcon, BookmarkIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { providers } from '../../data/providers';

export const FindProvider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [filteredProviders, setFilteredProviders] = useState(providers);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const specialty = searchParams.get('specialty');
    
    if (specialty) {
      setFilteredProviders(providers.filter(provider => 
        provider.specialty.toLowerCase() === specialty.toLowerCase()
      ));
    }
  }, [location]);

  const handleSearch = () => {
    const filtered = providers.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationInput === '' || 
                            provider.location.toLowerCase().includes(locationInput.toLowerCase());
      return matchesSearch && matchesLocation;
    });
    setFilteredProviders(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, locationInput]);

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

      {/* Search Inputs */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search specialty or doctor's name"
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

      {/* Filters */}
      <div className="px-4 flex items-center gap-3 mb-4 overflow-x-auto">
        <button className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
          Filters
        </button>
        <button className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
          Within 5 miles
        </button>
        <button className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
          4+ Stars
        </button>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-4">
        <p className="text-gray-600">{filteredProviders.length} providers found</p>
      </div>

      {/* Provider List */}
      <div className="px-4 space-y-4 pb-20">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white p-4 rounded-lg flex items-center gap-4">
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
                <span className="mx-2">•</span>
                <span className="text-gray-500">{provider.distance} miles away</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">{provider.availability}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};