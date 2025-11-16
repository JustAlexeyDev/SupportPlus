import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BeneficiaryCategory } from '../../beneficiary-categories/entities/beneficiary-category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: false })
  isOAuthUser: boolean;

  @Column({ nullable: true })
  snils: string;

  @Column({ nullable: true })
  region: string;

  @ManyToMany(() => BeneficiaryCategory, { eager: true })
  @JoinTable({
    name: 'user_beneficiary_categories',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  beneficiaryCategories: BeneficiaryCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


