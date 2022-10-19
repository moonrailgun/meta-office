import crypto from 'crypto';

/**
 * sha1 编码
 */
export function sha1(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex');
}
