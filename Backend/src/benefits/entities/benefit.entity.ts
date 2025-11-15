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

export enum BenefitType {
  FEDERAL = 'federal',
  REGIONAL = 'regional',
  MUNICIPAL = 'municipal',
}

@Entity('benefits')
export class Benefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  benefitId: string;

  @Column()
  title: string;

  @Column({
    type: 'text',
    default: BenefitType.FEDERAL,
  })
  type: BenefitType;

  @ManyToMany(() => BeneficiaryCategory, { eager: true })
  @JoinTable({
    name: 'benefit_target_groups',
    joinColumn: { name: 'benefitId', referencedColumnName: 'id' },
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

  @Column({ nullable: true })
  partner: string | null;

  @Column({ default: 0 })
  popularity: number;

  @Column({ default: false })
  requiresConfirmation: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

