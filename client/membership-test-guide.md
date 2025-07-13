# Membership Integration Test

This is a script to help test the membership-based access control system for your React application. Follow the steps below to get started:

## Step 1: Add membership field to users

Add a membership field to user data in localStorage using the developer console:

```javascript
// Open browser console (F12 or right-click -> Inspect -> Console)
// Run this code to add membership field to all users
try {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('nosmoke_users')) || [];
  
  // Add membership field if it doesn't exist (default: 'free')
  const updatedUsers = users.map(user => ({
    ...user,
    membership: user.membership || 'free'
  }));
  
  // Save back to localStorage
  localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
  
  console.log('✅ Successfully added membership field to all users');
  console.log('Current users:', updatedUsers);
} catch (error) {
  console.error('❌ Error updating user data:', error);
}
```

## Step 2: Update logged in user (if needed)

If you already have a logged-in user, update their membership in localStorage:

```javascript
try {
  // Get current logged-in user
  const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
  
  if (currentUser) {
    // Set membership field
    currentUser.membership = 'free'; // Change to 'premium' or 'pro' as needed
    
    // Save back to localStorage
    localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
    
    console.log('✅ Successfully updated current user membership');
    console.log('Current user:', currentUser);
  } else {
    console.log('❓ No logged-in user found');
  }
} catch (error) {
  console.error('❌ Error updating current user:', error);
}
```

## Step 3: Test the membership restriction features

1. Navigate to `/membership-test` to test the membership restriction features
2. Try accessing the Coach Chat feature with different membership levels
3. Verify the AccessDenied page and modal dialogs work correctly

## Step 4: Set up transactions table (optional)

Create a transactions table in localStorage to track membership upgrades:

```javascript
try {
  // Create empty transactions array if it doesn't exist
  if (!localStorage.getItem('membership_transactions')) {
    localStorage.setItem('membership_transactions', JSON.stringify([]));
    console.log('✅ Successfully created membership_transactions in localStorage');
  } else {
    console.log('ℹ️ membership_transactions already exists');
    console.log('Current transactions:', JSON.parse(localStorage.getItem('membership_transactions')));
  }
} catch (error) {
  console.error('❌ Error setting up transactions:', error);
}
```
