type GroupRequired = { group: string; selector?: string };
type SelectorRequired = { selector: string; group?: string };

export class WalletEntity {
  group?: string;
  selector?: string;
  address?: string;

  constructor(data: GroupRequired | SelectorRequired) {
    if (!data.group && !data.selector) {
      throw new Error('Either group or selector must be provided');
    }
    Object.assign(this, data);
  }
}