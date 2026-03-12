import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "45879cb0d9cad8bd459c",
  cluster: "eu",
  forceTLS: true,
  wsHost: window.location.hostname, // optional for local dev
  wsPort: 6001, // your websocket port
  disableStats: true, // optional
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  },
});

// ✅ Use private channels for authenticated category subscriptions
export default echo;
