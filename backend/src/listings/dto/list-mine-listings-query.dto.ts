import { IsEnum, IsOptional } from 'class-validator';
import { ListingStatus } from '../../entities';
import { ListListingsQueryDto } from './list-listings-query.dto';

export class ListMineListingsQueryDto extends ListListingsQueryDto {
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
