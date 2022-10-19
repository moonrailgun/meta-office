import axios, { AxiosResponse } from 'axios';

const TENANT_ACCESS_TOKEN_URI =
  '/open-apis/auth/v3/tenant_access_token/internal';
const JSAPI_TICKET_URI = '/open-apis/jssdk/ticket/get';

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
