export interface Task {
  text: string;
  done: boolean;
}

/** Free-form label attached to cards — denormalized (name + palette color). */
export interface Tag {
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;
  isDone: boolean;
  tasks: Task[];
  tags?: Tag[];
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
  description?: string;
  createdAt?: number;
  columns: Column[];
}

export interface ImportData {
  name: string;
  description?: string;
  columns: {
    title: string;
    color: string;
    cards: {
      title: string;
      description?: string;
      color: string;
      isDone?: boolean;
      tasks: { text: string; done: boolean }[];
      tags?: { name: string; color: string }[];
    }[];
  }[];
}

export interface DragData {
  type: "Column" | "Card";
  col?: Column;
  card?: Card;
}
