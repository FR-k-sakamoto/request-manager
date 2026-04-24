"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createCategory,
  toggleCategoryStatus,
  updateCategory,
  type CategoryActionState,
} from "./actions";
import styles from "./page.module.css";

export type CategoryListItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

const initialActionState: CategoryActionState = {
  status: "idle",
  message: "",
};

type CategoriesClientProps = {
  categories: CategoryListItem[];
};

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createCategory, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <div className={styles.contentGrid}>
      <section className={styles.card} aria-labelledby="new-category-title">
        <div className={styles.cardHeader}>
          <h2 id="new-category-title">新規カテゴリ追加</h2>
        </div>

        <form ref={formRef} action={formAction} className={styles.form}>
          <label className={styles.field}>
            <span>カテゴリ名</span>
            <input name="name" type="text" required maxLength={80} />
          </label>

          <label className={styles.field}>
            <span>説明</span>
            <textarea name="description" rows={4} maxLength={240} />
          </label>

          <fieldset className={styles.radioField}>
            <legend>状態</legend>
            <label>
              <input name="isActive" type="radio" value="true" defaultChecked />
              <span>有効</span>
            </label>
            <label>
              <input name="isActive" type="radio" value="false" />
              <span>無効</span>
            </label>
          </fieldset>

          <button className={styles.primaryButton} type="submit" disabled={pending}>
            {pending ? "追加中" : "追加する"}
          </button>

          <ActionMessage state={state} />
        </form>
      </section>

      <section className={styles.card} aria-labelledby="category-list-title">
        <div className={styles.cardHeader}>
          <h2 id="category-list-title">登録済みカテゴリ一覧</h2>
        </div>

        {categories.length === 0 ? (
          <p className={styles.emptyText}>登録済みカテゴリはありません。</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">カテゴリ名</th>
                  <th scope="col">説明</th>
                  <th scope="col">状態</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryListItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, editAction, editPending] = useActionState(updateCategory, initialActionState);
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleCategoryStatus,
    initialActionState,
  );

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4}>
          <form action={editAction} className={styles.editForm}>
            <input type="hidden" name="id" value={category.id} />

            <label className={styles.field}>
              <span>カテゴリ名</span>
              <input name="name" type="text" required maxLength={80} defaultValue={category.name} />
            </label>

            <label className={styles.field}>
              <span>説明</span>
              <textarea
                name="description"
                rows={3}
                maxLength={240}
                defaultValue={category.description ?? ""}
              />
            </label>

            <fieldset className={styles.radioField}>
              <legend>状態</legend>
              <label>
                <input
                  name="isActive"
                  type="radio"
                  value="true"
                  defaultChecked={category.isActive}
                />
                <span>有効</span>
              </label>
              <label>
                <input
                  name="isActive"
                  type="radio"
                  value="false"
                  defaultChecked={!category.isActive}
                />
                <span>無効</span>
              </label>
            </fieldset>

            <div className={styles.rowActions}>
              <button className={styles.primaryButton} type="submit" disabled={editPending}>
                {editPending ? "保存中" : "保存する"}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={editPending}
              >
                キャンセル
              </button>
            </div>

            <ActionMessage state={editState} />
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className={styles.nameCell}>{category.name}</td>
      <td>{category.description || "－"}</td>
      <td>
        <span className={category.isActive ? styles.activeBadge : styles.inactiveBadge}>
          {category.isActive ? "有効" : "無効"}
        </span>
      </td>
      <td>
        <div className={styles.actionsCell}>
          <button className={styles.secondaryButton} type="button" onClick={() => setIsEditing(true)}>
            編集
          </button>

          <form action={toggleAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="isActive" value={String(!category.isActive)} />
            <button className={styles.secondaryButton} type="submit" disabled={togglePending}>
              {togglePending ? "変更中" : category.isActive ? "無効化" : "有効化"}
            </button>
          </form>

          <ActionMessage state={toggleState} compact />
        </div>
      </td>
    </tr>
  );
}

function ActionMessage({
  state,
  compact = false,
}: {
  state: CategoryActionState;
  compact?: boolean;
}) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`${compact ? styles.compactMessage : styles.message} ${
        state.status === "error" ? styles.errorMessage : styles.successMessage
      }`}
    >
      {state.message}
    </p>
  );
}
