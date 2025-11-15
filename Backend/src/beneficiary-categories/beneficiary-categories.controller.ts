import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BeneficiaryCategoriesService } from './beneficiary-categories.service';

@ApiTags('beneficiary-categories')
@Controller('beneficiary-categories')
export class BeneficiaryCategoriesController {
  constructor(
    private readonly categoriesService: BeneficiaryCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all beneficiary categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all beneficiary categories',
    schema: {
      example: [
        {
          id: 1,
          code: 'pensioner',
          name: 'Пенсионер',
          description: 'Лица пенсионного возраста'
        },
        {
          id: 2,
          code: 'disabled',
          name: 'Инвалид',
          description: 'Лица с ограниченными возможностями'
        }
      ]
    }
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get beneficiary category by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category found',
    schema: {
      example: {
        id: 1,
        code: 'pensioner',
        name: 'Пенсионер',
        description: 'Лица пенсионного возраста'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default beneficiary categories' })
  @ApiResponse({ 
    status: 201, 
    description: 'Categories seeded successfully' 
  })
  seed() {
    return this.categoriesService.seedCategories();
  }
}

