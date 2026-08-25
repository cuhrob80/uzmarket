import 'server-only';

import { cookies } from 'next/headers';
import { createApiUrl } from './config';
import type {
  AuthResponse,
  Category,
  CreateListingInput,
  Listing,
  ListingsPage,
} from '@/types/listing';

export const AUTH_COOKIE_NAME = 'uzmarket_access_token';

interface ApiErrorBody {
  message?: string | string[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;

    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }

    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Ignore malformed or non-JSON error responses.
  }

  return `API request failed with status ${response.status}`;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(createApiUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as AuthResponse;
}

export async function setAuthCookie(accessToken: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function getMyListings(
  page = 1,
  limit = 20,
): Promise<ListingsPage | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const url = createApiUrl('/api/v1/listings/mine');
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as ListingsPage;
}

export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const response = await fetch(createApiUrl('/api/v1/listings'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as Listing;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(createApiUrl('/api/v1/categories'), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as Category[];
}

export async function getMyListing(
  listingId: string,
): Promise<Listing | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(
    createApiUrl(`/api/v1/listings/mine/${encodeURIComponent(listingId)}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as Listing;
}

export async function uploadListingImage(
  listingId: string,
  file: File,
): Promise<Listing['images'][number]> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch(
    createApiUrl(`/api/v1/listings/${encodeURIComponent(listingId)}/images`),
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as Listing['images'][number];
}

export async function deleteListingImage(
  listingId: string,
  imageId: string,
): Promise<void> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const response = await fetch(
    createApiUrl(
      `/api/v1/listings/${encodeURIComponent(listingId)}/images/${encodeURIComponent(imageId)}`,
    ),
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }
}

export async function reorderListingImages(
  listingId: string,
  imageIds: string[],
): Promise<Listing['images']> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const response = await fetch(
    createApiUrl(
      `/api/v1/listings/${encodeURIComponent(listingId)}/images/order`,
    ),
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return (await response.json()) as Listing['images'];
}
