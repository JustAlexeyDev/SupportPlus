import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { RequestSmsDto, VerifySmsDto } from '../users/dto/phone-login.dto';
import { UsernameLoginDto } from '../users/dto/username-login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and PIN code' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          beneficiaryCategories: []
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth() {

  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);
    

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }

  @Post('phone/request-sms')
  @ApiOperation({ summary: 'Request SMS code for phone login' })
  @ApiBody({ type: RequestSmsDto })
  @ApiResponse({ 
    status: 200, 
    description: 'SMS code sent (stub mode - code returned in response)',
    schema: {
      example: {
        message: 'SMS code sent (stub mode - code returned in response)',
        code: '12345'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async requestSmsCode(@Body() requestSmsDto: RequestSmsDto) {
    return this.authService.requestSmsCode(requestSmsDto);
  }

  @Post('phone/verify-sms')
  @ApiOperation({ summary: 'Verify SMS code and login with phone' })
  @ApiBody({ type: VerifySmsDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          phone: '+79991234567',
          beneficiaryCategories: []
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired SMS code' })
  @ApiResponse({ status: 401, description: 'Invalid SMS code' })
  async verifySmsCode(@Body() verifySmsDto: VerifySmsDto) {
    return this.authService.verifySmsCode(verifySmsDto);
  }

  @Post('login/username')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiBody({ type: UsernameLoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'username',
          beneficiaryCategories: []
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithUsername(@Body() usernameLoginDto: UsernameLoginDto) {
    return this.authService.loginWithUsername(usernameLoginDto);
  }
}

