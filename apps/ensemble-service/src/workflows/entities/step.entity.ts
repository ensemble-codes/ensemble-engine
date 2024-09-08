import { Trigger } from "./trigger.entity";

export class Step {
  name: string;
  contract: string;
  module: string;
  method: string;
  arguments: [string];
  trigger: Trigger;
  prerequisites: [ Trigger ];
}
