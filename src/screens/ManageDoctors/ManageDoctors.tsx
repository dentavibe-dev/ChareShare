import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { GoogleMap, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  bio: string;
  profile_image: string;
  locations: any[];
  booking_links: any[];
  is_active: boolean;
  created_at: string;
}

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

export const ManageDoctors = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    specialization: '',
    bio: '',
    profileImage: ''
  });
  const [editLocations, setEditLocations] = useState<Location[]>([]);
  const [editBookingLinks, setEditBookingLinks] = useState<BookingLink[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/dashboard');
    } else {
      setIsAdmin(true);
      await loadDoctors();
    }
  };

  const loadDoctors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ 
          is_active: !doctor.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', doctor.id);

      if (error) throw error;

      // Update local state
      setDoctors(doctors.map(d => 
        d.id === doctor.id 
          ? { ...d, is_active: !d.is_active }
          : d
      ));

    } catch (error) {
      console.error('Error updating doctor status:', error);
      alert('Error updating doctor status. Please try again.');
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorToDelete.id);

      if (error) throw error;

      // Update local state
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      setShowDeleteDialog(false);
      setDoctorToDelete(null);

    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Error deleting doctor. Please try again.');
    }
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewDialog(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      fullName: doctor.full_name,
      specialization: doctor.specialization,
      bio: doctor.bio,
      profileImage: doctor.profile_image
    });
    setEditLocations(doctor.locations || [{ id: 1, address: '', position: defaultCenter }]);
    setEditBookingLinks(doctor.booking_links || [{ id: 1, url: '' }]);
    setSelectedLocation(null);
    setShowEditDialog(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (selectedLocation !== null && event.latLng) {
      const updatedLocations = [...editLocations];
      updatedLocations[selectedLocation] = {
        ...updatedLocations[selectedLocation],
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      };
      setEditLocations(updatedLocations);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: event.latLng },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            updateEditAddress(selectedLocation, results[0].formatted_address);
          }
        }
      );
    }
  };

  const addEditLocation = () => {
    setEditLocations([...editLocations, { 
      id: editLocations.length + 1, 
      address: '',
      position: defaultCenter
    }]);
  };

  const removeEditLocation = (index: number) => {
    const updatedLocations = editLocations.filter((_, i) => i !== index);
    setEditLocations(updatedLocations);
    setSelectedLocation(null);
  };

  const updateEditAddress = (index: number, address: string) => {
    const updatedLocations = [...editLocations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      address
    };
    setEditLocations(updatedLocations);
  };

  const handleEditAddressChange = (index: number, address: string) => {
    updateEditAddress(index, address);
    
    // Geocode address to get coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const position = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        
        const updatedLocations = [...editLocations];
        updatedLocations[index] = {
          ...updatedLocations[index],
          position
        };
        setEditLocations(updatedLocations);
      }
    });
  };

  const addEditBookingLink = () => {
    setEditBookingLinks([...editBookingLinks, { id: editBookingLinks.length + 1, url: '' }]);
  };

  const removeEditBookingLink = (id: number) => {
    setEditBookingLinks(editBookingLinks.filter(link => link.id !== id));
  };

  const updateEditBookingLink = (id: number, url: string) => {
    setEditBookingLinks(editBookingLinks.map(link => 
      link.id === id ? { ...link, url } : link
    ));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `doctor-${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('doctor-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('doctor-images')
        .getPublicUrl(filePath);

      setEditFormData(prev => ({
        ...prev,
        profileImage: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const validateEditForm = () => {
    if (!editFormData.fullName.trim()) {
      alert('Please enter the doctor\'s full name');
      return false;
    }
    
    if (!editFormData.bio.trim()) {
      alert('Please enter a bio for the doctor');
      return false;
    }

    // Validate at least one location with address
    const validLocations = editLocations.filter(loc => loc.address.trim());
    if (validLocations.length === 0) {
      alert('Please add at least one practice location');
      return false;
    }

    return true;
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor || !validateEditForm()) {
      return;
    }

    setIsUpdating(true);

    try {
      // Filter out empty locations and booking links
      const validLocations = editLocations.filter(loc => loc.address.trim());
      const validBookingLinks = editBookingLinks.filter(link => link.url.trim());

      const updateData = {
        full_name: editFormData.fullName.trim(),
        specialization: editFormData.specialization,
        bio: editFormData.bio.trim(),
        profile_image: editFormData.profileImage,
        locations: validLocations,
        booking_links: validBookingLinks,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('doctors')
        .update(updateData)
        .eq('id', editingDoctor.id)
        .select();

      if (error) throw error;

      // Update local state
      setDoctors(doctors.map(d => 
        d.id === editingDoctor.id 
          ? { ...d, ...updateData }
          : d
      ));

      setShowEditDialog(false);
      setEditingDoctor(null);
      setShowSuccessDialog(true);

    } catch (error: any) {
      console.error('Error updating doctor:', error);
      alert(`Error updating doctor: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
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
      <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <span className="ml-4 text-lg font-semibold">Manage Doctors</span>
        </div>
        <button
          onClick={() => navigate('/add-doctor')}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors added yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first doctor profile.</p>
            <button
              onClick={() => navigate('/add-doctor')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add First Doctor
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={doctor.profile_image}
                    alt={doctor.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.full_name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{doctor.bio}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>{doctor.locations?.length || 0} locations</span>
                          <span>{doctor.booking_links?.length || 0} booking links</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doctor.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Doctor"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(doctor)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            doctor.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {doctor.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setDoctorToDelete(doctor);
                            setShowDeleteDialog(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Doctor"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Doctor Profile</h2>
            
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={editFormData.profileImage}
                  alt="Doctor Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={editFormData.specialization}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Dentist">Dentist</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                    <option value="Massage Therapist">Massage Therapist</option>
                    <option value="Podiatrist">Podiatrist</option>
                    <option value="Physician">Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Pediatrician">Pediatrician</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Locations <span className="text-red-500">*</span>
                </label>
                <div className="h-[300px] bg-gray-100 rounded-lg mb-3">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={editLocations[selectedLocation || 0]?.position || defaultCenter}
                    zoom={12}
                    onClick={handleMapClick}
                  >
                    {editLocations.map((location, index) => (
                      <Marker
                        key={location.id}
                        position={location.position}
                        onClick={() => setSelectedLocation(index)}
                      />
                    ))}
                  </GoogleMap>
                </div>
                
                {editLocations.map((location, index) => (
                  <div key={location.id} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => handleEditAddressChange(index, e.target.value)}
                      placeholder="Enter clinic address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setSelectedLocation(index)}
                    />
                    {editLocations.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeEditLocation(index)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={addEditLocation}
                  className="w-full py-2 text-blue-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  + Add Another Location
                </button>
              </div>

              {/* Booking Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Links</label>
                <div className="space-y-2 mb-2">
                  {editBookingLinks.map(link => (
                    <div key={link.id} className="flex gap-2">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateEditBookingLink(link.id, e.target.value)}
                        placeholder="Add booking URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editBookingLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditBookingLink(link.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  onClick={addEditBookingLink}
                  className="w-full py-2 text-blue-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  + Add Another Link
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDoctor}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Doctor'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Updated Successfully!</h3>
            <p className="text-sm text-gray-500 mb-6">The doctor profile has been updated and changes are now visible to users.</p>
            <button
              onClick={handleSuccessDialogClose}
              className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Doctor Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedDoctor && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedDoctor.profile_image}
                  alt={selectedDoctor.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{selectedDoctor.full_name}</h2>
                  <p className="text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                    selectedDoctor.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDoctor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-600">{selectedDoctor.bio}</p>
                </div>

                {selectedDoctor.locations && selectedDoctor.locations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Practice Locations</h3>
                    <div className="space-y-2">
                      {selectedDoctor.locations.map((location, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{location.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoctor.booking_links && selectedDoctor.booking_links.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Booking Links</h3>
                    <div className="space-y-2">
                      {selectedDoctor.booking_links.map((link, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-4 border-t">
                  Added on {new Date(selectedDoctor.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Doctor</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{doctorToDelete?.full_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};