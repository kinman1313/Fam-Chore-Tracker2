import Chore from '../models/Chore';
import User from '../models/User';
import { APIError } from '../middleware/error';
import { validateChore } from '../utils/validation';

export default {
  getAllChores,
  createChore,
  getChoreById,
  updateChore,
  deleteChore
};

const getAllChores = async (req, res) => {
    const chores = await Chore.find({ familyId: req.params.familyId })
        .populate('assignedTo', 'username avatar')
        .populate('createdBy', 'username')
        .sort({ dueDate: 1 });

    res.json({
        success: true,
        data: chores
    });
};

const createChore = async (req, res) => {
    const { title, description, points, dueDate, assignedTo, priority } = req.body;
    
    // Check if chore exists
    const choreExists = await Chore.findOne({ title });
    
    // Validate input
    const validTitle = validateChore.title(title);
    const validPoints = validateChore.points(points);
    const validDueDate = validateChore.dueDate(dueDate);
    const validPriority = validateChore.priority(priority);
    
    const chore = await Chore.create({
        ...req.body,
        familyId: req.params.familyId,
        createdBy: req.user.id
    });

    await Activity.create({
        familyId: req.params.familyId,
        userId: req.user.id,
        choreId: chore._id,
        type: 'chore_created',
        details: {
            choreName: chore.title
        }
    });

    res.status(201).json({
        success: true,
        data: chore
    });
};

const getChoreById = async (req, res) => {
  // ... existing code ...
};

const updateChore = async (req, res) => {
  // ... existing code ...
};

const deleteChore = async (req, res) => {
  // ... existing code ...
};
