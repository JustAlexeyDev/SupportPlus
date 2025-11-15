import { IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: 'IDs of benefits to hide', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hiddenBenefitIds?: number[];

  @ApiPropertyOptional({ description: 'IDs of commercial offers to hide', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hiddenOfferIds?: number[];

  @ApiPropertyOptional({ description: 'IDs of favorite categories', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  favoriteCategoryIds?: number[];
}

