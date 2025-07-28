import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.usersService.findAll(req.user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user);
  }

  @Patch(':id/custom-fields')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update user custom fields' })
  @ApiResponse({ status: 200, description: 'Custom fields updated successfully' })
  updateCustomFields(
    @Param('id') id: string,
    @Body() customFields: { fieldId: string; value: string }[],
    @Request() req,
  ) {
    return this.usersService.updateCustomFields(id, customFields, req.user);
  }

  @Put(':id/billing-start-date')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update user billing start date and recalculate payment schedules' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        billingStartDate: {
          type: 'string',
          format: 'date-time',
          description: 'The new billing start date for the user',
          example: '2025-01-01T00:00:00.000Z'
        }
      },
      required: ['billingStartDate']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Billing start date updated and payment schedules recalculated',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        message: { type: 'string' },
        affectedSubscriptions: { type: 'number' }
      }
    }
  })
  updateBillingStartDate(
    @Param('id') id: string,
    @Body('billingStartDate') billingStartDate: string,
    @Request() req,
  ) {
    return this.usersService.updateBillingStartDate(id, billingStartDate, req.user);
  }
}
