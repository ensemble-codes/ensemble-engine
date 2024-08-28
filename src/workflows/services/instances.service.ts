import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkflowInstance } from '../schemas/instance.schema';
import { CreateWorkflowInstanceDto } from '../dto/create-instance.dto';
import { WorkflowsService } from './workflows.service';

@Injectable()
export class WorkflowInstancesService {
  constructor(
    @InjectModel(WorkflowInstance.name) private readonly workflowInstanceModel: Model<WorkflowInstance>,
    private readonly workflowsService: WorkflowsService
  ) {}

  // Create a new workflow instance
  async create(createWorkflowInstanceDto: CreateWorkflowInstanceDto): Promise<WorkflowInstance> {

    const workflow = await this.workflowsService.findByName(createWorkflowInstanceDto.workflowName);
    console.log(workflow);
    const newWorkflowInstance = new this.workflowInstanceModel({ workflow: workflow._id });
    // return this.workflowsService.createInstance(name);
    // console.log(id);
    // return workflow;
    // return this.workflowsService.create(createWorkflowDto);

    return newWorkflowInstance.save();
  }

  // Find all workflow instances
  async findAll(): Promise<WorkflowInstance[]> {
    return this.workflowInstanceModel.find().populate('workflow').exec();
  }

  // Find a specific workflow instance by ID
  async findOne(id: number): Promise<WorkflowInstance> {
    return this.workflowInstanceModel.findById(id).populate('workflow').exec();
  }

  // Update a workflow instance
  async update(id: number, updateWorkflowInstanceDto: any) {
    return `This action updates a #${id} workflow instance`;
  }

  // Remove a workflow instance
  async remove(id: number) {
    return `This action removes a #${id} workflow instance`;
  }
}
