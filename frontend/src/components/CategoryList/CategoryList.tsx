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
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <i className="bi bi-grid-3x3-gap-fill me-2"></i>Categories
      </h3>
      <div className={styles.grid}>
        {categories.map((c) => (
          <div key={c.id} className={styles.categoryCard}>
            <div className={styles.cardBody}>
              <div className={styles.iconWrapper}>
                <i className="bi bi-folder2-open"></i>
              </div>
              <h5 className={styles.cardTitle}>{c.name}</h5>
              {!admin && (
                <button
                  className={`${styles.actionBtn} ${subscriptions.includes(c.id) ? styles.unsubBtn : styles.subBtn}`}
                  onClick={() =>
                    subscriptions.includes(c.id)
                      ? unsubscribe(c.id)
                      : subscribe(c.id)
                  }
                >
                  <i
                    className={`bi ${subscriptions.includes(c.id) ? "bi-bell-slash me-2" : "bi-bell me-2"}`}
                  ></i>
                  {subscriptions.includes(c.id) ? "Unsubscribe" : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
