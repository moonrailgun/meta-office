import { memo, ReactNode } from 'react';
import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { endpoint } from './api';
import './App.css';
import { LoginButton } from './components/login-button';
import { GlobalContextProvider } from './context';

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
  return (
    <div className="App">
      <AppInner>
        <LoginButton />
      </AppInner>
    </div>
  );
};

export default App;
