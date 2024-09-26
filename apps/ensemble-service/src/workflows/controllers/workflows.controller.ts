import { Controller, Get, Post, Request, Body, Put, Param, Delete, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkflowsService } from 'libs/shared/src/workflows/services/workflows.service';
import { CreateWorkflowDto } from 'libs/shared/src/workflows/dto/create-workflow.dto';
import { UpdateWorkflowDto } from 'libs/shared/src/workflows/dto/update-workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Request() req, @Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(req.user.userId, createWorkflowDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.workflowsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const workflow = await this.workflowsService.findOne(id);
    if (!workflow) {
      throw new NotFoundException('Wallet not found');
    }
    if (workflow.owner?.toString() !== req.user.userId) {
      console.warn(`You are not authorized to access this workflow. workflow.owner: ${typeof workflow.owner}, user.id: ${typeof req.user.userId}`)
      throw new ForbiddenException('You are not authorized to access this workflow');
    }
    return workflow
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
