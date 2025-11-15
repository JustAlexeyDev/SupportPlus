import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Benefit } from '../../benefits/entities/benefit.entity';
import { CommercialOffer } from '../../benefits/entities/commercial-offer.entity';
import { BeneficiaryCategory } from '../../beneficiary-categories/entities/beneficiary-category.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToMany(() => Benefit)
  @JoinTable({
    name: 'user_hidden_benefits',
    joinColumn: { name: 'preferencesId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'benefitId', referencedColumnName: 'id' },
  })
  hiddenBenefits: Benefit[];

  @ManyToMany(() => CommercialOffer)
  @JoinTable({
    name: 'user_hidden_offers',
    joinColumn: { name: 'preferencesId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'offerId', referencedColumnName: 'id' },
  })
  hiddenOffers: CommercialOffer[];

  @ManyToMany(() => BeneficiaryCategory)
  @JoinTable({
    name: 'user_favorite_categories',
    joinColumn: { name: 'preferencesId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  favoriteCategories: BeneficiaryCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

