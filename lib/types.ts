export type Role = "user" | "assistant" | "system";

export type ChatMode = "local" | "remote";

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
