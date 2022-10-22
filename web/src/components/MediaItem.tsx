import {
  AppstoreOutlined,
  CopyOutlined,
  FileWordOutlined,
  FormOutlined,
  GlobalOutlined,
  LinkOutlined,
  PictureOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Popover, Tag } from 'antd';
import React, { memo, ReactNode } from 'react';
import styled from 'styled-components';
import { MediaType } from '../const';
import { useGlobalContext } from '../context';
import { RoomMediaInfo } from '../type';

const MediaTypeIcon: Record<MediaType, { Icon: ReactNode; color: string }> = {
  [MediaType.Image]: { Icon: <PictureOutlined />, color: 'orange' },
  [MediaType.WebPage]: { Icon: <GlobalOutlined />, color: 'blue' },
  [MediaType.MagicMinutes]: { Icon: <FormOutlined />, color: 'red' },
  [MediaType.LarkDocs]: { Icon: <FileWordOutlined />, color: 'volcano' },
  [MediaType.LarkSheet]: { Icon: <TableOutlined />, color: 'magenta' },
  [MediaType.Figma]: { Icon: <AppstoreOutlined />, color: 'geekblue' },
  [MediaType.Excalidraw]: { Icon: <AppstoreOutlined />, color: 'cyan' },
};

const MediaItemContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

interface MediaItemProps {
  roomMedia: RoomMediaInfo;
}

export const MediaItem: React.FC<MediaItemProps> = memo(({ roomMedia }) => {
  const { id, desc, type, position } = roomMedia;
  const { Icon, color } = MediaTypeIcon[type];
  const {
    roomDataContext: { delMedia },
  } = useGlobalContext();

  const ContentCMP = MediaContentCMP[type];

  return (
    <Popover trigger={['click']} content={<ContentCMP roomMedia={roomMedia} />}>
      <MediaItemContainer style={{ left: position.x, top: position.y }}>
        <Tag
          color={color}
          closable={true}
          onClose={() => delMedia(id)}
          icon={Icon}
        >
          {desc}
        </Tag>

        {roomMedia.type === MediaType.Image && (
          <SmallImage src={roomMedia.url} />
        )}
      </MediaItemContainer>
    </Popover>
  );
});

interface MediaItemContentProps {
  roomMedia: RoomMediaInfo;
}

const WebpageContent = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;

  .iframe {
    height: 300px;
    border: none;
  }
`;

const Link = styled.a`
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 4px;
`;

const WebpageMediaContent: React.FC<MediaItemContentProps> = memo(
  ({ roomMedia }) => {
    return (
      <WebpageContent>
        <Link href={roomMedia.url}>{roomMedia.url}</Link>

        <iframe className="iframe" src={roomMedia.url} />
      </WebpageContent>
    );
  }
);

const ImageContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 400px;
    max-height: 400px;
  }
`;

const SmallImage = styled.img`
  max-width: 100px;
  max-height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageMediaContent: React.FC<MediaItemContentProps> = memo(
  ({ roomMedia }) => {
    return (
      <ImageContent>
        <img src={roomMedia.url} />
      </ImageContent>
    );
  }
);

const MediaContentCMP: Record<MediaType, React.FC<MediaItemContentProps>> = {
  [MediaType.Image]: ImageMediaContent,
  [MediaType.WebPage]: WebpageMediaContent,
  [MediaType.MagicMinutes]: WebpageMediaContent,
  [MediaType.LarkDocs]: WebpageMediaContent,
  [MediaType.LarkSheet]: WebpageMediaContent,
  [MediaType.Figma]: WebpageMediaContent,
  [MediaType.Excalidraw]: WebpageMediaContent,
};
