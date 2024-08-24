import { Injectable } from '@nestjs/common';
import fs from 'fs';

import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow } from './entities/workflow.entity'


@Injectable()
export class WorkflowsService {
  // constructor(private readonly workflowRepository: WorkflowRepository) {}

  constructor(
    @InjectModel(Workflow.name) private readonly workflowModel: Model<Workflow>,
  ) {}

  create(createWorkflowDto: CreateWorkflowDto) {
    console.log(createWorkflowDto)
    return this.workflowModel.create(createWorkflowDto);
    // return this.workflowRepository.create(createWorkflowDto);
    // return 'This action adds a new workflow';
  }

  findAll() {
    // const doc = yaml.load(fs.readFileSync('./sample/workflow.yml', 'utf8'))[0];
    // return [doc];
    return this.workflowModel.find().exec();
    // return `This action returns all workflows`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflow`;
  }

  update(id: number, updateWorkflowDto: UpdateWorkflowDto) {
    return `This action updates a #${id} workflow`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflow`;
  }
}
