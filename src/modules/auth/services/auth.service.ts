import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../../entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from '../../../../common/dto/auth.dto';
import { compare, hash } from 'bcrypt';
import { TokenType } from '../../../../common/enums/auth.enum';
import { TokenEntity } from '../../../../entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TokenEntity)
    private tokensRepository: Repository<TokenEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    filter: Partial<UserEntity>,
    password: string,
  ): Promise<UserEntity> {
    const foundUser = await this.getUser(filter);
    if (!foundUser) {
      return null;
    }

    const passwordValid = await compare(password, foundUser.password);
    if (!passwordValid) {
      return null;
    }

    return foundUser;
  }

  async login(loginDto: LoginDto) {
    const filter: Partial<UserEntity> = { email: loginDto.email };

    const user: UserEntity = await this.validateUser(filter, loginDto.password);
    if (!user) {
      throw new BadRequestException('Email or password not valid');
    }

    const userId = user.id;

    const payload = {
      userId,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    // Check if "BEARER" token is already created
    const bearerToken = await this.getToken({
      userId: user.id,
      type: TokenType.bearer,
    });

    let newBearerToken: Partial<TokenEntity>;

    const now = new Date();
    if (!bearerToken) {
      newBearerToken = {
        userId: user.id,
        type: TokenType.bearer,
        value: token,
      };
    } else {
      newBearerToken = { ...bearerToken };
    }

    newBearerToken.lastUsedAt = now;
    newBearerToken.expiresAt = new Date(
      now.getTime() +
        this.configService.get('BEARER_TOKEN_EXPIRATION_DURATION') *
          60 *
          60 *
          1000,
    );

    await this.tokensRepository.upsert(newBearerToken, [
      'userId',
      'type',
      'value',
    ]);

    return {
      token,
      userId,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
  }

  async getToken(filter: Partial<TokenEntity>): Promise<TokenEntity> {
    return await this.tokensRepository.findOne({ where: filter });
  }

  async getUser(filter: Partial<UserEntity>): Promise<UserEntity> {
    return await this.usersRepository.findOne({ where: filter });
  }

  async userExists(filter: Partial<UserEntity>): Promise<boolean> {
    return !!(await this.getUser(filter));
  }

  async register(registerDto: RegisterDto) {
    const userToCreate: Partial<UserEntity> = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
    };

    const filter: Partial<UserEntity> = {
      email: registerDto.email,
    };

    const userExists = await this.userExists(filter);
    if (userExists) {
      throw new BadRequestException('User already exists!');
    }

    // Hashing the password
    userToCreate.password = await this.hashPassword(registerDto.password);
    const user = this.usersRepository.create(userToCreate);

    // Save in DB
    await this.usersRepository.save(user);
  }
}
