import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getStats, getXProfile } from '../controllers/dashboardController';
import { getUsers, getUser, blockUser, unblockUser, getUserConversations } from '../controllers/usersController';
import { getConversations, getConversation, getMessages } from '../controllers/conversationsController';
import { getAnalytics } from '../controllers/analyticsController';
import { getSettingsHandler, updateSettings } from '../controllers/settingsController';
import { getAgents, toggleAgent, getModels, testAgent } from '../controllers/agentsController';
import { getRequests, getRequestStats } from '../controllers/requestsController';
import { getHealth } from '../controllers/healthController';

const router = Router();

// Public test endpoint (no JWT needed) — tests AI pipeline without DB or X API
router.post('/test-agent', testAgent);

// Health — no auth required so uptime checkers can hit it
router.get('/health', getHealth);

// All admin routes require JWT
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', getStats);
router.get('/dashboard/x-profile', getXProfile);

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

// Requests log
router.get('/requests', getRequests);
router.get('/requests/stats', getRequestStats);

// Settings
router.get('/settings', getSettingsHandler);
router.put('/settings', updateSettings);

// Agents
router.get('/agents', getAgents);
router.put('/agents/:id', toggleAgent);

// Models
router.get('/models', getModels);

export default router;
