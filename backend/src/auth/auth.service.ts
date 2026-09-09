import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import sharp from 'sharp';
import { Not, Repository } from 'typeorm';
import { User } from '../entities';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '../storage/storage.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(STORAGE_PROVIDER)
    private readonly storage: StorageProvider,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.usersRepository.save(
        this.usersRepository.create({
          email,
          passwordHash,
          displayName: dto.displayName.trim(),
          phone: dto.phone?.trim() || null,
          avatarUrl: null,
          avatarStorageKey: null,
        }),
      );

      return this.createAuthResponse(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        avatarUrl: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toAuthUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const existingUser = await this.usersRepository.findOne({
        where: {
          email,
          id: Not(userId),
        },
      });

      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }

      user.email = email;
    }

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName.trim();
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone.trim() || null;
    }

    try {
      return this.toAuthUser(await this.usersRepository.save(user));
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<AuthUser> {
    if (!file.buffer.length) {
      throw new BadRequestException('Avatar file is empty');
    }

    let avatar: Buffer;

    try {
      avatar = await sharp(file.buffer, {
        failOn: 'error',
        limitInputPixels: 25_000_000,
      })
        .rotate()
        .resize(512, 512, {
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: false,
        })
        .webp({ quality: 84, effort: 4 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Invalid avatar image');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        avatarUrl: true,
        avatarStorageKey: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousKey = user.avatarStorageKey;
    const storageKey = `avatars/${userId}/${randomUUID()}.webp`;

    await this.storage.putObject({
      key: storageKey,
      body: avatar,
      contentType: 'image/webp',
    });

    user.avatarStorageKey = storageKey;
    user.avatarUrl =
      `${this.storage.getPublicUrl(storageKey)}?v=${Date.now()}`;

    try {
      const savedUser = await this.usersRepository.save(user);

      if (previousKey && previousKey !== storageKey) {
        await this.storage.deleteObject(previousKey);
      }

      return this.toAuthUser(savedUser);
    } catch (error) {
      await this.storage.deleteObject(storageKey);
      throw error;
    }
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: this.configService.get<number>('JWT_EXPIRES_IN') ?? 900,
      },
    );

    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }
}
