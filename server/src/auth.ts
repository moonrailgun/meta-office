import axios, { AxiosResponse } from 'axios';
import { nanoid } from 'nanoid';

const AUTHEN_URI =
  '/open-apis/authen/v1/index?redirect_uri={REDIRECT_URI}&app_id={APPID}&state={STATE}';
const TENANT_ACCESS_TOKEN_URI =
  '/open-apis/auth/v3/tenant_access_token/internal';
const JSAPI_TICKET_URI = '/open-apis/jssdk/ticket/get';
const USER_ACCESS_TOKEN_URI = '/open-apis/authen/v1/access_token';
const USER_INFO_URI = '/open-apis/authen/v1/user_info';

export class Auth {
  tenantAccessToken: string | null = null;
  expiredAt = 0; // tenantAccessToken什么时候过期

  constructor(
    public host: string,
    public appId: string,
    public appSecret: string
  ) {}

  getUrl(url: string) {
    return this.host + url;
  }

  getAuthUrl(redirectUri: string) {
    const state = nanoid();
    return {
      url: this.getUrl(AUTHEN_URI)
        .replace('{REDIRECT_URI}', redirectUri)
        .replace('{APPID}', this.appId)
        .replace('{STATE}', state),
      state,
    };
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(oauthCode: string) {
    const tenantAccessToken = await this.authorizeTenantAccessToken();
    try {
      const { data: accessTokenObj } = await axios.post(
        this.getUrl(USER_ACCESS_TOKEN_URI),
        {
          grant_type: 'authorization_code',
          code: oauthCode,
        },
        {
          headers: {
            Authorization: 'Bearer ' + tenantAccessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const userAccessToken = accessTokenObj.data.access_token;

      const { data } = await axios.get(this.getUrl(USER_INFO_URI), {
        headers: {
          Authorization: 'Bearer ' + userAccessToken,
          'Content-Type': 'application/json',
        },
      });

      return data.data;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async getTicket() {
    const accessToken = await this.authorizeTenantAccessToken();

    const res = await axios.post(
      this.getUrl(JSAPI_TICKET_URI),
      {},
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = getFeishuData(res);
    return data.data.ticket ?? '';
  }

  async authorizeTenantAccessToken(): Promise<string> {
    if (this.tenantAccessToken && this.expiredAt > Date.now()) {
      // 有值且没过期
      return this.tenantAccessToken;
    }

    // 获取tenant_access_token，基于开放平台能力实现，具体参考文档：https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
    const res = await axios.post(this.getUrl(TENANT_ACCESS_TOKEN_URI), {
      app_id: this.appId,
      app_secret: this.appSecret,
    });

    const data = getFeishuData(res);
    const tenantAccessToken = data.tenant_access_token;
    this.tenantAccessToken = tenantAccessToken;
    this.expiredAt = Date.now() + 1 * 60 * 60 * 1000;
    return tenantAccessToken;
  }
}

function getFeishuData(res: AxiosResponse<any, any>): any {
  if (res.data.code !== 0) {
    throw new FeishuError(res.data);
  }

  return res.data;
}

class FeishuError extends Error {}
