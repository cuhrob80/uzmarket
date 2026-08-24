import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { Metadata } from 'sharp';

export const MAX_IMAGE_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 50_000_000;
export const MAX_IMAGE_DIMENSION = 12_000;
export const MIN_IMAGE_DIMENSION = 400;
export const OUTPUT_IMAGE_MAX_DIMENSION = 2048;

const FORMAT_MIME_TYPES: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heif: 'image/avif',
};

export interface ProcessedListingImage {
  buffer: Buffer;
  mimeType: 'image/webp';
  width: number;
  height: number;
  fileSizeBytes: number;
}

@Injectable()
export class ListingImageProcessor {
  async process(
    input: Buffer,
    declaredMimeType?: string,
  ): Promise<ProcessedListingImage> {
    if (!input.length) {
      throw new BadRequestException('Image file is empty');
    }

    if (input.length > MAX_IMAGE_FILE_SIZE_BYTES) {
      throw new BadRequestException('Image file is too large');
    }

    let metadata: Metadata;

    try {
      metadata = await sharp(input, {
        failOn: 'error',
        limitInputPixels: MAX_IMAGE_PIXELS,
      }).metadata();
    } catch {
      throw new BadRequestException('Invalid or unsupported image');
    }

    const detectedMimeType = metadata.format
      ? FORMAT_MIME_TYPES[metadata.format]
      : undefined;

    if (!detectedMimeType) {
      throw new BadRequestException('Unsupported image format');
    }

    if (declaredMimeType && declaredMimeType !== detectedMimeType) {
      throw new BadRequestException(
        'Image content does not match its MIME type',
      );
    }

    const width = metadata.width;
    const height = metadata.height;

    if (!width || !height) {
      throw new BadRequestException(
        'Image dimensions could not be determined',
      );
    }

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      throw new BadRequestException('Image dimensions are too large');
    }

    if (width * height > MAX_IMAGE_PIXELS) {
      throw new BadRequestException('Image has too many pixels');
    }

    if (Math.min(width, height) < MIN_IMAGE_DIMENSION) {
      throw new BadRequestException('Image dimensions are too small');
    }

    try {
      const output = await sharp(input, {
        failOn: 'error',
        limitInputPixels: MAX_IMAGE_PIXELS,
      })
        .rotate()
        .resize({
          width: OUTPUT_IMAGE_MAX_DIMENSION,
          height: OUTPUT_IMAGE_MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
          effort: 4,
        })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: output.data,
        mimeType: 'image/webp',
        width: output.info.width,
        height: output.info.height,
        fileSizeBytes: output.data.length,
      };
    } catch {
      throw new BadRequestException('Image processing failed');
    }
  }
}
