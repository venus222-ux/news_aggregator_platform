// src/echo.ts
import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY || "45879cb0d9cad8bd459c";
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || "eu";

if (!pusherKey) {
  console.error("❌ Pusher Key is missing! Check your .env file.");
}

const echo = new Echo({
  broadcaster: "pusher",
  key: pusherKey,
  cluster: pusherCluster,
  forceTLS: true,
  authEndpoint: "http://localhost:8000/api/broadcasting/auth",
  auth: {
    headers: {
      // Use a getter to ensure we always have the latest token from storage
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },
});

export default echo;
