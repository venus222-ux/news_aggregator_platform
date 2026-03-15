// src/echo.ts
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
// Keep this true for now so you can see "Subscription Succeeded" in console
window.Pusher.logToConsole = true;

// src/echo.ts
const echo = new Echo({
  broadcaster: "pusher",
  key: "45879cb0d9cad8bd459c",
  cluster: "eu",
  forceTLS: true,
  // Ensure this matches the prefix in bootstrap/app.php
  authEndpoint: "http://localhost:8000/api/broadcasting/auth",
  auth: {
    headers: {
      get Authorization() {
        return `Bearer ${localStorage.getItem("token")}`;
      },
      Accept: "application/json",
    },
  },
});

export default echo;
