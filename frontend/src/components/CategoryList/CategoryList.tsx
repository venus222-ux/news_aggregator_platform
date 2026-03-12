import { useEffect } from "react";
import { useCategoryStore } from "../../store/useCategoryStore";
import styles from "./CategoryList.module.css";

const CategoryList = ({ admin = false }) => {
  const {
    categories,
    subscriptions,
    fetchAll,
    fetchSubscriptions,
    subscribe,
    unsubscribe,
  } = useCategoryStore();

  useEffect(() => {
    fetchAll();
    fetchSubscriptions();
  }, [fetchAll, fetchSubscriptions]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h3 className={styles.title}>
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>Topic Categories
          </h3>
          <p className={styles.subtitle}>
            Choose the topics you want to see in your personalized feed.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {categories.map((c) => {
          const isSubscribed = subscriptions.includes(c.id);

          return (
            <div
              key={c.id}
              className={`${styles.categoryCard} ${isSubscribed ? styles.activeCard : ""}`}
            >
              <div className={styles.cardBody}>
                <div className={styles.iconWrapper}>
                  <i
                    className={`bi ${isSubscribed ? "bi-check2-circle" : "bi-hash"}`}
                  ></i>
                </div>

                <div className={styles.content}>
                  <h5 className={styles.cardTitle}>{c.name}</h5>
                  <span className={styles.badge}>
                    {isSubscribed ? "Subscribed" : "Available"}
                  </span>
                </div>

                {!admin && (
                  <button
                    className={`${styles.actionBtn} ${isSubscribed ? styles.unsubBtn : styles.subBtn}`}
                    onClick={() =>
                      isSubscribed ? unsubscribe(c.id) : subscribe(c.id)
                    }
                  >
                    <i
                      className={`bi ${isSubscribed ? "bi-bell-slash" : "bi-bell"}`}
                    ></i>
                    <span>{isSubscribed ? "Unsubscribe" : "Subscribe"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryList;
