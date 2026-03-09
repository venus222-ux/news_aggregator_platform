import { useEffect, useState } from "react";
import {
  fetchSources,
  createSource,
  deleteSource,
  fetchNewsNow,
} from "../../api";
import styles from "./AdminSources.module.css";

const AdminSources = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    type: "rss",
    url: "",
    api_key: "",
  });

  const load = async () => {
    const res = await fetchSources();
    setSources(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await createSource(form);
    setForm({ name: "", type: "rss", url: "", api_key: "" });
    load();
  };

  const remove = async (id: number) => {
    await deleteSource(id);
    load();
  };

  const handleFetch = async () => {
    await fetchNewsNow();
    load();
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Name</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-fonts"></i>
            </span>
            <input
              className={styles.input}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Type</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-gear"></i>
            </span>
            <select
              className={styles.select}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="rss">RSS</option>
              <option value="api">API</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>URL</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-link-45deg"></i>
            </span>
            <input
              className={styles.input}
              placeholder="URL"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>API Key (optional)</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-key"></i>
            </span>
            <input
              className={styles.input}
              placeholder="API Key (optional)"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            />
          </div>
        </div>

        <button className={styles.addBtn} onClick={submit}>
          <i className="bi bi-plus-lg me-2"></i>Add Source
        </button>
      </div>

      <div className={styles.sourceList}>
        {sources.map((s) => (
          <div key={s.id} className={styles.sourceItem}>
            <div className={styles.sourceInfo}>
              <span className={styles.sourceName}>{s.name}</span>
              <span className={styles.sourceType}>({s.type})</span>
            </div>
            <button className={styles.deleteBtn} onClick={() => remove(s.id)}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <button className={styles.fetchBtn} onClick={handleFetch}>
        <i className="bi bi-arrow-down-circle me-2"></i>Fetch News Now
      </button>
    </div>
  );
};

export default AdminSources;
