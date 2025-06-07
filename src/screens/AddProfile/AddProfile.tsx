import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeftIcon } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Dialog, DialogContent } from '../../components/ui/dialog';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

interface Location {
  id: number;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface BookingLink {
  id: number;
  url: string;
}

interface AdminFormData {
  fullName: string;
  specialization: string;
  bio: string;
  profileImage: string;
}

const initialFormData: AdminFormData = {
  fullName: '',
  specialization: 'Dentist',
  bio: '',
  profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
};

const initialLocation: Location = {
  id: 1,
  address: '',
  position: defaultCenter
};

const initialBookingLink: BookingLink = {
  id: 1,
  url: ''
};

export const AddProfile = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showExistingProfileDialog, setShowExistingProfileDialog] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>(initialFormData);
  const [locations, setLocations] = useState<Location[]>([initialLocation]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [bookingLinks, setBookingLinks] = useState<BookingLink[]>([initialBookingLink]);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
      await checkExistingProfile(user.id);
    }
  };

  const checkExistingProfile = async (userId: string) => {
    try {
      const { data: existingProfile, error } = await supabase
        .from('admin_profiles')
        .select('id, full_name')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing profile:', error);
        return;
      }

      if (existingProfile) {
        setExistingProfileId(existingProfile.id);
        setShowExistingProfileDialog(true);
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (selectedLocation !== null && event.latLng) {
      const updatedLocations = [...locations];
      updatedLocations[selectedLocation] = {
        ...updatedLocations[selectedLocation],
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      };
      setLocations(updatedLocations);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: event.latLng },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            updateAddress(selectedLocation, results[0].formatted_address);
          }
        }
      );
    }
  };

  const addLocation = () => {
    setLocations([...locations, { 
      id: locations.length + 1, 
      address: '',
      position: defaultCenter
    }]);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    setSelectedLocation(null);
  };

  const updateAddress = (index: number, address: string) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      address
    };
    setLocations(updatedLocations);
  };

  const handleAddressChange = (index: number, address: string) => {
    updateAddress(index, address);
    
    // Geocode address to get coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const position = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        
        const updatedLocations = [...locations];
        updatedLocations[index] = {
          ...updatedLocations[index],
          position
        };
        setLocations(updatedLocations);
      }
    });
  };

  const addBookingLink = () => {
    setBookingLinks([...bookingLinks, { id: bookingLinks.length + 1, url: '' }]);
  };

  const removeBookingLink = (id: number) => {
    setBookingLinks(bookingLinks.filter(link => link.id !== id));
  };

  const updateBookingLink = (id: number, url: string) => {
    setBookingLinks(bookingLinks.map(link => 
      link.id === id ? { ...link, url } : link
    ));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('admin-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        profileImage: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setLocations([{ ...initialLocation }]);
    setBookingLinks([{ ...initialBookingLink }]);
    setSelectedLocation(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert('Please enter your full name');
      return false;
    }
    
    if (!formData.bio.trim()) {
      alert('Please enter a bio');
      return false;
    }

    // Validate at least one location with address
    const validLocations = locations.filter(loc => loc.address.trim());
    if (validLocations.length === 0) {
      alert('Please add at least one practice location');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Filter out empty locations and booking links
      const validLocations = locations.filter(loc => loc.address.trim());
      const validBookingLinks = bookingLinks.filter(link => link.url.trim());

      const profileData = {
        user_id: user.id,
        full_name: formData.fullName.trim(),
        specialization: formData.specialization,
        bio: formData.bio.trim(),
        profile_image: formData.profileImage,
        locations: validLocations,
        booking_links: validBookingLinks
      };

      // Check if profile already exists (double-check)
      const { data: existingProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile instead of inserting
        const { data, error } = await supabase
          .from('admin_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select();

        if (error) throw error;
        console.log('Profile updated successfully:', data);
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('admin_profiles')
          .insert(profileData)
          .select();

        if (error) throw error;
        console.log('Profile added successfully:', data);
      }

      setShowSuccessDialog(true);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      
      if (error.code === '23505' && error.message.includes('unique_user_id')) {
        alert('You already have a profile. Please use the "Update Profile" option instead.');
        navigate('/admin-profile');
      } else {
        alert(`Error saving profile: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    resetForm();
  };

  const handleExistingProfileDialogClose = () => {
    setShowExistingProfileDialog(false);
    navigate('/dashboard');
  };

  const handleGoToUpdateProfile = () => {
    setShowExistingProfileDialog(false);
    navigate('/admin-profile');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 sm:px-6 py-4 flex items-center border-b sticky top-0 z-10">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <span className="ml-4 text-lg font-semibold">Add New Profile</span>
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={formData.profileImage}
                alt="Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2.5 hover:bg-blue-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-colors"
                  >
                    <option value="Dentist">Dentist</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                    <option value="Massage Therapist">Massage Therapist</option>
                    <option value="Podiatrist">Podiatrist</option>
                    <option value="Physician">Physician</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Write something about yourself, your experience, and qualifications..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Practice Locations <span className="text-red-500">*</span>
              </label>
              <div className="h-[400px] bg-gray-100 rounded-lg mb-3">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={locations[selectedLocation || 0]?.position || defaultCenter}
                  zoom={12}
                  onClick={handleMapClick}
                >
                  {locations.map((location, index) => (
                    <Marker
                      key={location.id}
                      position={location.position}
                      onClick={() => setSelectedLocation(index)}
                    />
                  ))}
                </GoogleMap>
              </div>
              
              {locations.map((location, index) => (
                <div key={location.id} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                    placeholder="Enter clinic address"
                    required={index === 0}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={() => setSelectedLocation(index)}
                  />
                  {locations.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button"
                onClick={addLocation}
                className="w-full py-2.5 text-blue-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                + Add Another Location
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Links</label>
              <div className="space-y-3 mb-3">
                {bookingLinks.map(link => (
                  <div key={link.id} className="flex gap-2">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateBookingLink(link.id, e.target.value)}
                      placeholder="Add booking URL (e.g., https://calendly.com/your-name)"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    {bookingLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBookingLink(link.id)}
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addBookingLink}
                className="w-full py-2.5 text-blue-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                + Add Another Link
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving Profile...' : 'Add Profile'}
            </button>
          </div>
        </div>
      </form>

      {/* Existing Profile Warning Dialog */}
      <Dialog open={showExistingProfileDialog} onOpenChange={handleExistingProfileDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Already Exists</h3>
            <p className="text-sm text-gray-500 mb-6">You already have an admin profile. You can update your existing profile instead of creating a new one.</p>
            <div className="flex gap-3">
              <button
                onClick={handleExistingProfileDialogClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToUpdateProfile}
                className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Saved Successfully!</h3>
            <p className="text-sm text-gray-500 mb-6">The profile has been saved to the database and is now visible to users.</p>
            <button
              onClick={handleDialogClose}
              className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};