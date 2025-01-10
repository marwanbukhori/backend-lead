export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  order: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  id: string;
  title: string;
  body: string;
  topicId: string;
  status: string;
  version: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocMetadata {
  title: string;
  description: string;
  tags?: string[];
  readingTime?: string;
}

export interface DocContent {
  metadata: DocMetadata;
  content: string;
}

export interface SearchResult {
  id: string;
  score: number;
  title: string;
  description: string;
  path: string;
  highlights?: {
    title?: string[];
    content?: string[];
  };
}
