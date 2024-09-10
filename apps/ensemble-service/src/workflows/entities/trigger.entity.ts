import { Condition } from "./condition.entity";


export class Trigger {
  name: string;
  type: string;
  contract: string;
  event: string;
  method: string;
  methodArgs: string[];
  interval: string;
  condition: Condition;
}
