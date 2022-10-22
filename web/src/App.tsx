import { memo, ReactNode, useCallback } from 'react';
import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { endpoint } from './api';
import { LoginButton } from './components/LoginButton';
import { GlobalContextProvider } from './context';
import styles from './App.module.less';
import { RoomSwitch } from './components/RoomSwitch';
import { useRTCClientStore } from './rtc/store';
import { RoomId } from './components/RoomID';
import { Header } from './components/Header';
import { ProduceInfo } from './components/ProduceInfo';
import { Playground } from './components/Playground';
import { Peer } from './rtc/Peer';
import 'antd/dist/antd.css';

const roomId = 'any-room-id';
const doc = new Doc();
const provider = new SocketIOProvider(endpoint, roomId, doc, {});
const data = doc.getMap<number>('data');

provider.on('status', ({ status }: { status: string }) => {
  console.log(status); // Logs "connected" or "disconnected"
});

const AppInner: React.FC<{ children: ReactNode }> = memo(({ children }) => {
  return <GlobalContextProvider>{children}</GlobalContextProvider>;
});

const App: React.FC = () => {
  const { peers } = useRTCClientStore();

  return (
    <div className={styles.App}>
      <AppInner>
        <Header />

        <div className={styles.mainContent}>
          <RoomId />

          <ProduceInfo />

          <LoginButton />

          {/* 临时放一下，用于调试 */}
          {peers.map((peer) => (
            <div key={peer.id}>
              用户: {peer.displayName}({peer.id})
              <Peer peerId={peer.id} volume={1} />
            </div>
          ))}
          {JSON.stringify(peers)}

          <Playground />
        </div>
      </AppInner>
    </div>
  );
};

export default App;
