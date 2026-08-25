'use client';

import { useActionState } from 'react';
import {
  publishListingAction,
  type PublishListingState,
} from './actions';

const initialState: PublishListingState = {
  error: null,
};

interface PublishButtonProps {
  listingId: string;
}

export function PublishButton({
  listingId,
}: PublishButtonProps) {
  const action = publishListingAction.bind(null, listingId);

  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? 'Публикуем…' : 'Опубликовать объявление'}
      </button>
    </form>
  );
}
