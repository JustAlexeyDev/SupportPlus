import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { RequestSmsDto, VerifySmsDto } from '../users/dto/phone-login.dto';
import { UsernameLoginDto } from '../users/dto/username-login.dto';

interface SmsCode {
  code: string;
  phone: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  // In-memory storage for SMS codes (stub)
  private smsCodes: Map<string, SmsCode> = new Map();
  private readonly SMS_CODE_EXPIRY_MINUTES = 5;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pinCode: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user || user.isOAuthUser) {
      return null;
    }

    if (user.passwordHash && this.usersService.verifyPin(pinCode, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.pinCode);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        beneficiaryCategories: user.beneficiaryCategories,
      },
    };
  }

  private generateSmsCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private cleanupExpiredCodes() {
    const now = new Date();
    for (const [phone, smsCode] of this.smsCodes.entries()) {
      if (smsCode.expiresAt < now) {
        this.smsCodes.delete(phone);
      }
    }
  }

  async requestSmsCode(requestSmsDto: RequestSmsDto): Promise<{ message: string; code: string }> {
    this.cleanupExpiredCodes();
    
    const phone = requestSmsDto.phone;
    const code = this.generateSmsCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.SMS_CODE_EXPIRY_MINUTES);

    this.smsCodes.set(phone, { code, phone, expiresAt });

    // In production, send SMS here
    // For stub, return code in response (in production, remove code from response)
    return {
      message: 'SMS code sent (stub mode - code returned in response)',
      code, // Remove this in production
    };
  }

  async verifySmsCode(verifySmsDto: VerifySmsDto): Promise<any> {
    this.cleanupExpiredCodes();
    
    const { phone, code } = verifySmsDto;
    const storedCode = this.smsCodes.get(phone);

    if (!storedCode) {
      throw new BadRequestException('SMS code not found or expired');
    }

    if (storedCode.expiresAt < new Date()) {
      this.smsCodes.delete(phone);
      throw new BadRequestException('SMS code expired');
    }

    if (storedCode.code !== code) {
      throw new UnauthorizedException('Invalid SMS code');
    }

    // Code is valid, remove it
    this.smsCodes.delete(phone);

    // Find or create user by phone
    let user = await this.usersService.findByPhone(phone);
    
    if (!user) {
      // Create new user with phone
      // Note: In production, you might want to require additional info during registration
      throw new BadRequestException('User with this phone number not found. Please register first.');
    }

    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        beneficiaryCategories: user.beneficiaryCategories || [],
      },
    };
  }

  async loginWithUsername(usernameLoginDto: UsernameLoginDto): Promise<any> {
    const user = await this.usersService.findByUsername(usernameLoginDto.username);
    
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.verifyPassword(
      usernameLoginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        beneficiaryCategories: user.beneficiaryCategories || [],
      },
    };
  }

  async validateOAuthUser(profile: any) {
    const email = profile.email || profile.emails?.[0]?.value;
    const googleId = profile.id;
    
    let user = await this.usersService.findByGoogleId(googleId);
    
    if (!user && email) {

      user = await this.usersService.findByEmail(email);
      
      if (user) {

        user = await this.usersService.linkOAuthToUser(user.id, googleId);
      }
    }
    
    if (!user && email) {

      user = await this.usersService.createOAuthUser(email, googleId);
    }

    if (!user) {
      throw new Error('Failed to create or find user');
    }


    user = await this.usersService.findById(user.id);

    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        beneficiaryCategories: user.beneficiaryCategories || [],
      },
    };
  }
}

