import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BeneficiaryCategoriesModule } from './beneficiary-categories/beneficiary-categories.module';
import { BenefitsModule } from './benefits/benefits.module';
import { User } from './users/entities/user.entity';
import { UserPreferences } from './users/entities/user-preferences.entity';
import { BeneficiaryCategory } from './beneficiary-categories/entities/beneficiary-category.entity';
import { Benefit } from './benefits/entities/benefit.entity';
import { CommercialOffer } from './benefits/entities/commercial-offer.entity';
import { BeneficiaryCategoriesService } from './beneficiary-categories/beneficiary-categories.service';
import { BenefitsService } from './benefits/benefits.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'supportplus.db',
      entities: [
        User,
        UserPreferences,
        BeneficiaryCategory,
        Benefit,
        CommercialOffer,
      ],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    BeneficiaryCategoriesModule,
    BenefitsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements OnModuleInit {
  constructor(
    private beneficiaryCategoriesService: BeneficiaryCategoriesService,
    private benefitsService: BenefitsService,
  ) {}

  async onModuleInit() {

    await this.beneficiaryCategoriesService.seedCategories();

    await this.benefitsService.seedBenefits();
  }
}
