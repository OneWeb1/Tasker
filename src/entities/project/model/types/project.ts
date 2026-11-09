export type Project = {
  id: string;
  title: string;
  emoji: string;
  workspaceId?: string;
};

export type NewProject = Omit<Project, 'id'>;

export type DeletedProject = { record: Project; index: number };