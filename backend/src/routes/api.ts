import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getStats } from '../controllers/dashboardController';
import { getUsers, getUser, blockUser, unblockUser, getUserConversations } from '../controllers/usersController';
import { getConversations, getConversation, getMessages } from '../controllers/conversationsController';
import { getAnalytics } from '../controllers/analyticsController';
import { getSettingsHandler, updateSettings } from '../controllers/settingsController';
import { getAgents, toggleAgent, getModels, testAgent } from '../controllers/agentsController';

const router = Router();

// Public test endpoint (no JWT needed) — tests AI pipeline without DB or X API
router.post('/test-agent', testAgent);

// All admin routes require JWT
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', getStats);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);
router.get('/users/:id/conversations', getUserConversations);

// Conversations + Messages
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.get('/messages', getMessages);

// Analytics
router.get('/analytics', getAnalytics);

// Settings
router.get('/settings', getSettingsHandler);
router.put('/settings', updateSettings);

// Agents
router.get('/agents', getAgents);
router.put('/agents/:id', toggleAgent);

// Models
router.get('/models', getModels);

// Test agent
router.post('/test-agent', testAgent);

export default router;
