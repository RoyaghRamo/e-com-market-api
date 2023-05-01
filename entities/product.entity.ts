import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @Column({ type: 'int' })
  categoryId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'longtext' })
  description: string;

  @Column({ type: 'float', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;
}
