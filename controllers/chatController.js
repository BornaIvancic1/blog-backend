import { getGeminiResponse } from '../services/genimiServices.js';

const allowedPatterns = [
  /post/i,
  /author/i,
  /comment/i,
  /category|categories/i,
  /login|sign in/i,
  /logout|sign out/i,
  /register|sign up/i,
  /profile/i,
  /password/i,
  /contact/i,
  /about/i,
  /search/i,
  /tag/i,
  /filter/i,
  /like/i,
  /view/i,
  /create.*post/i,
  /edit.*post/i,
  /delete.*post/i,
  /update.*post/i,
  /how.*(delete|edit|update|register|login|logout|sign up|sign in|change password|reset password|contact|search|filter|like|comment|view|find|use)/i,
];

export const chatWithGemini = async (req, res) => {
  try {
    const userInput = req.body.message;

    // Use Gemini to generate the answer for "how to edit post"
    if (/how.*edit.*post/i.test(userInput)) {
      const prompt = "Provide a clear, step-by-step answer to: 'How do I edit a post?' on a typical blog. The answer should be: 'Click on your post, click Edit, make your changes, then click Update.' Return only the instructions, nothing else.";
      const reply = await getGeminiResponse(prompt);
      return res.json({ reply });
    }

    // Existing logic for all other questions
    const isAllowed = allowedPatterns.some(pattern => pattern.test(userInput));
    if (!isAllowed) {
      return res.json({
        reply: "Sorry, I can only answer specific questions about the blog."
      });
    }

    const reply = await getGeminiResponse(userInput);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const paraphraseWithGemini = async (req, res) => {
  try {
    const { text, type } = req.body;
    let prompt;

    if (type === 'title') {
      prompt = `Rewrite the following blog post title in correct, natural English. Return only the improved title, nothing else:\n"${text}"`;
    } else {
      prompt = `Rewrite the following blog post content in correct, natural English. Return only the improved content, nothing else:\n"${text}"`;
    }

    const improvedText = await getGeminiResponse(prompt);
    res.json({ improvedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyTip = async (res) => {
  try {
    const prompt = "Give me a different, short, practical productivity tip or motivational quote each time you are asked. Return only the tip or quote, nothing else.";

    const tip = await getGeminiResponse(prompt);
    res.json({ tip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
