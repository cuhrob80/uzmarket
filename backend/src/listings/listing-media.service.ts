import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import {
  Listing,
  ListingImage,
  ListingStatus,
} from '../entities';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage.types';
import { ListingImageProcessor } from './listing-image.processor';

export const MAX_LISTING_IMAGES = 10;

export interface AddListingImageRecord {
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

@Injectable()
export class ListingMediaService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
    private readonly imageProcessor: ListingImageProcessor,
  ) {}

  async uploadImage(
    listingId: string,
    sellerId: string,
    file: Express.Multer.File,
  ): Promise<ListingImage> {
    await this.assertCanStartUpload(listingId, sellerId);

    const processed = await this.imageProcessor.process(
      file.buffer,
      file.mimetype,
    );

    const storageKey =
      `listings/${listingId}/${randomUUID()}.webp`;

    await this.storage.putObject({
      key: storageKey,
      body: processed.buffer,
      contentType: processed.mimeType,
    });

    try {
      return await this.addImageRecord(listingId, sellerId, {
        storageKey,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        fileSizeBytes: processed.fileSizeBytes,
      });
    } catch (error) {
      await this.storage.deleteObject(storageKey);
      throw error;
    }
  }

  async deleteImage(
    listingId: string,
    imageId: string,
    sellerId: string,
  ): Promise<void> {
    const storageKey = await this.dataSource.transaction(async (manager) => {
      const listing = await this.findOwnedListingForUpdate(
        manager,
        listingId,
        sellerId,
      );

      this.assertEditableStatus(listing);

      const imagesRepository = manager.getRepository(ListingImage);
      const image = await imagesRepository.findOne({
        where: {
          id: imageId,
          listingId,
        },
      });

      if (!image) {
        throw new NotFoundException('Listing image not found');
      }

      await imagesRepository.remove(image);

      const remainingImages = await imagesRepository.find({
        where: { listingId },
        order: {
          sortOrder: 'ASC',
          createdAt: 'ASC',
        },
      });

      for (let index = 0; index < remainingImages.length; index += 1) {
        remainingImages[index].sortOrder = index;
      }

      if (remainingImages.length) {
        await imagesRepository.save(remainingImages);
      }

      return image.storageKey;
    });

    if (storageKey) {
      await this.storage.deleteObject(storageKey);
    }
  }

  async reorderImages(
    listingId: string,
    sellerId: string,
    imageIds: string[],
  ): Promise<ListingImage[]> {
    return this.dataSource.transaction(async (manager) => {
      const listing = await this.findOwnedListingForUpdate(
        manager,
        listingId,
        sellerId,
      );

      this.assertEditableStatus(listing);

      const imagesRepository = manager.getRepository(ListingImage);
      const images = await imagesRepository.find({
        where: { listingId },
        order: {
          sortOrder: 'ASC',
          createdAt: 'ASC',
        },
      });

      if (imageIds.length !== images.length) {
        throw new BadRequestException(
          'Image order must contain all listing images',
        );
      }

      const uniqueImageIds = new Set(imageIds);

      if (uniqueImageIds.size !== imageIds.length) {
        throw new BadRequestException(
          'Image order contains duplicate image IDs',
        );
      }

      const imagesById = new Map(
        images.map((image) => [image.id, image]),
      );

      for (const imageId of imageIds) {
        if (!imagesById.has(imageId)) {
          throw new BadRequestException(
            'Image order contains an invalid listing image',
          );
        }
      }

      const reorderedImages = imageIds.map((imageId, index) => {
        const image = imagesById.get(imageId);

        if (!image) {
          throw new BadRequestException(
            'Image order contains an invalid listing image',
          );
        }

        image.sortOrder = index;
        return image;
      });

      if (reorderedImages.length) {
        await imagesRepository.save(reorderedImages);
      }

      return reorderedImages;
    });
  }

  async addImageRecord(
    listingId: string,
    sellerId: string,
    input: AddListingImageRecord,
  ): Promise<ListingImage> {
    return this.dataSource.transaction(async (manager) => {
      const listing = await this.findOwnedListingForUpdate(
        manager,
        listingId,
        sellerId,
      );

      this.assertEditableStatus(listing);

      const imagesRepository = manager.getRepository(ListingImage);
      const currentCount = await imagesRepository.count({
        where: { listingId },
      });

      if (currentCount >= MAX_LISTING_IMAGES) {
        throw new BadRequestException(
          `A listing can have at most ${MAX_LISTING_IMAGES} images`,
        );
      }

      const image = imagesRepository.create({
        listingId,
        url: this.storage.getPublicUrl(input.storageKey),
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        fileSizeBytes: String(input.fileSizeBytes),
        sortOrder: currentCount,
      });

      return imagesRepository.save(image);
    });
  }

  private async assertCanStartUpload(
    listingId: string,
    sellerId: string,
  ): Promise<void> {
    const listingsRepository = this.dataSource.getRepository(Listing);
    const imagesRepository = this.dataSource.getRepository(ListingImage);

    const listing = await listingsRepository.findOne({
      where: {
        id: listingId,
        sellerId,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    this.assertEditableStatus(listing);

    const currentCount = await imagesRepository.count({
      where: { listingId },
    });

    if (currentCount >= MAX_LISTING_IMAGES) {
      throw new BadRequestException(
        `A listing can have at most ${MAX_LISTING_IMAGES} images`,
      );
    }
  }

  private async findOwnedListingForUpdate(
    manager: EntityManager,
    listingId: string,
    sellerId: string,
  ): Promise<Listing> {
    const listing = await manager.getRepository(Listing).findOne({
      where: {
        id: listingId,
        sellerId,
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  private assertEditableStatus(listing: Listing): void {
    if (
      listing.status !== ListingStatus.Draft &&
      listing.status !== ListingStatus.Active
    ) {
      throw new BadRequestException(
        'Listing media cannot be edited in its current status',
      );
    }
  }
}
