const Chat = require('../models/chat.model');
const { OpenAI } = require('openai');

const SYSTEM_PROMPT = `You are a helpful and professional assistant for a student grievance system.

Your role is to:
- Help students describe and submit their complaints clearly
- Ask relevant follow-up questions when needed
- Provide guidance on grievance categories (academic, hostel, faculty, technical, etc.)
- Maintain a polite, supportive, and neutral tone
- Never give harmful, biased, or inappropriate responses

If the user is unclear, ask clarifying questions before answering.
Keep responses concise and easy to understand.`;

exports.handleChatMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and sessionId are required' });
        }

        if (!process.env.OPENROUTER_API_KEY) {
             return res.status(500).json({ error: 'OpenRouter API key is not configured on the server' });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter for ranking
                "X-Title": "Student Grievance System Chatbot", // Optional, helps OpenRouter identify the app
            }
        });

        // 1. Retrieve or Initialize Chat History
        let chat = await Chat.findOne({ sessionId });
        
        if (!chat) {
            chat = new Chat({
                sessionId,
                messages: [{ role: 'system', content: SYSTEM_PROMPT }]
            });
        }

        // 2. Append User Message
        chat.messages.push({ role: 'user', content: message });
        
        // 3. Call OpenRouter API
        const completion = await openai.chat.completions.create({
            model: 'anthropic/claude-3-haiku',
            messages: chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
        });

        const assistantResponse = completion.choices[0].message.content;

        // 4. Append Assistant Response and Save
        chat.messages.push({ role: 'assistant', content: assistantResponse });
        await chat.save();

        // 5. Send Response back to client
        res.status(200).json({
            message: assistantResponse,
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'An error occurred while communicating with the AI model.' });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
             return res.status(400).json({ error: 'SessionId is required' });
        }

        const chat = await Chat.findOne({ sessionId });
        
        if (!chat) {
            return res.status(200).json({ messages: [] });
        }

        // Exclude system message from frontend history to keep it clean
        const visibleMessages = chat.messages.filter(msg => msg.role !== 'system');
        
        res.status(200).json({ messages: visibleMessages });
    } catch (error) {
        console.error("Get Chat History Error:", error);
        res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }
};
