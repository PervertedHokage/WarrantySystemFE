export class IssueFullDTO {
  Id!: number;
  Code: string = '';
  Name: string = '';
  IssuesGroupId!: number;
  IssuesGroupName: string = '';
  constructor(init?: Partial<IssueFullDTO>) {
    Object.assign(this, init);
  }
}
export interface IssueGroupDTO {
  IssuesGroupId: number;
  IssuesGroupName: string;
  Items: IssueFullDTO[];
}
