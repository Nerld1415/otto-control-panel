const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ 전역 상태 저장 변수
let status = { boardA: 'disconnected', boardB: 'disconnected' };
let sensor = { temp: null, hum: null, light: null };

// ✅ MQTT 브로커 설정
const mqttClient = mqtt.connect('mqtt://broker.emqx.io');
const intopic = 'i2r/warnold2114@gmail.com/out';
const sensortopic = 'i2r/sensor';
const controlTopic = 'i2r/warnold2114@gmail.com/in';

mqttClient.on('connect', () => {
  console.log('📡 MQTT 브로커 연결 완료');
  mqttClient.subscribe([intopic, sensortopic], (err) => {
    if (!err) {
      console.log(`📥 구독 시작: ${intopic}, ${sensortopic}`);
    }
  });
});

// ✅ MQTT 메시지 수신 처리
mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === intopic && data.id) {
      if (data.id === 'boardA') status.boardA = data.status || 'connected';
      if (data.id === 'boardB') status.boardB = data.status || 'connected';
    }

    if (topic === sensortopic) {
      sensor.temp = data.temp;
      sensor.hum = data.hum;
      sensor.light = data.light;
    }
  } catch (e) {
    console.error('❌ MQTT 메시지 파싱 오류:', e.message);
  }
});

// ✅ React 요청 처리
app.get('/status', (req, res) => {
  res.json(status);
});

app.get('/sensor', (req, res) => {
  res.json(sensor);
});

app.post('/send', (req, res) => {
  console.log('📩 React에서 명령 수신:', req.body);
  mqttClient.publish(controlTopic, JSON.stringify(req.body));
  res.json({ success: true });
});

// ✅ 서버 실행
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
