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

function getCategoryLabel(
  category: Category,
  categories: Category[],
): string {
  if (!category.parentId) {
    return category.name;
  }

  const parent = categories.find(
    (item) => item.id === category.parentId,
  );

  return parent
    ? `${parent.name} → ${category.name}`
    : category.name;
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
  const selectedParent = categories.find(
    (category) => category.id === selectedCategory?.parentId,
  );
  const isJobsCategory =
    selectedCategory?.slug === 'jobs' || selectedParent?.slug === 'jobs';

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

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {getCategoryLabel(category, categories)}
            </option>
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
