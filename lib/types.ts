export interface Task {
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;
  isDone: boolean;
  tasks: Task[];
}

export interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

export interface Project {
  id: string;
  name: string;
  columns: Column[];
}

export interface ImportData {
  name: string;
  columns: {
    title: string;
    color: string;
    cards: {
      title: string;
      description?: string;
      color: string;
      isDone?: boolean;
      tasks: { text: string; done: boolean }[];
    }[];
  }[];
}

export interface SidebarProps {
  dark: boolean;
  setDark: (dark: boolean) => void;
}

export interface DragData {
  type: "Column" | "Card";
  col?: Column;
  card?: Card;
}

export interface SortableCardProps {
  card: Card;
  projectId: string;
  colId: string;
}

export interface ColumnProps {
  col: Column;
  projectId: string;
}

export interface CardPreviewProps {
  card: Card;
  projectId: string;
  colId: string;
  dragHandleProps?: Record<string, unknown>;
}

export interface CardDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  colId: string;
  card: Card;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
}

export interface NewColumnDialogProps extends DialogProps {
  projectId: string;
}

export interface NewCardDialogProps extends DialogProps {
  projectId: string;
  colId: string;
}

export interface EditColumnDialogProps extends DialogProps {
  projectId: string;
  col: Column;
}

export interface EditCardDialogProps extends DialogProps {
  projectId: string;
  colId: string;
  card: Card;
}

export type AIToolsModalProps = DialogProps;

export type TopbarProps = Record<string, never>