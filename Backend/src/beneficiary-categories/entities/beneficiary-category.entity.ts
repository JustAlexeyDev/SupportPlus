import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('beneficiary_categories')
export class BeneficiaryCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // e.g., 'pensioner', 'disabled', 'large_family', 'veteran', 'low_income'

  @Column()
  name: string; // Russian name: 'Пенсионер', 'Инвалид', etc.

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}

