# Testing Membership Restrictions

This document provides instructions on how to test the membership restrictions in the application.

## Option 1: Using the MembershipTestHelpers utility

You can use the `membershipTestHelpers.js` utility functions in the browser console to test the membership restrictions:

```javascript
// Import the utility functions
import { updateCurrentUserMembership, checkCurrentUserAccess } from './src/utils/membershipTestHelpers';

// Change the current user's membership to 'free', 'premium', or 'pro'
updateCurrentUserMembership('free');   // Set to free membership
updateCurrentUserMembership('premium'); // Set to premium membership
updateCurrentUserMembership('pro');     // Set to pro membership

// Check the current user's access status
checkCurrentUserAccess();
```

## Option 2: Using the MembershipAccessTester component

1. Import the MembershipAccessTester component into your application:

```javascript
import MembershipAccessTester from './src/components/MembershipAccessTester';
```

2. Add it to a page for testing:

```jsx
// Add this somewhere in your component or page
<MembershipAccessTester />
```

3. Use the buttons in the tester to switch between membership levels and test access.

## Option 3: Directly manipulating localStorage

You can manually update the localStorage to modify the user's membership level:

```javascript
// Get the current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));

// Update the membership
if (currentUser) {
  currentUser.membership = 'free'; // Change to 'premium' or 'pro' as needed
  localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
  console.log('Membership updated to:', currentUser.membership);
  
  // Don't forget to also update in the users array
  const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
  const updatedUsers = users.map(user => {
    if (user.id === currentUser.id) {
      return { ...user, membership: currentUser.membership };
    }
    return user;
  });
  
  localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
  console.log('User updated in users array');
  
  // Refresh the page to see changes
  window.location.reload();
}
```

## Testing Flow

To perform a complete test of the membership restrictions:

1. Set the user's membership to 'free'
2. Try to access the booking page at `/appointment`
3. Verify that a modal is shown indicating premium membership is required
4. Change the membership to 'premium' 
5. Try to access the booking page again
6. Verify that the booking page is now accessible
7. Book an appointment
8. Verify that you can chat with the coach
9. Test the same flow with 'pro' membership
