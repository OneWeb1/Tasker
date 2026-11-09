export type CategoryId = string;

export type CategoryColor = string;

export type Category = {
  id: CategoryId;
  title: string;
    emoji: string;
  color: CategoryColor;
  workspaceId?: string;
};

export type NewCategory = Omit<Category, 'id'>;

export type DeletedCategory = { record: Category; index: number };