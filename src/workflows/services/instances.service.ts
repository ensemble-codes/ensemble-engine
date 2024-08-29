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
    const newWorkflowInstance = new this.workflowInstanceModel({ ...createWorkflowInstanceDto, workflow: workflow._id,  });


    return newWorkflowInstance.save();
  }

  // Find all workflow instances
  async findAll(): Promise<WorkflowInstance[]> {
    return this.workflowInstanceModel.find().populate('workflow').exec();
  }

  // Find a specific workflow instance by ID
  async findOne(id: string): Promise<WorkflowInstance> {
    return this.workflowInstanceModel.findById(id).populate('workflow').exec();
  }

  async findAndApply(id: string): Promise<object> {
    console.log('id:', id);
    const instance = await this.findOne(id);
    // console.log('instance', instance);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    // console.log('instance', instance);

    const workflow = instance.workflow;
    console.log('params', instance.params);
    const appliedWorkflow = traverseAndInterpolate(workflow.toJSON(), instance.params);
    return appliedWorkflow;
  }

  // Update a workflow instance
  async update(id: string, updateWorkflowInstanceDto: any) {
    return `This action updates a #${id} workflow instance`;
  }

  // Remove a workflow instance
  async remove(id: string) {
    return `This action removes a #${id} workflow instance`;
  }
}


function traverseAndInterpolate(obj: any, params: Map<string, string>): any {

  if (typeof obj === 'string') {
    // console.log('obj', obj);
    return obj.replace(/\$\w+/g, (match) => {
      console.log('match', match);
      const key = match.slice(1); // Remove the $ sign
      console.log('key', key);
      console.log('key', params.get(key));
      // console.log(params[key] !== undefined ? params[key] : match)
      return params.has(key) ? params.get(key) : match;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => traverseAndInterpolate(item, params));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // console.log('key', key);
      // console.log('value', value);
      result[key] = traverseAndInterpolate(value, params);
    }
    return result;
  }

  return obj;
}