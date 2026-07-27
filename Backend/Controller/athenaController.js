const axios = require('axios');
const { buildUserContext } = require('../services/athenaContextService');

const FASTAPI_URL = 'http://localhost:8000';

// POST /api/athena/chat
// Proxies to the FastAPI Athena assistant, attaching RAG context built from
// the user's own profile/resume/matches/proposals — same proxy pattern as
// proposalController.generateProposal.
const chatWithAthena = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const user_id = req.user.user_id;

    if (!message || typeof message !== 'string')
      return res.status(400).json({ message: 'message is required' });

    const context = await buildUserContext(user_id);

    const response = await axios.post(`${FASTAPI_URL}/athena-chat`, {
      message,
      history: Array.isArray(history) ? history : [],
      context,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response?.data?.detail) {
      // A 401 here means the AI provider's API key is misconfigured, not that the
      // user's own session is invalid — don't let the frontend's global 401
      // interceptor mistakenly log the user out over it.
      const status = error.response.status === 401 ? 502 : error.response.status;
      return res.status(status).json({ message: error.response.data.detail });
    }
    next(error);
  }
};

module.exports = { chatWithAthena };
