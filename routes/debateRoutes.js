import express from 'express';
import { getHealth, startDebate, replyDebate, judgeDebateSession } from '../controllers/debateController.js';

const router = express.Router();

router.get('/health', getHealth);
router.post('/debate/start', startDebate);
router.post('/debate/reply', replyDebate);
router.post('/debate/judge', judgeDebateSession);

export default router;
