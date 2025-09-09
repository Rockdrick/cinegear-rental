import express from 'express';
import { getCategories, getConditions, getLocations } from '../controllers/referenceController';

const router = express.Router();

// Reference data routes (no auth required for now)
router.get('/categories', getCategories);
router.get('/conditions', getConditions);
router.get('/locations', getLocations);

export default router;
