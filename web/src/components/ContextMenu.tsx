import React from 'react';
import styled from 'styled-components';
import { Input, message, Modal } from 'antd';
import {
  PictureOutlined,
  GlobalOutlined,
  FileWordOutlined,
  TableOutlined,
  AppstoreOutlined,
  FormOutlined,
} from '@ant-design/icons';
import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu as _useContextMenu,
  ItemParams,
} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import './ContextMenu.less';
import { useGlobalContext } from '../context';
import { nanoid } from 'nanoid';
import { MediaType, PositionType } from '../const';
import { RoomMediaInfo } from '../type';
import { useEvent } from '../hooks/useEvent';
import { PositionTransformer } from '../hooks/usePlayground';
import urlRegex from 'url-regex';

const ItemText = styled.div({
  marginLeft: 4,
});

const MENU_ID = 'canvas';

export function useContextMenu() {
  return _useContextMenu({
    id: MENU_ID,
  });
}

function _openCreateMediaDialog(
  { triggerEvent }: ItemParams,
  type: MediaType,
  addMedia: (media: RoomMediaInfo) => void,
  positionTransformer: PositionTransformer
) {
  let url = '';
  let desc = '';

  Modal.info({
    className: 'no-icon-modal',
    content: (
      <div>
        <div className="label">请输入描述: </div>
        <Input onChange={(e) => (desc = e.target.value)} autoFocus />

        <div className="label" style={{ marginTop: 12 }}>
          请输入网址:
        </div>
        <Input onChange={(e) => (url = e.target.value)} />
      </div>
    ),
    closable: true,
    onOk: () => {
      if (!desc) {
        message.error('请填写描述！');
        return;
      }

      if (!url) {
        message.error('请填写网址！');
        return;
      }

      if (!urlRegex({ exact: true }).test(url)) {
        message.error('请输入正确的网址！');
        return;
      }

      addMedia({
        id: nanoid(),
        type,
        url,
        desc,
        position: positionTransformer(
          { x: triggerEvent.offsetX, y: triggerEvent.offsetY },
          PositionType.Relative
        ),
      });
    },
  });
}

export const ContextMenu: React.FC = React.memo(() => {
  const {
    playgroundContext: { positionTransformer },
    roomDataContext: { addMedia },
  } = useGlobalContext();

  const openCreateMediaDialog = useEvent(
    (e: ItemParams, mediaType: MediaType) => {
      _openCreateMediaDialog(e, mediaType, addMedia, positionTransformer);
    }
  );

  return (
    <Menu id={MENU_ID} onAuxClick={(e) => console.warn(e)}>
      <Item onClick={(e) => openCreateMediaDialog(e, MediaType.Image)}>
        <PictureOutlined />
        <ItemText>放入图片</ItemText>
      </Item>
      <Item onClick={(e) => openCreateMediaDialog(e, MediaType.WebPage)}>
        <GlobalOutlined />
        <ItemText>放入网页</ItemText>
      </Item>
      <Separator />
      <Submenu label="飞书集成">
        <Item onClick={(e) => openCreateMediaDialog(e, MediaType.MagicMinutes)}>
          <FormOutlined />
          <ItemText>会议妙计</ItemText>
        </Item>
        <Item onClick={(e) => openCreateMediaDialog(e, MediaType.LarkDocs)}>
          <FileWordOutlined />
          <ItemText>飞书文档</ItemText>
        </Item>
        <Item onClick={(e) => openCreateMediaDialog(e, MediaType.LarkSheet)}>
          <TableOutlined />
          <ItemText>多维表格</ItemText>
        </Item>
      </Submenu>
      <Submenu label="第三方集成">
        <Item onClick={(e) => openCreateMediaDialog(e, MediaType.Figma)}>
          <AppstoreOutlined />
          <ItemText>Figma</ItemText>
        </Item>
        <Item onClick={(e) => openCreateMediaDialog(e, MediaType.Excalidraw)}>
          <AppstoreOutlined />
          <ItemText>Excalidraw</ItemText>
        </Item>
      </Submenu>
    </Menu>
  );
});
ContextMenu.displayName = 'ContextMenu';
