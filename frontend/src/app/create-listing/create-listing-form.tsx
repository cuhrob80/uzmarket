'use client';

import { useActionState, useState } from 'react';
import {
  createListingAction,
  type CreateListingState,
} from './actions';
import type { Category } from '@/types/listing';

interface CreateListingFormProps {
  categories: Category[];
}

const initialState: CreateListingState = {
  error: null,
};

function getCategoryDepth(
  category: Category,
  categories: Category[],
): number {
  let depth = 0;
  let parentId = category.parentId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = categories.find((item) => item.id === parentId);

    if (!parent) {
      break;
    }

    depth += 1;
    parentId = parent.parentId;
  }

  return depth;
}

function belongsToRoot(
  category: Category | undefined,
  rootSlug: string,
  categories: Category[],
): boolean {
  let current = category;
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    if (current.slug === rootSlug) {
      return true;
    }

    visited.add(current.id);
    current = categories.find((item) => item.id === current?.parentId);
  }

  return false;
}

function getRootCategories(categories: Category[]): Category[] {
  return categories
    .filter((category) => !category.parentId)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru'),
    );
}

function getRootOptions(
  root: Category,
  categories: Category[],
): Category[] {
  return categories
    .filter((category) => belongsToRoot(category, root.slug, categories))
    .sort((a, b) => {
      const depthDifference =
        getCategoryDepth(a, categories) - getCategoryDepth(b, categories);

      if (depthDifference !== 0) {
        return depthDifference;
      }

      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru');
    });
}

export function CreateListingForm({
  categories,
}: CreateListingFormProps) {
  const [state, formAction, pending] = useActionState(
    createListingAction,
    initialState,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const isJobsCategory = belongsToRoot(
    selectedCategory,
    'jobs',
    categories,
  );
  const rootCategories = getRootCategories(categories);

  return (
    <form action={formAction} className="create-listing-form">
      <label>
        Категория
        <select
          name="categoryId"
          required
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
          disabled={pending}
        >
          <option value="" disabled>
            Выберите категорию
          </option>

          {rootCategories.map((root) => (
            <optgroup key={root.id} label={root.name}>
              {getRootOptions(root, categories).map((category) => {
                const depth = getCategoryDepth(category, categories);
                const label =
                  depth === 0
                    ? `Все объявления — ${root.name}`
                    : `${'— '.repeat(depth)}${category.name}`;

                return (
                  <option key={category.id} value={category.id}>
                    {label}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
      </label>

      {isJobsCategory ? (
        <label>
          Тип объявления
          <select name="jobType" defaultValue="" required disabled={pending}>
            <option value="" disabled>
              Выберите тип
            </option>
            <option value="vacancy">Вакансия — ищу сотрудника</option>
            <option value="resume">Резюме — ищу работу</option>
          </select>
        </label>
      ) : null}

      <label>
        Название объявления
        <input
          name="title"
          type="text"
          minLength={3}
          maxLength={200}
          placeholder="Например: iPhone 15 Pro 256 GB"
          required
          disabled={pending}
        />
      </label>

      <label>
        Описание
        <textarea
          name="description"
          minLength={1}
          maxLength={10000}
          rows={7}
          placeholder="Опишите товар или услугу"
          required
          disabled={pending}
        />
      </label>

      <div className="price-fields">
        <label>
          Цена
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            required
            disabled={pending}
          />
        </label>

        <label>
          Валюта
          <select
            name="currency"
            defaultValue="UZS"
            required
            disabled={pending}
          >
            <option value="UZS">Сум (UZS)</option>
            <option value="USD">Доллар (USD)</option>
          </select>
        </label>
      </div>

      <label>
        Местоположение
        <input
          name="location"
          type="text"
          maxLength={255}
          placeholder="Например: Ташкент"
          disabled={pending}
        />
      </label>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Сохраняем…' : 'Продолжить'}
      </button>

      <p className="create-listing-hint">
        Сначала объявление сохранится как черновик. После этого
        можно будет добавить фотографии и опубликовать его.
      </p>
    </form>
  );
}
