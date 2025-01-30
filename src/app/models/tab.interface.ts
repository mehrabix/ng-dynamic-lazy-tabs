export interface Tab {
  id?: string;
  title: string;
  content: () => Promise<{ default: any }>;
  children?: Tab[];
  parentId?: string;
  active?: boolean;
  loaded?: boolean;
} 