// Conversation types
export { Role, type Message, type Conversation } from './types/conversation';

// API types
export {
  type CreateConversationRequest,
  type CreateConversationResponse,
  type SendMessageRequest,
  type SendMessageResponse,
  type GetConversationResponse,
  type GetSessionConversationsResponse,
  type HealthCheckResponse,
  type ApiError,
  ErrorCodes,
  type ErrorCode,
} from './types/api';
