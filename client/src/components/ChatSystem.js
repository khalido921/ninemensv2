import React, { useState, useRef, useEffect } from 'react';
import { useSound } from '../context/SoundContext';

const EMOJIS = ['😀','😂','😍','😎','😢','😡','👍','👎','🎉','❤️','🔥','😮','😇','🤔','😜','😱','🥳','🙌','👏','🙏','💯'];

const ChatSystem = React.forwardRef(({ socket, chat, playerId }, ref) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const inputRef = useRef();
  const chatEndRef = useRef();
  const chatWindowRef = useRef();
  const { playSound } = useSound();

  // Scroll to bottom if autoscroll is enabled
  useEffect(() => {
    if (isAutoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isAutoScroll]);

  // Detect manual scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!chatWindowRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      setIsAutoScroll(scrollTop + clientHeight >= scrollHeight - 10);
    };
    if (chatWindowRef.current) {
      chatWindowRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (chatWindowRef.current) {
        chatWindowRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleSend = () => {
    if (!message.trim() || isRateLimited) return;
    setIsRateLimited(true);
    socket.emit('sendMessage', { message }, (response) => {
      if (response.success) {
        setMessage('');
        playSound('message');
      }
      setTimeout(() => setIsRateLimited(false), 1000);
    });
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji) => {
    // Insert emoji at cursor position
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newValue);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-96">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-gray-800 text-lg flex-1">Chat</span>
        <button
          className="ml-2 p-2 rounded-full hover:bg-gray-100 relative"
          onClick={() => setShowEmojiPicker((v) => !v)}
          title="Emoji picker"
        >
          <span role="img" aria-label="emoji">😊</span>
          {showEmojiPicker && (
            <div className="absolute z-10 top-10 right-0 bg-white border rounded shadow-lg p-2 grid grid-cols-5 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:bg-gray-200 rounded"
                  onClick={() => handleEmojiClick(emoji)}
                  tabIndex={-1}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto chat-scrollbar mb-2 bg-gray-50 rounded p-2"
        ref={chatWindowRef}
        style={{ minHeight: 0 }}
      >
        {chat.map((msg) => (
          <div key={msg.id} className={`mb-2 flex ${msg.playerId === playerId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg shadow text-sm ${msg.playerId === playerId ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
              <span>{msg.message}</span>
              <span className="block text-xs text-gray-500 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex items-center space-x-2">
        <textarea
          ref={inputRef}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type a message..."
          maxLength={200}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isRateLimited}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default ChatSystem; 