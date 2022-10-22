import { nanoid } from 'nanoid';
import { UserInfo } from './type';

export enum MoveDirection {
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}

export enum MoveType {
  Mouse = 'Mouse',
  Keyboard = 'Keyboard',
}

export const DefaultUserAvatar =
  'https://img0.baidu.com/it/u=3453945757,207386596&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500';

export enum RoomDataType {
  User = 'User',
  Media = 'Media',
}

/**
 * 假用户信息，用于测试
 */
export const fakeUserInfo: UserInfo = {
  id: nanoid(8),
  name: '张三',
  avatar: DefaultUserAvatar,
};

// 发送心跳时间间隔
export const SendHeartbeatTime = 3000;

// 不活跃的心跳间隔阈值
export const NotActiveHeartbeatTime = 1000 * 60 * 5;

export enum PositionType {
  Absolute = 'Absolute',
  Relative = 'Relative',
}

export enum MediaType {
  Image = 'Image',
  WebPage = 'WebPage',
  MagicMinutes = 'MgaicMinutes',
  LarkDocs = 'LarkDocs',
  LarkSheet = 'LarkSheet',
  Figma = 'Figma',
  Excalidraw = 'Excalidraw',
}
