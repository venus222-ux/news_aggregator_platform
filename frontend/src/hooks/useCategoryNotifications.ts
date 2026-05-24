import { useEffect, useRef } from "react";
import echo, { updateEchoToken } from "../lib/echo"; // ← Fixed import
import { useStore } from "../store/useStore";
import { useCategoryStore } from "../store/useCategoryStore"; // ← Better to use this one
import { useNotificationStore } from "../store/useNotificationStore";

export default function useCategoryNotifications() {
  const { isAuth, token } = useStore();
  const { subscriptions } = useCategoryStore(); // ← Changed
  const addNotification = useNotificationStore((s) => s.addNotification);

  const listenedChannels = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard: Echo must be ready
    if (!echo || typeof echo.private !== "function") {
      console.warn("Echo not ready, skipping subscriptions");
      return;
    }

    // Guard: Need auth + token + subscriptions
    if (
      !isAuth ||
      !token ||
      !Array.isArray(subscriptions) ||
      subscriptions.length === 0
    ) {
      return;
    }

    // 🔥 Important: Update token before subscribing
    updateEchoToken(token);

    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log(
      `📡 Setting up subscriptions for ${subscriptions.length} categories`,
    );

    subscriptions.forEach((categoryId) => {
      const channelName = `category.${categoryId}`;

      if (listenedChannels.current.has(channelName)) return;

      try {
        console.log(`🔌 Subscribing to: ${channelName}`);

        const channel = echo.private(channelName);

        channel
          .subscribed(() => {
            console.log(`✅ Successfully subscribed to ${channelName}`);
          })
          .error((err: any) => {
            console.error(`❌ Subscription error on ${channelName}:`, err);
          })
          .listen(".article.created", (data: any) => {
            console.log("🔥 New article received:", data);

            const article = data.article || data;

            addNotification({
              id: (article.id || Date.now()).toString(),
              title: article.title || "New Article",
              url: `/feed`, // Changed to /feed (safer)
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
      initializedRef.current = false;
    };
  }, [isAuth, token, subscriptions, addNotification]);
}
