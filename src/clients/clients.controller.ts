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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  WhatsappConfigDto,
  EmailConfigDto,
  PaymentConfigDto,
} from './dto/client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new client (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 409, description: 'Client already exists' })
  create(@Body() createClientDto: CreateClientDto, @Request() req) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.clientsService.findAll(req.user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.clientsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req) {
    return this.clientsService.update(id, updateClientDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete client (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.clientsService.remove(id, req.user);
  }

  @Get(':id/configurations')
  @ApiOperation({ summary: 'Get client configurations (WhatsApp, Email, Payment)' })
  @ApiResponse({ status: 200, description: 'Configurations retrieved successfully' })
  getConfigurations(@Param('id') id: string, @Request() req) {
    return this.clientsService.getConfigurations(id, req.user);
  }

  @Patch(':id/whatsapp-config')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update WhatsApp configuration' })
  @ApiResponse({ status: 200, description: 'WhatsApp config updated successfully' })
  updateWhatsappConfig(
    @Param('id') id: string,
    @Body() config: WhatsappConfigDto,
    @Request() req,
  ) {
    return this.clientsService.updateWhatsappConfig(id, config, req.user);
  }

  @Patch(':id/email-config')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update email configuration' })
  @ApiResponse({ status: 200, description: 'Email config updated successfully' })
  updateEmailConfig(
    @Param('id') id: string,
    @Body() config: EmailConfigDto,
    @Request() req,
  ) {
    return this.clientsService.updateEmailConfig(id, config, req.user);
  }

  @Patch(':id/payment-config')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update payment configuration' })
  @ApiResponse({ status: 200, description: 'Payment config updated successfully' })
  updatePaymentConfig(
    @Param('id') id: string,
    @Body() config: PaymentConfigDto,
    @Request() req,
  ) {
    return this.clientsService.updatePaymentConfig(id, config, req.user);
  }
}
