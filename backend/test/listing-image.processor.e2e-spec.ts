import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import {
  ListingImageProcessor,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from '../src/listings/listing-image.processor';

describe('ListingImageProcessor', () => {
  const processor = new ListingImageProcessor();

  it('processes a valid JPEG into WebP', async () => {
    const input = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 120, g: 80, b: 40 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await processor.process(input, 'image/jpeg');

    expect(result.mimeType).toBe('image/webp');
    expect(result.width).toBe(1600);
    expect(result.height).toBe(1200);
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('rejects images that are too small', async () => {
    const input = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    await expect(processor.process(input, 'image/jpeg')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects fake image content', async () => {
    await expect(
      processor.process(Buffer.from('not-an-image'), 'image/jpeg'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects files that exceed the maximum size', async () => {
    const input = Buffer.alloc(MAX_IMAGE_FILE_SIZE_BYTES + 1);

    await expect(processor.process(input)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('resizes large images to a maximum dimension of 2048 pixels', async () => {
    const input = await sharp({
      create: {
        width: 4000,
        height: 3000,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await processor.process(input, 'image/jpeg');

    expect(result.mimeType).toBe('image/webp');
    expect(result.width).toBe(2048);
    expect(result.height).toBe(1536);
  });
});
