import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

// We keep token in a simple variable (clean + predictable)
let authToken: string | null = null;

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: true,

  authEndpoint: "http://localhost:8000/broadcasting/auth",

  auth: {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",

      // IMPORTANT: always read latest token
      get Authorization() {
        return authToken ? `Bearer ${authToken}` : "";
      },
    },
  },
});

// Connection logs
echo.connector.pusher.connection.bind("connected", () => {
  console.log("✅ Pusher Connected");
});

echo.connector.pusher.connection.bind("error", (err: any) => {
  console.error("❌ Pusher Error:", err);
});

//
// ✅ SAFE TOKEN UPDATE (no mutation bugs)
//
export const setEchoToken = (token: string | null) => {
  authToken = token;
  console.log("🔑 Echo token updated");
};

export default echo;
