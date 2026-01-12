import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { RoleType } from '../roles/schemas/role.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || RoleType.VIEWER,
    });

    await user.save();

    return this.generateTokens(user);
  }

  async login(user: any): Promise<AuthResponseDto> {
    await this.userModel.updateOne({ _id: user._id }, { lastLogin: new Date() });
    return this.generateTokens(user);
  }

  async generateTokens(user: any): Promise<AuthResponseDto> {
    const payload = {
      sub: user._id || user.id,
      email: user.email,
      role: user.role,
      assignedModules: user.assignedModules,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.userModel.updateOne(
      { _id: user._id || user.id },
      { refreshToken },
    );

    // Convert to object to ensure virtual properties are included
    const userObj = user.toObject ? user.toObject() : user;

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id || user.id).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        assignedModules: (user.assignedModules || []).map((id: any) => id.toString()),
        isActive: userObj.isActive !== undefined ? userObj.isActive : user.status === 'active',
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { refreshToken: null });
  }

  async getUserWithDetails(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
