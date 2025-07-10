import Coach from '../models/Coach-updated.js';
import { sendResponse } from '../utils/response.js';

export const getAllCoaches = async (req, res) => {
    try {
        const coaches = await Coach.findAll();
        return sendResponse(res, 200, true, 'Coaches fetched successfully', coaches);
    } catch (error) {
        console.error('Error fetching coaches:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

export const getCoachById = async (req, res) => {
    try {
        const { id } = req.params;
        const coach = await Coach.findById(id);
        
        if (!coach) {
            return sendResponse(res, 404, false, 'Coach not found', null);
        }
        
        return sendResponse(res, 200, true, 'Coach fetched successfully', coach);
    } catch (error) {
        console.error('Error fetching coach by id:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

export const getCoachAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const availability = await Coach.getAvailability(id);
        
        if (!availability) {
            return sendResponse(res, 404, false, 'Coach not found', null);
        }
        
        return sendResponse(res, 200, true, 'Coach availability fetched successfully', availability);
    } catch (error) {
        console.error('Error fetching coach availability:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

export const getCoachReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Coach.getReviews(id);
        
        if (reviews === null) {
            return sendResponse(res, 404, false, 'Coach not found', null);
        }
        
        return sendResponse(res, 200, true, 'Coach reviews fetched successfully', reviews);
    } catch (error) {
        console.error('Error fetching coach reviews:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

export const addCoachFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Assuming req.user is set by auth middleware
        
        // Validate input
        const { rating, review_text } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return sendResponse(res, 400, false, 'Rating must be between 1 and 5', null);
        }
        
        const result = await Coach.addFeedback(id, userId, { 
            rating, 
            review_text
        });
        
        if (!result.success) {
            return sendResponse(res, 404, false, result.message, null);
        }
        
        return sendResponse(res, 201, true, result.message, { id: result.feedbackId });
    } catch (error) {
        console.error('Error adding coach feedback:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};
