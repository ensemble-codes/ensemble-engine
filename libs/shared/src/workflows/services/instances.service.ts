import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkflowInstance } from '../schemas/instance.schema';
import { CreateWorkflowInstanceDto } from '../dto/create-instance.dto';
import { WorkflowsService } from './workflows.service';
import { TriggerSnapshot } from '../entities/trigger-snapshot.entity';
import { Workflow } from '../entities/workflow.entity';

@Injectable()
export class WorkflowInstancesService {

  constructor(
    @InjectModel(WorkflowInstance.name) private readonly workflowInstanceModel: Model<WorkflowInstance>,
    private readonly workflowsService: WorkflowsService
  ) {}

  // Create a new workflow instance
  async create(ownerId: string, createWorkflowInstanceDto: CreateWorkflowInstanceDto): Promise<WorkflowInstance> {
    const workflow = await this.workflowsService.findOne(createWorkflowInstanceDto.workflowId);
    const workflowInstance = await this.workflowInstanceModel.create({
       ...createWorkflowInstanceDto, workflow: workflow._id, owner: ownerId
    })

    return this.workflowInstanceModel.findById(workflowInstance._id).populate('workflow').exec();

  }

  // Find all workflow instances
  async findAll(ownerId: any): Promise<WorkflowInstance[]> {
    return this.workflowInstanceModel.find({ owner: ownerId }).populate('workflow').exec();
  }

  // Find a specific workflow instance by ID
  async findOne(id: string): Promise<WorkflowInstance> {
    return this.workflowInstanceModel.findById(id).populate('workflow').exec();
  }

  async findAndApply(id: string): Promise<Workflow> {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }

    const workflow = instance.workflow;
    const appliedWorkflow = traverseAndInterpolate(workflow.toJSON(), instance.params);
    return appliedWorkflow;
  }

  // Update a workflow instance
  async storeTriggerSnapsot(id: string, snapshot: TriggerSnapshot): Promise<TriggerSnapshot> {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    // console.log('instance.triggerSnapshots', instance.triggerSnapshots);

    if (!instance.triggerSnapshots) {
      instance.triggerSnapshots = new Map<string, TriggerSnapshot>();
    }
    console.log('instance.triggerSnapshots', instance.triggerSnapshots);
    const oldSnapshot = instance.triggerSnapshots.get(snapshot.name);
    instance.triggerSnapshots.set(snapshot.name, snapshot);
    await instance.save();

    return oldSnapshot;
  }

  async start(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    if (instance.status === 'running') {
      throw new BadRequestException(`WorkflowInstance with ID ${id} is already running`);
    }
    instance.status = 'running';
    instance.startedAt = new Date();
    await instance.save();
    return instance;
  }

  async stop(id: string): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    if (instance.status !== 'running') {
      throw new BadRequestException(`WorkflowInstance with ID ${id} is not running`);
    }
    instance.status = 'stopped';
    instance.completedAt = new Date();
    await instance.save();
    return instance;
  }

  async reset(id: any) {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    if (instance.status == 'stopped' || instance.status === 'completed'|| instance.status === 'pending') {
      throw new BadRequestException(`WorkflowInstance with ID ${id} cannot be reset with status ${instance.status}`);
    }

    // reset the instance to the initial state
    instance.currentStepIndex = 0;
    instance.triggerSnapshots = new Map<string, TriggerSnapshot>();
    await instance.save();
    console.log('instance', instance);
    return instance;
  }

  async findByStatus(status: string): Promise<WorkflowInstance[]> {
    return this.workflowInstanceModel.find({ status }).populate('workflow').exec();
  }
  // Update a workflow instance
  async update(id: string, updateWorkflowInstanceDto: any) {
    return `This action updates a #${id} workflow instance`;
  }

  // Remove a workflow instance
  async remove(id: string) {
    return `This action removes a #${id} workflow instance`;
  }

  async startProcessing(id: string) {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    if (instance.isProcessing) {
      return false;
    }
    instance.isProcessing = true;
    instance.startProcessingAt = new Date();
    instance.save();
    return true;
  }

  async stopProcessing(id: string) {
    const instance = await this.findOne(id);
    if (!instance) {
      throw new NotFoundException(`WorkflowInstance with ID ${id} not found`);
    }
    instance.isProcessing = false;
    instance.currentStepIndex++;
    if (instance.currentStepIndex >= instance.workflow.steps.length) {
      console.log(`Instance ${instance.id} has completed all steps. Setting status to completed.`);
      instance.status = 'completed';
      instance.currentStepIndex = 0;
      instance.completedAt = new Date();
    }
    instance.save();
    return true;
  }

  async isSafeToStop(id: string): Promise<boolean> {
    const PROCESSING_TIMEOUT = 50000;
    const instance = await this.findOne(id);
    if (!instance.startProcessingAt || !instance.isProcessing) {
      return true;
    }
    const processingDuration = new Date().getTime() - instance.startProcessingAt.getTime();
    const isSafe = processingDuration > PROCESSING_TIMEOUT;
    console.log(`Processing duration: ${processingDuration} ms, timeout is ${PROCESSING_TIMEOUT} ms. Is safe to stop: ${isSafe}`);
    return isSafe;
  }
}


function traverseAndInterpolate(obj: any, params: Map<string, string>): any {

  if (typeof obj === 'string') {
    // console.log('obj', obj);
    return obj.replace(/\$\w+/g, (match) => {
      // console.log('match', match);
      const key = match.slice(1); // Remove the $ sign
      // console.log('key', key);
      // console.log('key', params.get(key));
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
      if (key === '_id') {
        result[key] = value;
      } else {
        result[key] = traverseAndInterpolate(value, params);
      }
    }
    return result;
  }

  return obj;
}