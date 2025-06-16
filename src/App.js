import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [mode, setMode] = useState('manual');
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [light, setLight] = useState(null);
  const [statusA, setStatusA] = useState(false);
  const [statusB, setStatusB] = useState(false);

  // 3초마다 상태, 센서값 가져오기
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/status')
        .then(res => res.json())
        .then(data => {
          setStatusA(data.boardA === 'connected');
          setStatusB(data.boardB === 'connected');
        });

      fetch('http://localhost:5000/sensor')
        .then(res => res.json())
        .then(data => {
          setTemperature(data.temp);
          setHumidity(data.hum);
          setLight(data.light);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 수동일 때만 명령 전송
  const sendCommand = (order) => {
    if (mode === 'auto') return;
    fetch('http://localhost:5000/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
  };

  // 자동/수동 모드 토글
  const toggleMode = () => {
    const newMode = mode === 'manual' ? 'auto' : 'manual';
    setMode(newMode);

    fetch('http://localhost:5000/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: newMode }),
    });
  };

  return (
    <div className="App">
      <h1>🤖 Otto Control Panel</h1>

      <div className="status-container">
        <div className={`board-status ${statusA ? 'connected' : 'disconnected'}`}>
          <strong>Board A:</strong> {statusA ? '🟢 연결됨' : '🔴 끊김'}
        </div>
        <div className={`board-status ${statusB ? 'connected' : 'disconnected'}`}>
          <strong>Board B:</strong> {statusB ? '🟢 연결됨' : '🔴 끊김'}
        </div>
      </div>

      <div className="sensor-box">
        <h3>🧪 센서 정보</h3>
        <p>🌡️ 온도: {temperature !== null ? `${temperature} ℃` : '-- ℃'}</p>
        <p>💧 습도: {humidity !== null ? `${humidity} %` : '-- %'}</p>
        <p>💡 조도: {light !== null ? `${light} lx` : '-- lx'}</p>
      </div>

      <div className="mode-switch">
        <p>모드 전환: 
          <button onClick={toggleMode}>
            {mode === 'manual' ? '수동 → 자동 전환' : '자동 → 수동 전환'}
          </button>
        </p>
        <p className="mode-text">
          현재 모드: <strong>{mode === 'manual' ? '수동 모드' : '자동 모드'}</strong>
        </p>
      </div>

      <div className="control-buttons">
        <button disabled={mode !== 'manual'} onClick={() => sendCommand(1)}>전진</button>
        <button disabled={mode !== 'manual'} onClick={() => sendCommand(2)}>후진</button>
        <button disabled={mode !== 'manual'} onClick={() => sendCommand(0)}>정지</button>
      </div>
    </div>
  );
}

export default App;
