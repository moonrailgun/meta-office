export interface UserInfo {
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
  time: string;
  content: string;
}
