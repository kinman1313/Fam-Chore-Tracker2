import validator from 'validator';
import { APIError } from '../middleware/error';

// User validation
const validateUser = {
    username: (username) => {
        if (!username || username.length < 3) {
            throw new APIError('Username must be at least 3 characters long', 400);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw new APIError('Username can only contain letters, numbers, and underscores', 400);
        }
        return username.toLowerCase();
    },

    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new APIError('Please provide a valid email address', 400);
        }
        return email.toLowerCase();
    },

    password: (password) => {
        if (!password || password.length < 8) {
            throw new APIError('Password must be at least 8 characters long', 400);
        }
        if (!/\d/.test(password)) {
            throw new APIError('Password must contain at least one number', 400);
        }
        if (!/[a-z]/.test(password)) {
            throw new APIError('Password must contain at least one lowercase letter', 400);
        }
        if (!/[A-Z]/.test(password)) {
            throw new APIError('Password must contain at least one uppercase letter', 400);
        }
        return password;
    }
};

// Chore validation
const validateChore = {
    title: (title) => {
        if (!title || title.trim().length < 3) {
            throw new APIError('Chore title must be at least 3 characters long', 400);
        }
        return title.trim();
    },

    points: (points) => {
        const numPoints = Number(points);
        if (isNaN(numPoints) || numPoints < 0 || numPoints > 100) {
            throw new APIError('Points must be a number between 0 and 100', 400);
        }
        return numPoints;
    },

    dueDate: (dueDate) => {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            throw new APIError('Please provide a valid due date', 400);
        }
        if (date < new Date()) {
            throw new APIError('Due date cannot be in the past', 400);
        }
        return date;
    },

    priority: (priority) => {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            throw new APIError('Priority must be low, medium, or high', 400);
        }
        return priority;
    }
};

// Family validation
const validateFamily = {
    name: (name) => {
        if (!name || name.trim().length < 2) {
            throw new APIError('Family name must be at least 2 characters long', 400);
        }
        return name.trim();
    },

    inviteCode: (code) => {
        if (!code || code.length !== 6) {
            throw new APIError('Invalid invite code', 400);
        }
        return code.toUpperCase();
    }
};

// MongoDB ObjectId validation
const validateObjectId = (id) => {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new APIError('Invalid ID format', 400);
    }
    return id;
};

// Request query validation
const validateQuery = {
    page: (page) => {
        const numPage = Number(page);
        if (isNaN(numPage) || numPage < 1) {
            throw new APIError('Page must be a positive number', 400);
        }
        return numPage;
    },

    limit: (limit) => {
        const numLimit = Number(limit);
        if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
            throw new APIError('Limit must be between 1 and 100', 400);
        }
        return numLimit;
    },

    sortBy: (field, allowedFields) => {
        if (!allowedFields.includes(field)) {
            throw new APIError(`Sort field must be one of: ${allowedFields.join(', ')}`, 400);
        }
        return field;
    }
};

// Date range validation
const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new APIError('Please provide valid dates', 400);
    }

    if (end < start) {
        throw new APIError('End date must be after start date', 400);
    }

    return { start, end };
};

export default {
    validateUser,
    validateChore,
    validateFamily,
    validateObjectId,
    validateQuery,
    validateDateRange
};
