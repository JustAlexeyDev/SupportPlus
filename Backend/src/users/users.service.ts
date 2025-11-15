import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { BeneficiaryCategory } from '../beneficiary-categories/entities/beneficiary-category.entity';
import { Benefit } from '../benefits/entities/benefit.entity';
import { CommercialOffer } from '../benefits/entities/commercial-offer.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(BeneficiaryCategory)
    private categoriesRepository: Repository<BeneficiaryCategory>,
    @InjectRepository(Benefit)
    private benefitsRepository: Repository<Benefit>,
    @InjectRepository(CommercialOffer)
    private offersRepository: Repository<CommercialOffer>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const passwordHash = this.hashPin(createUserDto.pinCode);
    
    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      snils: createUserDto.snils,
      region: createUserDto.region,
      isOAuthUser: false,
    });

    if (createUserDto.beneficiaryCategoryIds && createUserDto.beneficiaryCategoryIds.length > 0) {
      const categories = await this.categoriesRepository.findBy({
        id: In(createUserDto.beneficiaryCategoryIds),
      });
      user.beneficiaryCategories = categories;
    }

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['beneficiaryCategories'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['beneficiaryCategories'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { googleId },
      relations: ['beneficiaryCategories'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.snils !== undefined) {
      user.snils = updateUserDto.snils;
    }
    if (updateUserDto.region !== undefined) {
      user.region = updateUserDto.region;
    }
    if (updateUserDto.beneficiaryCategoryIds !== undefined) {
      const categories = await this.categoriesRepository.findBy({
        id: In(updateUserDto.beneficiaryCategoryIds),
      });
      user.beneficiaryCategories = categories;
    }

    return this.usersRepository.save(user);
  }

  hashPin(pinCode: string): string {
    return crypto.createHash('sha256').update(pinCode).digest('hex');
  }

  verifyPin(pinCode: string, hash: string): boolean {
    const computedHash = this.hashPin(pinCode);
    return computedHash === hash;
  }

  async createOAuthUser(email: string, googleId: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      googleId,
      isOAuthUser: true,
    });
    return this.usersRepository.save(user);
  }

  async linkOAuthToUser(userId: number, googleId: string): Promise<User> {
    const user = await this.findById(userId);
    user.googleId = googleId;
    user.isOAuthUser = true;
    return this.usersRepository.save(user);
  }

  async getOrCreatePreferences(userId: number): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
      relations: ['hiddenBenefits', 'hiddenOffers', 'favoriteCategories'],
    });

    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId });
      preferences = await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(userId: number, updateDto: UpdatePreferencesDto): Promise<UserPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    if (updateDto.hiddenBenefitIds !== undefined) {
      const benefits = await this.benefitsRepository.findBy({
        id: In(updateDto.hiddenBenefitIds),
      });
      preferences.hiddenBenefits = benefits;
    }

    if (updateDto.hiddenOfferIds !== undefined) {
      const offers = await this.offersRepository.findBy({
        id: In(updateDto.hiddenOfferIds),
      });
      preferences.hiddenOffers = offers;
    }

    if (updateDto.favoriteCategoryIds !== undefined) {
      const categories = await this.categoriesRepository.findBy({
        id: In(updateDto.favoriteCategoryIds),
      });
      preferences.favoriteCategories = categories;
    }

    return this.preferencesRepository.save(preferences);
  }

  async getPreferences(userId: number): Promise<UserPreferences> {
    return this.getOrCreatePreferences(userId);
  }

  async exportBenefitsToPdf(userId: number): Promise<any> {


    const user = await this.findById(userId);
    const preferences = await this.getOrCreatePreferences(userId);
    


    
    return {
      user: {
        email: user.email,
        region: user.region,
        snils: user.snils ? this.maskSnils(user.snils) : null,
      },
      benefits: {

        note: 'Call /benefits/my-benefits to get actual benefits data',
      },
      preferences: {
        hiddenBenefits: preferences.hiddenBenefits?.map(b => b.id) || [],
        hiddenOffers: preferences.hiddenOffers?.map(o => o.id) || [],
        favoriteCategories: preferences.favoriteCategories?.map(c => c.name) || [],
      },
      exportDate: new Date().toISOString(),
    };
  }

  private maskSnils(snils: string): string {

    const cleaned = snils.replace(/\D/g, '');
    if (cleaned.length < 11) return snils;
    return `${cleaned.substring(0, 3)}-***-*** ${cleaned.substring(9)}`;
  }
}

