import Echo from "laravel-echo";
import Pusher from "pusher-js";

(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "45879cb0d9cad8bd459c",
  cluster: "eu",
  forceTLS: true,
  authEndpoint: "http://localhost:8000/broadcasting/auth",

  auth: {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  },
});

// Better connection logging
echo.connector.pusher.connection.bind("connected", () => {
  console.log("✅ Pusher Connected");
});

echo.connector.pusher.connection.bind("error", (err: any) => {
  console.error("❌ Pusher Connection Error:", err);
});

export const updateEchoToken = (token: string | null) => {
  if (!echo.options.auth) return;

  if (token) {
    echo.options.auth.headers = {
      ...echo.options.auth.headers,
      Authorization: `Bearer ${token}`,
    };

    console.log("🔑 Echo token updated");
  } else {
    delete echo.options.auth.headers?.Authorization;
  }
};

export default echo;
