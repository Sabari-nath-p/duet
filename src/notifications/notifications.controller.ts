import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto, SendBulkNotificationDto, TestNotificationDto, CreateGeneralReminderDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Body() createNotificationDto: CreateNotificationDto, @Req() req: any) {
    return this.notificationsService.create(createNotificationDto, req.user);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.notificationsService.findAll(req.user, pageNum, limitNum);
  }

  @Post('bulk')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent successfully' })
  async sendBulk(@Body() sendBulkDto: SendBulkNotificationDto, @Req() req: any) {
    return this.notificationsService.sendBulk(sendBulkDto, req.user);
  }

  @Post('test')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async sendTest(@Body() testDto: TestNotificationDto, @Req() req: any) {
    return this.notificationsService.sendTest(testDto, req.user);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  async getStats(@Req() req: any) {
    return this.notificationsService.getNotificationStats(req.user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req: any,
  ) {
    return this.notificationsService.update(id, updateNotificationDto, req.user);
  }

  @Post('general-reminder')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Send a general reminder to a user (not payment related)' })
  @ApiResponse({ status: 201, description: 'General reminder sent successfully' })
  async sendGeneralReminder(@Body() createReminderDto: CreateGeneralReminderDto, @Req() req: any) {
    return this.notificationsService.createGeneralReminder(createReminderDto, req.user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.remove(id, req.user);
  }
}
