import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
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

