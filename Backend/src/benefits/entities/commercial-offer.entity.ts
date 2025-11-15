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

export enum CommercialOfferType {
  PHARMACY = 'pharmacy',
  STORE = 'store',
  HOUSING = 'housing',
  OTHER = 'other',
}

@Entity('commercial_offers')
export class CommercialOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  offerId: string;

  @Column()
  title: string;

  @Column({
    type: 'text',
    default: CommercialOfferType.OTHER,
  })
  type: CommercialOfferType;

  @ManyToMany(() => BeneficiaryCategory, { eager: true })
  @JoinTable({
    name: 'commercial_offer_target_groups',
    joinColumn: { name: 'offerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  targetGroups: BeneficiaryCategory[];

  @Column('simple-array')
  regions: string[];

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date' })
  validTo: Date;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  howToGet: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column()
  partner: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  popularity: number;

  @Column({ default: false })
  requiresConfirmation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

