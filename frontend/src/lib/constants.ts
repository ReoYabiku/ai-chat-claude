// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Application Metadata
export const APP_NAME = 'AI Chat Claude';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Chat with Claude AI - Simple and Powerful';

// LocalStorage Keys
export const STORAGE_KEYS = {
  SESSION_ID: 'ai-chat-session-id',
  CONVERSATION_ID: 'ai-chat-conversation-id',
  THEME: 'ai-chat-theme',
} as const;

// UI Constants
export const UI = {
  MAX_MESSAGE_LENGTH: 5000,
  MESSAGE_PLACEHOLDER: 'Type your message here...',
  NEW_CHAT_TITLE: 'New Conversation',
  TYPING_INDICATOR_DELAY: 300,
  AUTO_SCROLL_THRESHOLD: 100,
} as const;

// Message Role Display Names
export const ROLE_LABELS = {
  USER: 'You',
  ASSISTANT: 'Claude',
  SYSTEM: 'System',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Failed to connect to server. Please check your connection.',
  INVALID_MESSAGE: 'Message cannot be empty.',
  MESSAGE_TOO_LONG: `Message cannot exceed ${UI.MAX_MESSAGE_LENGTH} characters.`,
  CONVERSATION_NOT_FOUND: 'Conversation not found.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  CONVERSATIONS: '/api/conversations',
  CONVERSATION: (id: string) => `/api/conversations/${id}`,
  MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
  SESSION_CONVERSATIONS: (sessionId: string) => `/api/sessions/${sessionId}/conversations`,
} as const;
