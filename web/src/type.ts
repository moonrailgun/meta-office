export interface UserInfo {
  username: string;
}

export interface AuthConfigParams {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
}
