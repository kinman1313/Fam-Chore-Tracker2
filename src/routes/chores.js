import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { getAllChores, createChore, getChoreById, updateChore, deleteChore } from '../controllers/choreController';

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(protect, getAllChores)
    .post(protect, authorize('parent'), createChore);

router.route('/:choreId')
    .get(protect, getChoreById)
    .put(protect, authorize('parent'), updateChore)
    .delete(protect, authorize('parent'), deleteChore);

export default router;
