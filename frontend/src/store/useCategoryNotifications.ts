import { useEffect, useRef } from "react";
import echo, { updateEchoToken } from "../lib/echo";
import { useStore } from "../store/useStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useNotificationStore } from "../store/useNotificationStore";

export default function useCategoryNotifications() {
  const { isAuth, token } = useStore();
  const { subscriptions } = useCategoryStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const channelsRef = useRef<Map<string, any>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only proceed when user is logged in and has subscriptions
    if (!isAuth || !token || !subscriptions || subscriptions.length === 0) {
      return;
    }

    // Update token before any subscription attempt
    updateEchoToken(token);

    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log(
      `📡 Initializing subscriptions for ${subscriptions.length} categories`,
    );

    subscriptions.forEach((categoryId) => {
      const channelName = `category.${categoryId}`;

      if (channelsRef.current.has(channelName)) return;

      console.log(`🔌 Subscribing to ${channelName}`);

      const channel = echo.private(channelName);

      channelsRef.current.set(channelName, channel);

      channel
        .subscribed(() => console.log(`✅ Subscribed: ${channelName}`))
        .error((err: any) =>
          console.error(`❌ Failed to subscribe to ${channelName}:`, err),
        )
        .listen(".article.created", (data: any) => {
          console.log("🔥 New article via WebSocket:", data);

          const article = data.article || data;

          addNotification({
            id: (article.id || Date.now()).toString(),
            title: article.title || "New Article Available",
            url: "/feed",
          });
        });
    });

    // Cleanup on unmount
    return () => {
      channelsRef.current.forEach((_, name) => {
        echo.leave(name);
      });
      channelsRef.current.clear();
      initializedRef.current = false;
    };
  }, [isAuth, token, subscriptions, addNotification]);
}
