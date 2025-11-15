import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { Benefit } from './entities/benefit.entity';
import { CommercialOffer } from './entities/commercial-offer.entity';
import { BeneficiaryCategory } from '../beneficiary-categories/entities/beneficiary-category.entity';
import { UserPreferences } from '../users/entities/user-preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Benefit,
      CommercialOffer,
      BeneficiaryCategory,
      UserPreferences,
    ]),
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class BenefitsModule {}

