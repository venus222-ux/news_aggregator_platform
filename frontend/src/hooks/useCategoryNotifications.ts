import { useEffect, useRef } from "react";
import echo from "../echo";
import { useStore } from "../store/useStore";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useNotificationStore } from "../store/useNotificationStore";

export default function useCategoryNotifications() {
  const { isAuth } = useStore();
  const { subscriptions } = useSubscriptionStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const listenedChannels = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Guard: Echo must be ready and have the required method
    if (!echo || typeof echo.private !== "function") {
      console.warn("Echo not ready, skipping subscriptions");
      return;
    }

    // Guard: subscriptions must be an array
    if (
      !isAuth ||
      !Array.isArray(subscriptions) ||
      subscriptions.length === 0
    ) {
      return;
    }

    subscriptions.forEach((categoryId) => {
      const channelName = `category.${categoryId}`;
      if (listenedChannels.current.has(channelName)) return;

      try {
        echo.private(channelName).listen(".article.created", (data: any) => {
          const article = data.article;
          addNotification({
            id: article.id.toString(),
            title: article.title,
            url: `/articles/${article.id}`,
          });
        });
        listenedChannels.current.add(channelName);
      } catch (err) {
        console.error(`Failed to subscribe to ${channelName}:`, err);
      }
    });

    // Cleanup
    return () => {
      listenedChannels.current.forEach((channelName) => {
        if (echo && typeof echo.leave === "function") {
          echo.leave(channelName);
        }
      });
      listenedChannels.current.clear();
    };
  }, [subscriptions, isAuth, addNotification]);
}
