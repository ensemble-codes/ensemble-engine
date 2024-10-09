import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { UpdateWorkflowDto } from '../dto/update-workflow.dto';
import { Workflow } from '../entities/workflow.entity'
import { Workflow as WorkflowDocument  } from '../schemas/workflow.schema';


@Injectable()
export class WorkflowsService {

  constructor(
    @InjectModel(Workflow.name) private readonly workflowModel: Model<WorkflowDocument>,
  ) {}

  create(ownerId: string, createWorkflowDto: CreateWorkflowDto) {
    console.info(`creating workflow with ownerId: ${ownerId} and dto: ${createWorkflowDto}`)
    return this.workflowModel.create({
      ...createWorkflowDto,
      owner: ownerId
    });
  }

  findAll(ownerId: string) {
    return this.workflowModel.find({
      $or: [
        { owner: ownerId },
        { isPublic: true }
      ]
    }).exec();
  }

  findOne(id: string) : Promise<WorkflowDocument> {
    return this.workflowModel.findById(id).exec();
  }

  findByName(name: string) {
    return this.workflowModel.findOne({ name }).exec();
  }
  
  update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const newObject = this.workflowModel.findByIdAndUpdate(id, updateWorkflowDto).exec();
    return newObject
  }

  remove(id: string) {
    return `This action removes a #${id} workflow`;
  }
}
