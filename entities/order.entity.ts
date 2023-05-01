import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'order' })
export class OrderEntity extends BaseEntity {
  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'boolean', default: 0 })
  paid: boolean;
}
