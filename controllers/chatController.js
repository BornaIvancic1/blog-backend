import { getGeminiResponse } from '../services/genimiServices.js';

export const chatWithGemini = async (req, res) => {
  try {
    const userInput = req.body.message;
    const reply = await getGeminiResponse(userInput);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
