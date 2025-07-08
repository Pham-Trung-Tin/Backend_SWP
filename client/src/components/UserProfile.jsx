import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/userService';
import './UserProfile.css';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [smokingStatus, setSmokingStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingSmokingStatus, setIsEditingSmokingStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        date_of_birth: '',
        gender: ''
    });

    const [smokingFormData, setSmokingFormData] = useState({
        is_smoker: false,
        cigarettes_per_day: '',
        years_smoking: '',
        quit_attempts: '',
        motivation_level: 5,
        quit_reasons: '',
        quit_date: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const [profileResponse, smokingResponse] = await Promise.all([
                userAPI.getProfile(),
                userAPI.getSmokingStatus()
            ]);

            if (profileResponse.success) {
                setProfile(profileResponse.data.user);
                setFormData({
                    full_name: profileResponse.data.user.full_name || '',
                    phone: profileResponse.data.user.phone || '',
                    date_of_birth: profileResponse.data.user.date_of_birth || '',
                    gender: profileResponse.data.user.gender || ''
                });
                setAvatarPreview(profileResponse.data.user.avatar_url || '');
            }

            if (smokingResponse.success && smokingResponse.data) {
                setSmokingStatus(smokingResponse.data);
                setSmokingFormData({
                    is_smoker: smokingResponse.data.SmokingStatus === 'active',
                    cigarettes_per_day: smokingResponse.data.CigarettesPerDay || '',
                    years_smoking: smokingResponse.data.YearsSmoked || '',
                    quit_attempts: smokingResponse.data.quit_attempts || '',
                    motivation_level: smokingResponse.data.motivation_level || 5,
                    quit_reasons: smokingResponse.data.quit_reasons || '',
                    quit_date: smokingResponse.data.QuitDate || ''
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');

            const response = await userAPI.updateProfile(formData);

            if (response.success) {
                setProfile(response.data);
                setIsEditing(false);
                setSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setAvatarPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        try {
            setError('');
            setSuccess('');

            const response = await userAPI.uploadAvatar(avatarFile);

            if (response.success) {
                setProfile(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
                setAvatarPreview(response.data.avatar_url);
                setAvatarFile(null);
                setSuccess('Avatar updated successfully!');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSmokingStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');

            const response = await userAPI.updateSmokingStatus(smokingFormData);

            if (response.success) {
                setSmokingStatus(response.data);
                setIsEditingSmokingStatus(false);
                setSuccess('Smoking status updated successfully!');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setError('');
        setDeletePassword('');
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletePassword('');
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        try {
            setError('');

            if (!deletePassword.trim()) {
                setError('Password is required to delete your account');
                return;
            }

            const response = await userAPI.deleteAccount(deletePassword);

            if (response.success) {
                // Clear user data and redirect to home
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <div className="error">Failed to load profile</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>User Profile</h1>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Avatar Section */}
            <div className="profile-section">
                <h2>Profile Picture</h2>
                <div className="avatar-section">
                    <div className="avatar-container">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                <span>{profile.username?.charAt(0)?.toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                    <div className="avatar-controls">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            id="avatar-input"
                            className="file-input"
                        />
                        <label htmlFor="avatar-input" className="btn btn-secondary">
                            Choose File
                        </label>
                        {avatarFile && (
                            <button onClick={handleAvatarUpload} className="btn btn-primary">
                                Upload Avatar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="profile-section">
                <div className="section-header">
                    <h2>Basic Information</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn btn-secondary"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-info">
                        <div className="info-item">
                            <label>Username:</label>
                            <span>{profile.username}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>
                                {profile.email}
                                <span className={`verification-badge ${profile.email_verified ? 'verified' : 'unverified'}`}>
                                    {profile.email_verified ? '✓ Verified' : '⚠ Unverified'}
                                </span>
                            </span>
                        </div>
                        <div className="info-item">
                            <label>Role:</label>
                            <span className="role-badge">{profile.role}</span>
                        </div>
                        <div className="info-item">
                            <label>Full Name:</label>
                            <span>{profile.full_name || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Phone:</label>
                            <span>{profile.phone || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Date of Birth:</label>
                            <span>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Gender:</label>
                            <span>{profile.gender || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Member Since:</label>
                            <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                            <label>Last Updated:</label>
                            <span>{new Date(profile.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item">
                            <label>Gender:</label>
                            <span>{profile.gender || 'Not provided'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Smoking Status Section */}
            <div className="profile-section">
                <div className="section-header">
                    <h2>Smoking Status</h2>
                    <button
                        onClick={() => setIsEditingSmokingStatus(!isEditingSmokingStatus)}
                        className="btn btn-secondary"
                    >
                        {isEditingSmokingStatus ? 'Cancel' : (smokingStatus ? 'Edit' : 'Add')}
                    </button>
                </div>

                {isEditingSmokingStatus ? (
                    <form onSubmit={handleSmokingStatusUpdate} className="profile-form">
                        <div className="form-group">
                            <label>Current Smoking Status</label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="is_smoker"
                                        checked={smokingFormData.is_smoker === true}
                                        onChange={() => setSmokingFormData(prev => ({ ...prev, is_smoker: true }))}
                                    />
                                    <span>Active Smoker</span>
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="is_smoker"
                                        checked={smokingFormData.is_smoker === false}
                                        onChange={() => setSmokingFormData(prev => ({ ...prev, is_smoker: false }))}
                                    />
                                    <span>Quit Smoking</span>
                                </label>
                            </div>
                        </div>

                        {smokingFormData.is_smoker && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cigarettes per Day</label>
                                        <input
                                            type="number"
                                            value={smokingFormData.cigarettes_per_day}
                                            onChange={(e) => setSmokingFormData(prev => ({ ...prev, cigarettes_per_day: e.target.value }))}
                                            placeholder="e.g., 20"
                                            min="0"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Years Smoking</label>
                                        <input
                                            type="number"
                                            value={smokingFormData.years_smoking}
                                            onChange={(e) => setSmokingFormData(prev => ({ ...prev, years_smoking: e.target.value }))}
                                            placeholder="e.g., 5"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {!smokingFormData.is_smoker && (
                            <div className="form-group">
                                <label>Quit Date</label>
                                <input
                                    type="date"
                                    value={smokingFormData.quit_date}
                                    onChange={(e) => setSmokingFormData(prev => ({ ...prev, quit_date: e.target.value }))}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Previous Quit Attempts</label>
                            <input
                                type="number"
                                value={smokingFormData.quit_attempts}
                                onChange={(e) => setSmokingFormData(prev => ({ ...prev, quit_attempts: e.target.value }))}
                                placeholder="Number of times you've tried to quit"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Motivation Level (1-10)</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={smokingFormData.motivation_level}
                                onChange={(e) => setSmokingFormData(prev => ({ ...prev, motivation_level: e.target.value }))}
                            />
                            <span className="range-value">{smokingFormData.motivation_level}</span>
                        </div>

                        <div className="form-group">
                            <label>Quit Reasons</label>
                            <textarea
                                value={smokingFormData.quit_reasons}
                                onChange={(e) => setSmokingFormData(prev => ({ ...prev, quit_reasons: e.target.value }))}
                                placeholder="Why do you want to quit smoking? (health, family, financial, etc.)"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Support System</label>
                            <textarea
                                value={smokingFormData.support_system}
                                onChange={(e) => setSmokingFormData(prev => ({ ...prev, support_system: e.target.value }))}
                                placeholder="Who supports you in quitting? (family, friends, etc.)"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Health Concerns</label>
                            <textarea
                                value={smokingFormData.health_concerns}
                                onChange={(e) => setSmokingFormData(prev => ({ ...prev, health_concerns: e.target.value }))}
                                placeholder="Any health concerns related to smoking?"
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {smokingStatus ? 'Update Status' : 'Save Status'}
                            </button>
                            <button type="button" onClick={() => setIsEditingSmokingStatus(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="smoking-info">
                        {smokingStatus ? (
                            <>
                                <div className="info-item">
                                    <label>Status:</label>
                                    <span className={`status-badge ${smokingStatus.SmokingStatus}`}>
                                        {smokingStatus.SmokingStatus === 'active' ? '🚬 Active Smoker' :
                                            smokingStatus.SmokingStatus === 'quitting' ? '🚫 Quitting' :
                                                '✅ Quit'}
                                    </span>
                                </div>
                                {smokingStatus.SmokingStatus === 'active' && (
                                    <>
                                        <div className="info-item">
                                            <label>Cigarettes per Day:</label>
                                            <span>{smokingStatus.CigarettesPerDay || 'Not specified'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Years Smoking:</label>
                                            <span>{smokingStatus.YearsSmoked || 'Not specified'}</span>
                                        </div>
                                    </>
                                )}
                                {smokingStatus.QuitDate && (
                                    <div className="info-item">
                                        <label>Quit Date:</label>
                                        <span>{new Date(smokingStatus.QuitDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <label>Last Updated:</label>
                                    <span>{new Date(smokingStatus.LastUpdated).toLocaleDateString()}</span>
                                </div>
                            </>
                        ) : (
                            <p className="no-data">No smoking status information available. Click "Add" to provide your smoking details.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="profile-section danger-zone">
                <h2>Danger Zone</h2>
                <div className="danger-content">
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <button onClick={openDeleteModal} className="btn btn-danger">
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Delete Account</h3>
                            <button className="close-btn" onClick={closeDeleteModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <p>Please enter your password to confirm account deletion. This action cannot be undone.</p>

                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleDeleteAccount}>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={closeDeleteModal} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-danger">
                                        Confirm Delete
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
