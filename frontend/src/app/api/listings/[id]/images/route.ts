import { NextResponse } from 'next/server';
import {
  ApiError,
  uploadListingImage,
} from '@/lib/api/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: 'Выберите фотографию' },
        { status: 400 },
      );
    }

    const image = await uploadListingImage(id, file);

    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error('Upload listing image route failed:', error);

    return NextResponse.json(
      { message: 'Не удалось загрузить фотографию.' },
      { status: 500 },
    );
  }
}
