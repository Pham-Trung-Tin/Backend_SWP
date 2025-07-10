# Appointment Table Schema Fix

## Problem

The Appointment model code was trying to use:
- A table named `appointment` (singular) when the actual table is `appointments` (plural)
- A column named `appointment_time` (datetime) when the actual table uses separate `date` (DATE) and `time` (VARCHAR) columns

This mismatch was causing errors like:
- `Unknown column 'appointment_time' in 'where clause'`
- `Appointment time not within coach availability`

## Solution

1. Updated the Appointment model to use the correct table name (`appointments`) throughout all methods
2. Modified queries to use separate `date` and `time` columns instead of `appointment_time`
3. Created a SQL migration script to fix any database schema inconsistencies
4. Updated the controller to handle the client-side `appointment_time` field and convert it to the separate `date` and `time` fields needed by the database

## Implementation Steps

1. **Run Database Fix Script**:
   ```
   node server/fix-appointment-tables.js
   ```
   This script will:
   - Rename `appointment` table to `appointments` if needed
   - Create the `appointments` table with the correct structure if it doesn't exist
   - Add missing columns (`date`, `time`, `duration_minutes`) if needed
   - Migrate data from `appointment_time` to separate `date` and `time` columns if needed
   - Create appropriate indexes for performance

2. **Restart Your Server**:
   The changes to the model have been applied, but the server needs to be restarted to load them.

3. **Test Appointment Creation**:
   Try creating a new appointment using the API endpoint. It should now work correctly with the following payload:
   ```json
   {
     "coach_id": 4,
     "appointment_time": "2025-07-11T15:00:00",
     "duration_minutes": 60
   }
   ```

## Changes Made

1. **Appointment Model** (`server/src/models/Appointment.js`):
   - Updated all SQL queries to use `appointments` table instead of `appointment`
   - Modified queries to use `date` and `time` columns instead of `appointment_time`
   - Added conversion logic to split ISO datetime strings into separate date and time components
   - Added code to combine `date` and `time` fields into `appointment_time` in query results for backward compatibility

2. **Appointment Controller** (`server/src/controllers/appointmentController.js`):
   - Added logic to convert client-side `appointment_time` field to the server-side `date` and `time` fields

3. **Migration Script** (`server/src/scripts/fix-appointment-tables.sql`):
   - Created a script to fix table and column mismatches between code and database

## Troubleshooting

If you still encounter issues after implementing these fixes:

1. Check if the database tables match the expected structure:
   ```
   node server/test-coach-tables.js
   ```

2. Examine any appointment conflict errors:
   ```
   node server/test-appointment-debug.js
   ```

3. Try direct appointment creation test:
   ```
   node server/test-create-appointment.js
   ```

4. Check the availability of coaches:
   ```
   node server/test-coach-availability.js
   ```
