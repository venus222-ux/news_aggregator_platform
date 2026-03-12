import { useEffect } from "react";
import echo from "../echo";
import { useSubscriptionStore } from "../store/useSubscriptionStore";
import { useNotificationStore } from "../store/useNotificationStore";

export default function useCategoryNotifications() {
  const { subscriptions } = useSubscriptionStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!subscriptions.length) return;

    // Subscribe to all category private channels
    subscriptions.forEach((categoryId) => {
      echo
        .private(`category.${categoryId}`)
        .listen(".article.created", (article: any) => {
          addNotification({
            id: article.id,
            title: article.title,
            url: `/feed`,
          });
        });
    });

    // Cleanup on unmount / subscription change
    return () => {
      subscriptions.forEach((categoryId) => {
        echo.leave(`private-category.${categoryId}`);
      });
    };
  }, [subscriptions, addNotification]);
}
