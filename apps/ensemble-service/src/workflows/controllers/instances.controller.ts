import { Controller, Get, Post, Request, Body, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkflowsService } from 'libs/shared/src/workflows/services/workflows.service';
import { WorkflowInstancesService } from 'libs/shared/src/workflows/services/instances.service';
import { CreateWorkflowInstanceDto } from 'libs/shared/src/workflows/dto/create-instance.dto';

@Controller('instances')
export class WorkflowInstancesController {
  constructor(private readonly workflowsService: WorkflowsService,
    private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Post()
  async create(@Request() req, @Body() createWorkflowInstanceDto: CreateWorkflowInstanceDto) {
    return this.workflowInstancesService.create(req.user.userId, createWorkflowInstanceDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.workflowInstancesService.findAll(req.user.userId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.workflowInstancesService.findByStatus(status);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const workflowInstance = await this.workflowInstancesService.findOne(id);
    if (!workflowInstance) {
      throw new NotFoundException('Wallet not found');
    }
    if (workflowInstance.owner?.toString() !== req.user.userId) {
      console.warn(`You are not authorized to access this workflow instance. wallet.owner: ${typeof workflowInstance.owner}, user.id: ${typeof req.user.userId}`)
      throw new ForbiddenException('You are not authorized to access this wallet');
    }
    return workflowInstance
  }

  @Get('apply/:id')
  findAndApply(@Param('id') id: string) {
    console.log('id', id);
    return this.workflowInstancesService.findAndApply(id);
  }
  
  @Post('start/:id')
  async start(@Param('id') id) {
    return this.workflowInstancesService.start(id);
  }

  @Post('stop/:id')
  async stop(@Param('id') id: string) {
    return this.workflowInstancesService.stop(id);
  }

  @Post('reset/:id')
  async reset(@Param('id') id) {
    return this.workflowInstancesService.reset(id);
  }
}
