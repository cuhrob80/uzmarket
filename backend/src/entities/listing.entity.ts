import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ListingImage } from './listing-image.entity';
import { User } from './user.entity';

export enum ListingStatus {
  Draft = 'draft',
  Active = 'active',
  Sold = 'sold',
  Archived = 'archived',
}

@Entity({ name: 'listings' })
@Index('IDX_listings_seller_id', ['sellerId'])
@Index('IDX_listings_category_id', ['categoryId'])
@Index('IDX_listings_status', ['status'])
@Index('IDX_listings_created_at', ['createdAt'])
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  price!: string;

  @Column({ length: 3, default: 'UZS' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    enumName: 'listing_status_enum',
    default: ListingStatus.Draft,
  })
  status!: ListingStatus;

  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.listings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @ManyToOne(() => Category, (category) => category.listings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => ListingImage, (image) => image.listing)
  images!: ListingImage[];
}
