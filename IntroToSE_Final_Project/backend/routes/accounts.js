import express from 'express';
import { syncProfile, updateProfile } from '../controllers/accountController.js';

const router = express.Router();

// Public route for profile sync (uses Firebase token for auth)
router.post('/sync-profile', syncProfile);

// Public route for update profile
router.put('/update-profile', updateProfile);

export default router;
