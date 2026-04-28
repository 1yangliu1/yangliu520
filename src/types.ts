export type FuncType = 'chat' | 'drama' | 'seedance' | 'yellowImage' | 'canvasDrama' | 'assets';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  images?: string[];
}

export interface Conversation {
  id: string;
  func: FuncType;
  dramaSubFunc?: string;
  seedanceSubFunc?: string;
  title: string;
  description?: string;
  messages: Message[];
  created: number;
  nodes?: any[];
  edges?: any[];
  history?: { id: string; type: 'image' | 'audio' | 'video'; url: string; timestamp: number }[];
}

export interface Asset {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  name: string;
  createdAt: number;
}

export interface ModelOption {
  id: string;
  name: string;
  badge?: string;
}
