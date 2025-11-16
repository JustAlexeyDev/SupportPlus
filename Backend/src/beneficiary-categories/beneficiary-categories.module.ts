import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiaryCategoriesService } from './beneficiary-categories.service';
import { BeneficiaryCategoriesController } from './beneficiary-categories.controller';
import { BeneficiaryCategory } from './entities/beneficiary-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BeneficiaryCategory])],
  controllers: [BeneficiaryCategoriesController],
  providers: [BeneficiaryCategoriesService],
  exports: [BeneficiaryCategoriesService],
})
export class BeneficiaryCategoriesModule {}


