import { useEffect, useState } from "react";
import { useCategoryStore } from "../../store/useCategoryStore";
import API from "../../api";
import styles from "./AdminCategories.module.css";

const AdminCategories = () => {
  const {
    categories,
    fetchAll,
    addCategory: addToStore,
    updateCategory: updateInStore,
    removeCategory: removeFromStore,
  } = useCategoryStore();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  // Add new category
  const addCategory = async () => {
    setError(null);
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    if (
      categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setError("Category already exists");
      return;
    }

    try {
      const res = await API.post("/categories", { name: trimmedName });
      addToStore(res.data);
      setNewName("");
    } catch (err) {
      console.error(err);
      setError("Failed to add category");
    }
  };

  // Delete category
  const deleteCategory = async (id: number) => {
    try {
      await API.delete(`/categories/${id}`);
      removeFromStore(id);
    } catch (err) {
      console.error(err);
      setError("Failed to delete category");
    }
  };

  // Start editing a category
  const startEdit = (id: number, name: string) => {
    setEditId(id);
    setEditName(name);
    setError(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setError(null);
  };

  // Update category
  const updateCategory = async (id: number) => {
    setError(null);
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    if (
      categories.some(
        (c) =>
          c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== id,
      )
    ) {
      setError("Category already exists");
      return;
    }

    try {
      const res = await API.put(`/categories/${id}`, { name: trimmedName });
      // Use backend-provided slug
      updateInStore(id, res.data.name, res.data.slug);
      cancelEdit();
    } catch (err) {
      console.error(err);
      setError("Failed to update category");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.addSection}>
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <i className="bi bi-tag"></i>
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <button className={styles.addBtn} onClick={addCategory}>
          <i className="bi bi-plus-lg me-2"></i>Add Category
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.categoryList}>
        {categories.map((c) => (
          <div key={c.id} className={styles.categoryItem}>
            {editId === c.id ? (
              <>
                <div className={styles.editGroup}>
                  <div className={styles.inputGroup}>
                    <span className={styles.inputIcon}>
                      <i className="bi bi-pencil"></i>
                    </span>
                    <input
                      type="text"
                      className={styles.input}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <small className={styles.slugPreview}>
                    Slug preview:{" "}
                    {editName.toLowerCase().trim().replace(/\s+/g, "-")}
                  </small>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.actionBtnSave}
                    onClick={() => updateCategory(c.id)}
                  >
                    <i className="bi bi-check-lg"></i>
                  </button>
                  <button
                    className={styles.actionBtnCancel}
                    onClick={cancelEdit}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className={styles.categoryName}>{c.name}</span>
                <div className={styles.actions}>
                  <button
                    className={styles.actionBtnEdit}
                    onClick={() => startEdit(c.id, c.name)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className={styles.actionBtnDelete}
                    onClick={() => deleteCategory(c.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
