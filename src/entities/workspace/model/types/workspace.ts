export type Workspace = {
  id: string;
  title: string;
  emoji: string;
};

export type NewWorkspace = Omit<Workspace, 'id'>;

export type DeletedWorkspace = { record: Workspace; index: number };