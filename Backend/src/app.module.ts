import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BeneficiaryCategoriesModule } from './beneficiary-categories/beneficiary-categories.module';
import { User } from './users/entities/user.entity';
import { BeneficiaryCategory } from './beneficiary-categories/entities/beneficiary-category.entity';
import { BeneficiaryCategoriesService } from './beneficiary-categories/beneficiary-categories.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'supportplus.db',
      entities: [User, BeneficiaryCategory],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    AuthModule,
    UsersModule,
    BeneficiaryCategoriesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements OnModuleInit {
  constructor(
    private beneficiaryCategoriesService: BeneficiaryCategoriesService,
  ) {}

  async onModuleInit() {
    // Seed beneficiary categories on startup
    await this.beneficiaryCategoriesService.seedCategories();
  }
}
