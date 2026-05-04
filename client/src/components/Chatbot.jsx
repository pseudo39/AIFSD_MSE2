import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Generate or retrieve a session ID for the chat history
  const getSessionId = () => {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/${sessionId}`);
        if (response.data && response.data.messages) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      }
    };
    loadHistory();
  }, [sessionId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage.content,
        sessionId: sessionId
      });

      const assistantMessage = { role: 'assistant', content: response.data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={toggleChat} aria-label="Open Chat">
          💬
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Support Assistant</h3>
            <button className="chatbot-close-btn" onClick={toggleChat} aria-label="Close Chat">
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="message assistant">
                Hello! I am the Student Grievance Assistant. How can I help you today?
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
