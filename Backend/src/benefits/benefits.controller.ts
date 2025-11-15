import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BenefitsService } from './benefits.service';
import { SearchBenefitsDto } from './dto/search-benefits.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { CreateCommercialOfferDto } from './dto/create-commercial-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('benefits')
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search and filter benefits' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: [String] })
  @ApiQuery({ name: 'categoryIds', required: false, type: [Number] })
  @ApiQuery({ name: 'regions', required: false, type: [String] })
  @ApiQuery({ name: 'termFilter', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['relevance', 'date', 'popularity'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchBenefits(
    @Query() searchDto: SearchBenefitsDto,
    @Request() req?: any,
  ) {

    const userRegion = req?.user?.region;
    const userCategoryIds = req?.user?.beneficiaryCategories?.map((c: any) => c.id);
    
    return this.benefitsService.searchBenefits(
      searchDto,
      userRegion,
      userCategoryIds,
    );
  }

  @Get('my-benefits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user\'s active benefits (personal account)' })
  async getMyBenefits(@Request() req: any) {
    const user = req.user;
    return this.benefitsService.getUserBenefits(
      user.id,
      user.region,
      user.beneficiaryCategories?.map((c: any) => c.id),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new benefit (admin)' })
  async createBenefit(@Body() createDto: CreateBenefitDto) {
    return this.benefitsService.createBenefit(createDto);
  }

  @Post('commercial-offers')
  @ApiOperation({ summary: 'Create a new commercial offer (admin)' })
  async createCommercialOffer(@Body() createDto: CreateCommercialOfferDto) {
    return this.benefitsService.createCommercialOffer(createDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed benefits and commercial offers (development only)' })
  async seedBenefits() {
    return this.benefitsService.seedBenefits();
  }
}

