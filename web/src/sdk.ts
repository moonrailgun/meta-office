declare global {
  interface Window {
    h5sdk: any;
  }
}

class FeishuSDK {
  valid(): boolean {
    return Boolean(window.h5sdk);
  }

  get h5sdk() {
    return window.h5sdk;
  }

  get tt(): any {
    return (window as any).tt;
  }
}

export const feishuSDK = new FeishuSDK();
