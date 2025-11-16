import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeneficiaryCategory } from './entities/beneficiary-category.entity';

@Injectable()
export class BeneficiaryCategoriesService {
  constructor(
    @InjectRepository(BeneficiaryCategory)
    private categoriesRepository: Repository<BeneficiaryCategory>,
  ) {}

  async findAll(): Promise<BeneficiaryCategory[]> {
    return this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<BeneficiaryCategory> {
    return this.categoriesRepository.findOne({ where: { id } });
  }

  async seedCategories() {
    const categories = [
      { code: 'pensioner', name: 'Пенсионер', description: 'Лица пенсионного возраста' },
      { code: 'disabled', name: 'Инвалид', description: 'Лица с ограниченными возможностями' },
      { code: 'large_family', name: 'Многодетная семья', description: 'Родители многодетных семей' },
      { code: 'veteran', name: 'Ветеран', description: 'Ветераны боевых действий' },
      { code: 'low_income', name: 'Малоимущий', description: 'Малоимущие граждане' },
    ];

    for (const category of categories) {
      const existing = await this.categoriesRepository.findOne({
        where: { code: category.code },
      });
      
      if (!existing) {
        await this.categoriesRepository.save(category);
      }
    }
  }
}


