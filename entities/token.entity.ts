import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TokenType } from '../common/enums/auth.enum';

@Entity({ name: 'token' })
@Index('idx_token_unique', ['userId', 'type', 'value'], { unique: true })
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: TokenType })
  type: string;

  @Column()
  value: string;

  @Column({ type: 'timestamp' })
  lastUsedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
