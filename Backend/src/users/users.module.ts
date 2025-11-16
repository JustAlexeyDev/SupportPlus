import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { BeneficiaryCategory } from '../beneficiary-categories/entities/beneficiary-category.entity';
import { Benefit } from '../benefits/entities/benefit.entity';
import { CommercialOffer } from '../benefits/entities/commercial-offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPreferences,
      BeneficiaryCategory,
      Benefit,
      CommercialOffer,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}


