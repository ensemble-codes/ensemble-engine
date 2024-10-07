import { Workflow } from './workflow.entity'; // Adjust the path if necessary
import { TriggerSnapshot } from '../entities/trigger-snapshot.entity';
import { traverseAndInterpolate } from '../utils';
import { Step } from './step.entity';

export class WorkflowInstanceEntity {
  workflow: Workflow;
  originalWorkflow: Workflow;
  status: string;
  currentStepIndex: number;
  triggerSnapshots: Map<string, TriggerSnapshot>;
  startedAt: Date;
  completedAt: Date;
  params: Map<string, string>;

  constructor(
    public readonly id: string,
    workflow: Workflow,
    status: string = 'pending',
    currentStepIndex: number = 0,
    triggerSnapshots: Map<string, TriggerSnapshot> = new Map(),
    startedAt: Date = new Date(),
    completedAt: Date = null,
    params: Map<string, string> = new Map(),
  ) {
    this.workflow = traverseAndInterpolate(workflow, params);
    this.originalWorkflow = workflow;
    this.status = status;
    this.currentStepIndex = currentStepIndex;
    this.triggerSnapshots = triggerSnapshots;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.params = params;
  }

  // Method to check if the workflow instance is completed
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  // Method to advance the current step index
  advanceStep(): void {
    if (!this.isCompleted()) {
      this.currentStepIndex++;
    } else {
      throw new Error('Cannot advance steps on a completed workflow');
    }
  }

  // Method to mark the instance as completed
  complete(): void {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Method to update params
  updateParams(key: string, value: string): void {
    this.params.set(key, value);
  }

  // Method to get the trigger snapshot by key
  getTriggerSnapshot(key: string): TriggerSnapshot | undefined {
    return this.triggerSnapshots.get(key);
  }

  getCurrentStep(): Step {
    return this.workflow.steps[this.currentStepIndex];
  }

  getCurrentNetwork(): string | null {
    const currentStep = this.workflow.steps[this.currentStepIndex];
    
    if (currentStep && currentStep.network) {
      return currentStep.network;
    }
    console.warn(`No network found for workflow ${this.id}, step ${this.currentStepIndex}`)
    return null; // Return null if no network is available for the current step
  }

  getWalletAddress(): string {
    return this.workflow.wallet.address
  }
}