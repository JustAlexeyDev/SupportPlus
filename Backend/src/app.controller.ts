import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      example: {
        message: 'SupportPlus API',
        version: '1.0',
        documentation: '/api',
        endpoints: {
          auth: '/auth',
          users: '/users',
          beneficiaryCategories: '/beneficiary-categories'
        }
      }
    }
  })
  getRoot() {
    return {
      message: 'SupportPlus API',
      version: '1.0',
      documentation: '/api',
      endpoints: {
        auth: '/auth',
        users: '/users',
        beneficiaryCategories: '/beneficiary-categories',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

