'use client';

import { useActionState } from 'react';
import type {
  Category,
  Listing,
} from '@/types/listing';
import {
  editListingAction,
  type EditListingState,
} from './actions';

interface EditListingFormProps {
  listing: Listing;
  categories: Category[];
  formId?: string;
  publishAfterSave?: boolean;
}

const initialState: EditListingState = {
  error: null,
  success: null,
};

export function EditListingForm({
  listing,
  categories,
  formId,
  publishAfterSave = false,
}: EditListingFormProps) {
  const action = editListingAction.bind(
    null,
    listing.id,
  );

  const [state, formAction] = useActionState(
    action,
    initialState,
  );

  return (
    <form
      id={formId}
      action={formAction}
      className="create-listing-form"
    >
      <input
        type="hidden"
        name="publishAfterSave"
        value={publishAfterSave ? 'true' : 'false'}
      />

      <label>
        Категория

        <select
          name="categoryId"
          defaultValue={listing.categoryId}
          required
        >
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Название

        <input
          type="text"
          name="title"
          defaultValue={listing.title}
          minLength={3}
          maxLength={200}
          required
        />
      </label>

      <label>
        Описание

        <textarea
          name="description"
          defaultValue={listing.description}
          minLength={10}
          maxLength={5000}
          rows={8}
          required
        />
      </label>

      <div className="price-row">
        <label>
          Цена

          <input
            type="number"
            name="price"
            defaultValue={listing.price}
            min="0"
            step="0.01"
            required
          />
        </label>

        <label>
          Валюта

          <select
            name="currency"
            defaultValue={listing.currency}
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>

      <label>
        Местоположение

        <input
          type="text"
          name="location"
          defaultValue={listing.location ?? ''}
          maxLength={200}
          placeholder="Например, Ташкент"
        />
      </label>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="form-success" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
