import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  async getDashboardAnalytics(@Req() req: any, @Query() getAnalyticsDto: GetAnalyticsDto) {
    return this.analyticsService.getDashboardAnalytics(req.user, getAnalyticsDto);
  }

  @Get('payments')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get payment analytics' })
  @ApiResponse({ status: 200, description: 'Payment analytics retrieved successfully' })
  async getPaymentAnalytics(@Req() req: any, @Query() getAnalyticsDto: GetAnalyticsDto) {
    return this.analyticsService.getPaymentAnalytics(req.user, getAnalyticsDto);
  }

  @Get('revenue')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Req() req: any, @Query() getAnalyticsDto: GetAnalyticsDto) {
    return this.analyticsService.getRevenueAnalytics(req.user, getAnalyticsDto);
  }

  @Get('templates/:id')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Get template-specific analytics' })
  @ApiResponse({ status: 200, description: 'Template analytics retrieved successfully' })
  async getTemplateAnalytics(
    @Param('id') templateId: string,
    @Req() req: any,
    @Query() getAnalyticsDto: GetAnalyticsDto,
  ) {
    return this.analyticsService.getTemplateAnalytics(templateId, req.user, getAnalyticsDto);
  }
}
