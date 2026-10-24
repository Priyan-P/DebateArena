import {
  isApiKeyConfigured,
  generateOpeningArgument,
  generateCounterArgument,
  judgeDebate,
} from '../services/aiService.js';

/**
 * Controller: Health check
 */
export const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    apiKeyConfigured: isApiKeyConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
};

/**
 * Controller: Start a new debate session
 */
export const startDebate = async (req, res, next) => {
  try {
    const { topic, userPosition, difficulty = 'Intermediate', roundLimit = 5, style = 'Formal' } = req.body;

    // Validation
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic must be at least 3 characters long.' });
    }
    if (topic.trim().length > 200) {
      return res.status(400).json({ error: 'Topic must not exceed 200 characters.' });
    }

    const normUserPos = String(userPosition).toUpperCase();
    if (normUserPos !== 'FOR' && normUserPos !== 'AGAINST') {
      return res.status(400).json({ error: 'userPosition must be either "FOR" or "AGAINST".' });
    }

    const aiPosition = normUserPos === 'FOR' ? 'AGAINST' : 'FOR';
    const validDifficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty) ? difficulty : 'Intermediate';
    const validStyle = ['Formal', 'Friendly', 'Socratic'].includes(style) ? style : 'Formal';
    const validRounds = Math.max(1, Math.min(10, parseInt(roundLimit, 10) || 5));

    // Generate AI Opening Argument
    const openingArgument = await generateOpeningArgument({
      topic: topic.trim(),
      aiPosition,
      userPosition: normUserPos,
      difficulty: validDifficulty,
      style: validStyle,
    });

    const debateId = `debate_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    res.json({
      debateId,
      topic: topic.trim(),
      userPosition: normUserPos,
      aiPosition,
      difficulty: validDifficulty,
      style: validStyle,
      roundLimit: validRounds,
      openingArgument,
      isDemo: !isApiKeyConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Submit user argument and get AI rebuttal
 */
export const replyDebate = async (req, res, next) => {
  try {
    const { topic, userPosition, aiPosition, difficulty = 'Intermediate', style = 'Formal', history = [], userArgument } = req.body;

    if (!userArgument || typeof userArgument !== 'string' || userArgument.trim().length === 0) {
      return res.status(400).json({ error: 'Argument text cannot be empty.' });
    }
    if (userArgument.trim().length > 2500) {
      return res.status(400).json({ error: 'Argument text is too long (maximum 2,500 characters).' });
    }

    // Limit conversation history length to avoid payload / token overflow
    const boundedHistory = Array.isArray(history) ? history.slice(-16) : [];

    const aiResponse = await generateCounterArgument({
      topic: String(topic || '').trim(),
      aiPosition: String(aiPosition || 'AGAINST').toUpperCase(),
      userPosition: String(userPosition || 'FOR').toUpperCase(),
      difficulty,
      style,
      history: boundedHistory,
      latestUserArgument: userArgument.trim(),
    });

    res.json({
      aiResponse,
      isDemo: !isApiKeyConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Request AI judging for the debate
 */
export const judgeDebateSession = async (req, res, next) => {
  try {
    const { topic, userPosition, history = [] } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'Cannot judge an empty debate transcript.' });
    }

    const userMessages = history.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      return res.status(400).json({ error: 'Debate must contain at least one argument from the user to be judged.' });
    }

    const evaluation = await judgeDebate({
      topic: String(topic || '').trim(),
      userPosition: String(userPosition || 'FOR').toUpperCase(),
      history,
    });

    res.json({
      evaluation,
      isDemo: !isApiKeyConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
