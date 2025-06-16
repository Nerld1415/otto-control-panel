import mqtt from "mqtt";

const MQTT_BROKER = "wss://broker.emqx.io:8084/mqtt"; // ✅ 여기 emqx 주소로 복구
const options = {
  connectTimeout: 4000,
  clientId: "react_client_" + Math.random().toString(16).substr(2, 8),
};

const client = mqtt.connect(MQTT_BROKER, options);

export default client;
