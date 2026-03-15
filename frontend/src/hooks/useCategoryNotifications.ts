// src/hooks/useCategoryNotifications.ts
import { useEffect, useRef } from "react";
import echo from "../echo";
import { useStore } from "../store/useStore";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useNotificationStore } from "../store/useNotificationStore";

export default function useCategoryNotifications() {
  const { isAuth } = useStore();
  const { subscriptions } = useSubscriptionStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Use a ref to track which channels we are currently listening to
  const listenedChannels = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuth || subscriptions.length === 0) return;

    subscriptions.forEach((categoryId) => {
      const channelName = `category.${categoryId}`;

      // Prevent duplicate listeners on the same channel
      if (listenedChannels.current.has(channelName)) return;

      console.log("📡 Subscribing to:", channelName);

      echo.private(channelName).listen(".article.created", (data: any) => {
        console.log("🔥 Event received for:", channelName, data);

        const article = data.article;
        addNotification({
          id: article.id.toString(),
          title: article.title,
          url: `/articles/${article.id}`,
        });
      });

      listenedChannels.current.add(channelName);
    });

    // Cleanup: When subscriptions change or component unmounts,
    // leave channels and clear the tracked set.
    return () => {
      listenedChannels.current.forEach((channelName) => {
        console.log("🚪 Leaving:", channelName);
        echo.leave(channelName);
      });
      listenedChannels.current.clear();
    };
  }, [subscriptions, isAuth, addNotification]);
}
