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
    // const workflow = await this.workflowsService.findByName(name);
    // console.log(workflow);
    // return this.workflowsService.createInstance(name);
    // console.log(id);
    // return workflow;
    // return this.workflowsService.create(createWorkflowDto);
  }

  @Get()
  findAll() {
    return this.workflowInstancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowInstancesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowInstancesService.update(+id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowInstancesService.remove(+id);
  }
}
