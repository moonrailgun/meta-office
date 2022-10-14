import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import { Doc } from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import './App.css';

const roomId = 'any-room-id';
const doc = new Doc();
const provider = new SocketIOProvider('ws://localhost:3000', roomId, doc, {});
const data = doc.getMap<number>('data');

provider.on('status', ({ status }: { status: string }) => {
  console.log(status); // Logs "connected" or "disconnected"
});

function App() {
  const [count, setCount] = useState(0);
  const [remote, setRemote] = useState(-1);

  useEffect(() => {
    data.set('count', count);
  }, [count]);

  useEffect(() => {
    setRemote(data.get('count') ?? -1);

    data.observe((e) => {
      setRemote(e.target.get('count') ?? -1);
    });
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Remote Count: {remote}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
