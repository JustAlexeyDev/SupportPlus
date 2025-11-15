import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        snils: '123-456-789 01',
        region: 'Москва',
        beneficiaryCategories: [],
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        snils: '123-456-789 01',
        region: 'Москва',
        beneficiaryCategories: [
          { id: 1, code: 'pensioner', name: 'Пенсионер' }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully' 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found' 
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences/me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  getPreferences(@Request() req: any) {
    return this.usersService.getPreferences(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences/me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user preferences (hidden benefits, favorite categories)' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  updatePreferences(@Request() req: any, @Body() updateDto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/pdf')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Export user benefits to PDF format (returns JSON for PDF generation)' })
  @ApiResponse({ status: 200, description: 'PDF export data generated' })
  exportToPdf(@Request() req: any) {
    return this.usersService.exportBenefitsToPdf(req.user.id);
  }
}

