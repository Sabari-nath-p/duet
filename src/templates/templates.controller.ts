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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createTemplateDto: CreateTemplateDto, @Req() req: any) {
    return this.templatesService.create(createTemplateDto, req.user);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get all templates' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.templatesService.findAll(req.user, pageNum, limitNum);
  }

  @Get('variables')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get available template variables' })
  @ApiResponse({ status: 200, description: 'Template variables retrieved successfully' })
  async getTemplateVariables() {
    return this.templatesService.getTemplateVariables();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'CLIENT', 'CLIENT_USER')
  @ApiOperation({ summary: 'Get a template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Update a template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @Req() req: any,
  ) {
    return this.templatesService.update(id, updateTemplateDto, req.user);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Template is being used by subscriptions' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.remove(id, req.user);
  }

  @Post(':id/duplicate')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Duplicate a template' })
  @ApiResponse({ status: 201, description: 'Template duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async duplicateTemplate(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.duplicateTemplate(id, req.user);
  }

  @Get(':id/analytics')
  @Roles('SUPER_ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Get template analytics' })
  @ApiResponse({ status: 200, description: 'Template analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTemplateAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.getTemplateAnalytics(id, req.user);
  }
}
