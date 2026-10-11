export type ThemeMode = 'light' | 'dark' | 'system';

export type WorkspaceViewMode = 'split' | 'pdf-only' | 'notes-only' | 'swapped';

export type ActiveSideTool = 'home' | 'reader' | 'notebooks' | 'canvas' | 'library' | 'search' | 'files' | 'info' | 'ai' | 'links';

export type NotebookType = 'notebook' | 'canvas';

export interface PdfAnnotation {
  id: string;
  type: 'highlight' | 'underline' | 'squiggly' | 'pen' | 'rect' | 'ellipse' | 'arrow' | 'text' | 'note';
  page: number;
  color: string;
  rect?: { x: number; y: number; width: number; height: number };
  points?: { x: number; y: number }[];
  text?: string;
  comment?: string;
  createdAt: number;
}

export interface PdfBacklink {
  pdfId: string;
  pdfTitle: string;
  page: number;
  textSnippet?: string;
  snapshotUrl?: string;
  rect?: { x: number; y: number; width: number; height: number };
}

export interface NotebookContent {
  id: string;
  title: string;
  type: 'notebook';
  icon?: string;
  colorDot?: string;
  bodyHtml: string;
  plainText: string;
  citationStyle: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  updatedAt: number;
  backlinks: PdfBacklink[];
}

export interface CanvasPort {
  id: string;
  type: 'in' | 'out';
  position: 'left' | 'right' | 'top' | 'bottom';
}

export type CanvasNodeType = 
  | 'snapshot' 
  | 'note' 
  | 'quote' 
  | 'web' 
  | 'ai' 
  | 'notebook-ref' 
  | 'image' 
  | 'latex';

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorDot?: string;
  isCollapsed?: boolean;
  content: {
    text?: string;
    latex?: string;
    imageUrl?: string;
    sourceUrl?: string;
    backlink?: PdfBacklink;
    notebookId?: string;
    aiPrompt?: string;
  };
}

export interface CanvasWire {
  id: string;
  fromNodeId: string;
  fromPort: 'left' | 'right' | 'top' | 'bottom';
  toNodeId: string;
  toPort: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
  color?: string;
}

export interface CanvasStroke {
  id: string;
  type: 'pen' | 'highlighter' | 'arrow' | 'line' | 'rect' | 'ellipse';
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  size: number;
  roughness?: number;
  fillStyle?: 'none' | 'hachure' | 'solid';
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
}

export interface CanvasData {
  id: string;
  title: string;
  type: 'canvas';
  icon?: string;
  colorDot?: string;
  nodes: CanvasNode[];
  wires: CanvasWire[];
  strokes: CanvasStroke[];
  viewport: { x: number; y: number; zoom: number };
  updatedAt: number;
}

export interface ProjectTab {
  id: string;
  title: string;
  type: 'pdf' | 'zodiac' | 'home';
  filePath: string;
  isDirty?: boolean;
  activeNotebookId?: string;
  activeNotebookType: 'notebook' | 'canvas';
  viewMode: WorkspaceViewMode;
  splitRatio: number; // 0.2 to 0.8, default 0.5
  currentPage: number;
  totalPages: number;
  pdfDataUri?: string;
  pdfTitle: string;
  notebooks: NotebookContent[];
  canvases: CanvasData[];
  annotations: PdfAnnotation[];
}

export interface ProjectManifest {
  version: string;
  projectId: string;
  title: string;
  createdAt: number;
  modifiedAt: number;
  sourcePdfTitle: string;
  notebookCount: number;
  canvasCount: number;
  annotationCount: number;
  author?: string;
}

export interface UserAccount {
  isSignedIn: boolean;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  notebookFont: 'sans' | 'serif' | 'mono';
  notebookFontSize: number;
  autosaveInterval: number;
  defaultHighlightColor: string;
  geminiApiKeyOverride: string;
  language: string;
}
