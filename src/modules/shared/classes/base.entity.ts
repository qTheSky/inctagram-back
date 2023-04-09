import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @UpdateDateColumn()
  updatedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
}
