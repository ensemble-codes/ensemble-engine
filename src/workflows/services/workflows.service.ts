import { Injectable } from '@nestjs/common';
import fs from 'fs';

import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { UpdateWorkflowDto } from '../dto/update-workflow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow } from '../entities/workflow.entity'


@Injectable()
export class WorkflowsService {
  // constructor(private readonly workflowRepository: WorkflowRepository) {}

  constructor(
    @InjectModel(Workflow.name) private readonly workflowModel: Model<Workflow>,
  ) {}

  create(createWorkflowDto: CreateWorkflowDto) {
    console.log(createWorkflowDto)
    return this.workflowModel.create(createWorkflowDto);
  }

  findAll() {
    return this.workflowModel.find().exec();
  }

  findOne(id: string) {
    return this.workflowModel.findById(id).exec();
  }

  findByName(name: string) {
    return this.workflowModel.findOne({ name }).exec();
  }
  
  update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    return `This action updates a #${id} workflow`;
  }

  remove(id: string) {
    return `This action removes a #${id} workflow`;
  }
}
