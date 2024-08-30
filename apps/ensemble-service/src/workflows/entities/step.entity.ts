import { Trigger } from "./trigger.entity";

export class Step {
  name: string;
  contract: string;
  method: string;
  arguments: string;
  trigger: Trigger;
}
