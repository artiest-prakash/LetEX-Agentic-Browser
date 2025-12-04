import React from 'react';

export enum SidebarTab {
  CHAT = 'Chat',
  HISTORY = 'History',
  NOTES = 'Notes',
  TASKS = 'Tasks'
}

export interface ToolCallData {
  name: string;
  args: Record<string, any>;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  isLoading?: boolean;
  toolCall?: ToolCallData;
}

export interface Thread {
  id: string; // The Document ID (also threadId)
  userId: string;
  title: string;
  messages: Message[];
  updatedAt: number; // Timestamp
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
}

export interface Suggestion {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}