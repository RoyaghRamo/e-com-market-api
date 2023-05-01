import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
}
