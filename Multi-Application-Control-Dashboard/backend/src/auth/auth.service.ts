import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument, RoleType } from '../roles/schemas/role.schema';
import { UsersService } from '../users/users.service';
import { LoginDto, CreateUserDto } from '../users/dto/user.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  assignedModules: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    isSuperAdmin: boolean;
    assignedModules: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  /**
   * Register a new user (Super Admin only)
   */
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = this.generateToken(user);
    return {
      user,
      access_token: token,
      message: 'User registered successfully',
    };
  }

  /**
   * Login user and return JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.usersService.updateLastLogin(user._id.toString());

    const token = this.generateToken(user);
    return {
      user,
      access_token: token,
      message: 'Login successful',
    };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      modules: user.assignedModules,
    };
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: any) {
    return this.usersService.findById(payload.sub);
  }

  /**
   * Validate JWT token and return payload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string) {
    const decoded = this.validateToken(refreshToken);
    const user = await this.usersService.findById(decoded.sub);

    const newToken = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: newToken };
  }

  /**
   * Get user with populated role and modules
   */
  async getUserWithDetails(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'role',
      })
      .populate('assignedModules');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
