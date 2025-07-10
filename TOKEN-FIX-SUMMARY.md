# Token Fix for Authentication

## Problem Summary

The purchase API and other authenticated endpoints were failing with the error message "Token missing required field: id" when using tokens from the login API. This is because the login API creates tokens with a payload that includes `userId`, but the authentication middleware was looking for an `id` field.

## Solution

We've fixed this issue by modifying the token generation to include both `userId` and `id` fields in the JWT payload. This maintains compatibility with existing code while ensuring the authentication middleware can correctly identify users.

### Changes Made:

1. Modified `generateToken` and `generateRefreshToken` functions to include both `userId` and `id` fields in the token payload.
2. Added additional logging to show the token structure during login.
3. Created a test script to validate that the token structure fix works correctly.

## How to Test the Fix

### Using the Test Script

1. Start the server:
   ```
   npm run dev
   ```

2. In a separate terminal, run the test script:
   ```
   npm run test-token-fix
   ```
   
   This script will:
   - Attempt to log in with test credentials
   - Check the structure of the returned token
   - Test the purchase API with the login token
   - Report success or failure

   Note: You may need to edit the script to provide valid test credentials.

### Manual Testing with Postman

1. Make a login request to get a token:
   ```
   POST http://localhost:3001/api/auth/login
   Content-Type: application/json
   
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

2. Copy the token from the response.

3. Use the token to make a purchase request:
   ```
   POST http://localhost:3001/api/packages/purchase
   Content-Type: application/json
   Authorization: Bearer YOUR_TOKEN_HERE
   
   {
     "packageId": 1,
     "amount": 100000,
     "paymentMethod": "credit_card"
   }
   ```

4. Verify that the purchase request succeeds with a success response.

## Debugging

If you still encounter issues, you can:

1. Run the token decoder to check its structure:
   ```
   TOKEN=your_token_here npm run decode-token
   ```

2. Check the server logs for detailed authentication messages.

3. Verify that both `id` and `userId` fields are present in the token payload.

## Future Considerations

To maintain consistent token structure across the application, consider:

1. Standardizing the token payload structure in all authentication endpoints.
2. Updating authentication middleware to be more flexible in how it identifies users.
3. Adding more comprehensive token validation and error handling.
