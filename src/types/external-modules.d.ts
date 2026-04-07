declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
  }

  interface GeneratedSecret {
    base32: string;
    hex: string;
    ascii: string;
    otpauth_url?: string;
    google_auth_qr?: string;
  }

  interface VerifyTOTPOptions {
    secret: string;
    encoding?: string;
    token: string;
    window?: number;
  }

  export function generateSecret(options: GenerateSecretOptions): GeneratedSecret;
  export const totp: {
    verify(options: VerifyTOTPOptions): boolean;
  };
}

declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>;
}

declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    tag?: string;
  }

  export function setVapidDetails(mailto: string, publicKey: string, privateKey: string): void;
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer
  ): Promise<any>;
}
