const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatLogs } = require('../config/db');

const SYSTEM_PROMPT = `You are an Animal Rescue and Welfare Assistant named "AniBot". Your role is to help users safely assist injured animals.

Key responsibilities:
- Provide humane, responsible, and practical rescue guidance
- Offer step-by-step first-aid suggestions for injured animals
- Guide users on safe animal handling precautions
- Recommend veterinary assistance for emergencies
- Provide information about nearby shelters and rescue organizations
- Guide users through the animal adoption process
- Answer FAQs related to animal welfare
- Support multiple languages based on user preference

Important guidelines:
- Always encourage users to contact professional rescuers and veterinarians for serious emergencies
- Emphasize safety for both the animal and the rescuer
- Be compassionate, calm, and supportive in your responses
- Provide clear, actionable step-by-step guidance
- When unsure, recommend professional help immediately

Emergency situations: Always prioritize safety and direct users to emergency vet services if an animal is in critical condition.`;

let genAI = null;
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!genAI && key && key.length > 10 && !key.includes('your_gemini')) {
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
};

// @desc    Chat with Gemini AI
// @route   POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, sessionId, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ai = getGenAI();

    // If Gemini API key not configured, return a friendly help message
    if (!ai) {
      const fallbackReplies = {
        'dog first aid': `🐕 **Dog First Aid Guide:**\n\n1. **Stay calm** — your calmness helps the dog\n2. **Approach carefully** — injured dogs may bite from pain\n3. **Muzzle if needed** using a cloth or leash\n4. **Check breathing** — ensure airway is clear\n5. **Control bleeding** — apply gentle pressure with clean cloth\n6. **Keep warm** — wrap in a blanket\n7. **Don't move** if spinal injury suspected\n8. **Call a vet immediately** — this is always the best option!\n\n📞 Contact your nearest vet or animal rescue immediately.`,
      };

      const lower = message.toLowerCase();
      const reply = Object.keys(fallbackReplies).find(k => lower.includes(k))
        ? fallbackReplies[Object.keys(fallbackReplies).find(k => lower.includes(k))]
        : `🐾 **AniBot is ready!**\n\nI can help with animal rescue guidance. For the best AI responses, please ensure the Gemini API key is configured in \`backend/.env\`.\n\nFor immediate animal emergencies:\n- 🏥 Contact your nearest veterinary clinic\n- 📞 Call local animal rescue helpline\n- 🚨 Keep the animal calm and in a safe, quiet space\n- 🌡️ Cover with a light blanket if it's cold\n\nWhat specific help do you need?`;

      return res.json({ success: true, reply, sessionId: sessionId || 'demo-session' });
    }

    // Build conversation history
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Save to NeDB chat log
    try {
      const sid = sessionId || `session-${Date.now()}`;
      const existing = await ChatLogs.findOne({ sessionId: sid });
      const newMessages = [
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'model', content: reply, timestamp: new Date() },
      ];

      if (existing) {
        await ChatLogs.findByIdAndUpdate(existing._id, {
          $set: { messages: [...(existing.messages || []), ...newMessages] },
        });
      } else {
        await ChatLogs.create({
          sessionId: sid,
          userId: req.user?._id || null,
          messages: newMessages,
        });
      }
    } catch (logErr) {
      console.warn('Chat log save failed:', logErr.message);
    }

    res.json({ success: true, reply, sessionId: sessionId || `session-${Date.now()}` });
  } catch (error) {
    console.error('Gemini error:', error.message);

    // Friendly error for common API issues
    if (error.message?.includes('API_KEY') || error.message?.includes('credentials')) {
      return res.status(200).json({
        success: true,
        reply: `⚠️ The AI service returned an authentication error. Please verify the Gemini API key in \`backend/.env\`.\n\nGet a free key at: https://aistudio.google.com\n\nFor immediate help, contact your local animal rescue organization.`,
        sessionId,
      });
    }

    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again.',
    });
  }
};
