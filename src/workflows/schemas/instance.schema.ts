import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workflow } from './workflow.schema'; // Adjust the path if necessary

@Schema({ timestamps: true })
export class WorkflowInstance extends Document {
  
  @Prop({ type: Types.ObjectId, ref: Workflow.name, required: true })
  workflow: Workflow;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: Map, of: String })
  metadata: Map<string, string>; // Store any additional instance-specific data as key-value pairs
}

export const WorkflowInstanceSchema = SchemaFactory.createForClass(WorkflowInstance);
