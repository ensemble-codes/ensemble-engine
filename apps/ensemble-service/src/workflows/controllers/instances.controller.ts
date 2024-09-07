import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkflowsService } from '../services/workflows.service';
import { UpdateWorkflowDto } from '../dto/update-workflow.dto';
import { WorkflowInstancesService } from '../services/instances.service';
import { CreateWorkflowInstanceDto } from '../dto/create-instance.dto';

@Controller('workflows/instances')
export class WorkflowInstancesController {
  constructor(private readonly workflowsService: WorkflowsService,
    private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Post()
  async create(@Body() createWorkflowInstanceDto: CreateWorkflowInstanceDto) {
    return this.workflowInstancesService.create(createWorkflowInstanceDto);
  }

  @Get()
  findAll() {
    return this.workflowInstancesService.findAll();
  }
  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.workflowInstancesService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowInstancesService.findOne(id);
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
}
