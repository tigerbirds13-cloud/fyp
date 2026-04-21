import React, { useMemo, useState } from 'react';

const getBotReply = (text, roleLabel) => {
  const message = text.toLowerCase();

  if (message.includes('book') || message.includes('booking')) {
    return `To apply quickly, open a job card and click the apply action. As a ${roleLabel}, you can review details before submitting.`;
  }

  if (message.includes('profile')) {
    return `Open your profile from the top navigation to update your ${roleLabel} details, photo, and preferences.`;
  }

  if (message.includes('helper') || message.includes('seeker')) {
    return 'You can choose Job Seeker or Employer during registration, and dashboard sections change automatically by role.';
  }

  if (message.includes('job') || message.includes('post')) {
    return 'Job posting is available from the profile dashboard. Open your profile and go to the Job Posts section.';
  }

  if (message.includes('payment') || message.includes('price')) {
    return 'You can check plans in the Pricing section. For payment support, contact the admin team from Contact.';
  }

  return 'I can help with applications, profiles, jobs, and roles. Try asking: "how to apply" or "how to update profile".';
};

export default function ChatbotWidget({ isDark, userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! I am your HomeTown Helper assistant. Ask me about applications, profiles, or job posting.',
    },
  ]);

  const roleLabel = useMemo(() => {
    if (userRole === 'helper') return 'employer';
    if (userRole === 'admin') return 'admin';
    return 'job seeker';
  }, [userRole]);

  const sendMessage = (presetText) => {
    const text = (presetText || input).trim();
    if (!text) return;

    const nextUserMessage = {
      id: Date.now(),
      sender: 'user',
      text,
    };

    const nextBotMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      text: getBotReply(text, roleLabel),
    };

    setMessages((prev) => [...prev, nextUserMessage, nextBotMessage]);
    setInput('');
  };

  const panelBg = isDark ? '#0b0b0b' : '#ffffff';
  const panelBorder = isDark ? '#1f2937' : '#e2e8f0';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subText = isDark ? '#94a3b8' : '#64748b';
  const userBubble = isDark ? '#16a34a' : '#22c55e';
  const botBubble = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 12000 }}>
      {isOpen && (
        <div
          style={{
            width: 340,
            maxWidth: 'calc(100vw - 24px)',
            height: 460,
            maxHeight: 'calc(100vh - 96px)',
            borderRadius: 18,
            border: `1px solid ${panelBorder}`,
            background: panelBg,
            boxShadow: '0 16px 42px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid ${panelBorder}` }}>
            <div style={{ color: textColor, fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>HomeTown Assistant</div>
            <div style={{ color: subText, fontFamily: 'DM Sans', fontSize: 12, marginTop: 4, textTransform: 'capitalize' }}>Signed in as {roleLabel}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gap: 10 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  justifySelf: msg.sender === 'user' ? 'end' : 'start',
                  background: msg.sender === 'user' ? userBubble : botBubble,
                  color: msg.sender === 'user' ? '#ffffff' : textColor,
                  borderRadius: 12,
                  padding: '10px 12px',
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                  lineHeight: 1.45,
                  maxWidth: '86%',
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 12px', borderTop: `1px solid ${panelBorder}`, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['How to apply to a job?', 'Update my profile', 'Post a job'].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    border: `1px solid ${panelBorder}`,
                    background: isDark ? '#111827' : '#f8fafc',
                    color: subText,
                    borderRadius: 999,
                    padding: '5px 10px',
                    fontFamily: 'DM Sans',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  border: `1px solid ${panelBorder}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  background: isDark ? '#111827' : '#ffffff',
                  color: textColor,
                  outline: 'none',
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                }}
              />
              <button
                onClick={() => sendMessage()}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 14px',
                  background: '#22c55e',
                  color: '#ffffff',
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: '#22c55e',
          color: '#ffffff',
          fontFamily: 'Syne',
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(34,197,94,0.35)',
        }}
      >
        {isOpen ? 'Close' : 'Chat'}
      </button>
    </div>
  );
}
