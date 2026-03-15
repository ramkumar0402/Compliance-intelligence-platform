import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  Briefcase,
  Edit3,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { DEPARTMENTS, TITLES, ROLE_LABELS } from '../types/auth';
import { format } from 'date-fns';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    timezone: user?.timezone || '',
    department: user?.department || '',
    title: user?.title || '',
    bio: user?.bio || '',
  });

  if (!user) return null;

  const handleSave = async () => {
    const success = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      location: formData.location,
      timezone: formData.timezone,
      department: formData.department,
      title: formData.title,
      bio: formData.bio,
    });

    if (success) {
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      timezone: user.timezone || '',
      department: user.department,
      title: user.title,
      bio: user.bio || '',
    });
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'senior_analyst': return 'bg-blue-100 text-blue-800';
      case 'analyst': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg animate-enter">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your personal information and preferences</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 flex items-center gap-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400 rounded-full filter blur-3xl" />
          </div>
        </div>

        {/* Avatar & Name */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold text-navy-900 border-4 border-white">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-navy-900 text-white rounded-full flex items-center justify-center hover:bg-navy-800 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 pt-2 sm:pt-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                  {ROLE_LABELS[user.role]}
                </span>
                {user.isEmailVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{user.title} • {user.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2.5">{user.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2.5">{user.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </span>
            </label>
            <p className="text-gray-900 py-2.5 flex items-center gap-2">
              {user.email}
              {user.isEmailVerified && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </span>
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2.5">{user.phone || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2.5">{user.location || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Timezone
              </span>
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select timezone</option>
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 py-2.5">{user.timezone || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-400" />
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department
              </span>
            </label>
            {isEditing ? (
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 py-2.5">{user.department}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Title
              </span>
            </label>
            {isEditing ? (
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TITLES.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 py-2.5">{user.title}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 py-2.5">{user.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </span>
            </label>
            <p className="py-2.5">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                {ROLE_LABELS[user.role]}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </span>
            </label>
            <p className="text-gray-900 py-2.5">
              {format(new Date(user.dateJoined), 'MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Login
              </span>
            </label>
            <p className="text-gray-900 py-2.5">
              {format(new Date(user.lastLogin), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Status</label>
            <p className="py-2.5">
              {user.isActive ? (
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  Inactive
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
