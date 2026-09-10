'use client';

import { useActionState } from 'react';
import type {
  Category,
  Listing,
} from '@/types/listing';
import type { SiteLocale } from '@/lib/locale-path';
import { getDictionary } from '@/i18n/dictionaries';
import { getCategoryName } from '@/lib/category-i18n';
import {
  editListingAction,
  type EditListingState,
} from './actions';

interface EditListingFormProps {
  listing: Listing;
  categories: Category[];
  formId?: string;
  publishAfterSave?: boolean;
  locale: SiteLocale;
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
  locale,
}: EditListingFormProps) {
  const text = getDictionary(locale).listingEditor;
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
        {text.category}

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
              {getCategoryName(category, locale)}
            </option>
          ))}
        </select>
      </label>

      <label>
        {text.name}

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
        {text.description}

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
          {text.price}

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
          {text.currency}

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
        {text.location}

        <input
          type="text"
          name="location"
          defaultValue={listing.location ?? ''}
          maxLength={200}
          placeholder={text.locationExample}
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
