/**
 * Helper utilities for testing membership restrictions
 */

/**
 * Manually update the currently logged in user's membership for testing purposes
 * @param {string} membership - The membership level to set ('free', 'premium', or 'pro')
 * @returns {Object} - Result object indicating success or failure
 */
export const updateCurrentUserMembership = (membership) => {
  try {
    if (!['free', 'premium', 'pro'].includes(membership)) {
      return { success: false, error: 'Invalid membership level. Must be "free", "premium", or "pro".' };
    }
    
    // Get current logged-in user
    const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
    
    if (currentUser) {
      // Set membership field
      currentUser.membership = membership;
      
      // Save back to localStorage
      localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
      
      // Also update in users list
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          return { ...user, membership };
        }
        return user;
      });
      
      localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
      
      console.log('✅ Successfully updated current user membership to:', membership);
      return { success: true, user: currentUser };
    } else {
      console.log('❓ No logged-in user found');
      return { success: false, error: 'No logged-in user found' };
    }
  } catch (error) {
    console.error('❌ Error updating current user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if the current user has access to premium features
 * @returns {Object} - Result object indicating the user's access status
 */
export const checkCurrentUserAccess = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
    
    if (!currentUser) {
      return { hasAccess: false, reason: 'Not logged in', membership: null };
    }
    
    const membership = currentUser.membership || 'free';
    const hasAccess = ['premium', 'pro'].includes(membership);
    
    return { 
      hasAccess,
      reason: hasAccess ? 'User has premium access' : 'User has free membership', 
      membership
    };
  } catch (error) {
    console.error('Error checking user access:', error);
    return { hasAccess: false, reason: 'Error checking access', error: error.message };
  }
};
