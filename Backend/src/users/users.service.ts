import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BeneficiaryCategory } from '../beneficiary-categories/entities/beneficiary-category.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BeneficiaryCategory)
    private categoriesRepository: Repository<BeneficiaryCategory>,
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
}

