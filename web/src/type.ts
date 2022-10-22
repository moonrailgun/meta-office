import { MediaType } from './const';

export interface LarkUserInfo {
  avatar_big: string;
  avatar_middle: string;
  avatar_thumb: string;
  avatar_url: string;
  en_name: string;
  name: string;
  open_id: string;
  tenant_key: string;
  union_id: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface AuthConfigParams {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Message {
  time: number;
  content: string;
}

export interface RoomUserInfo {
  id: string;
  name: string;
  avatar: string;
  position: Position;
  lastMessage?: Message;
  lastHeartbeat: number;
  peerId: string;
}

export interface RoomMediaInfo {
  id: string;
  type: MediaType;
  desc: string;
  url: string;
  position: Position;
}
