import { ProjectTab, AppSettings, UserAccount, NotebookContent, CanvasData } from '../types';

export const MAX_NOTEBOOKS = 5;
export const MAX_CANVASES = 5;

const STORAGE_KEY_TABS = 'zodiac_project_tabs_v1';
const STORAGE_KEY_ACTIVE_TAB = 'zodiac_active_tab_id_v1';
const STORAGE_KEY_SETTINGS = 'zodiac_settings_v1';
const STORAGE_KEY_USER = 'zodiac_user_account_v1';
const STORAGE_KEY_VERSIONS = 'zodiac_version_history_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  notebookFont: 'sans',
  notebookFontSize: 15,
  autosaveInterval: 2,
  defaultHighlightColor: '#FFE066',
  geminiApiKeyOverride: '',
  language: 'English'
};

export const SAMPLE_PROJECTS: ProjectTab[] = [
  {
    id: 'proj_quantum_01',
    title: 'Quantum Foundations.pdf',
    type: 'pdf',
    filePath: 'Workspace / References / Quantum Foundations.pdf',
    pdfTitle: 'Quantum Foundations & Entanglement Invariants',
    currentPage: 3,
    totalPages: 18,
    viewMode: 'split',
    splitRatio: 0.5,
    activeNotebookId: 'nb_quantum_main',
    activeNotebookType: 'notebook',
    notebooks: [
      {
        id: 'nb_quantum_main',
        title: 'Analytical Notes & Formal Derivations',
        type: 'notebook',
        icon: 'book',
        colorDot: '#1F4E79',
        citationStyle: 'APA 7',
        fontFamily: 'sans',
        updatedAt: Date.now() - 120000,
        plainText: `1. Overview of Coherent Phase Dynamics\n\nAccording to the boundary conditions detailed on Page 3, the superposition state collapses under unitary evolution only when the coupling parameter exceeds the critical threshold.\n\n$$\\Psi(x, t) = \\sum_{n=0}^{\\infty} c_n \\phi_n(x) e^{-i \\frac{E_n}{\\hbar} t}$$\n\nIMPORTANT: Note that the phase velocity does not violate Lorentz covariance because the wave packet envelope satisfies relativistic dispersion relations.\n\nKey quote from page 3: "The invariant tensor maintains gauge symmetry under all affine transformations of the Riemannian manifold."`,
        bodyHtml: `<h2>1. Overview of Coherent Phase Dynamics</h2><p>According to the boundary conditions detailed on <strong>Page 3</strong>, the superposition state collapses under unitary evolution only when the coupling parameter exceeds the critical threshold.</p><div class="katex-display-block">$$\\Psi(x, t) = \\sum_{n=0}^{\\infty} c_n \\phi_n(x) e^{-i \\frac{E_n}{\\hbar} t}$$</div><div class="callout-block p-3 my-3 bg-neutral-50 dark:bg-neutral-900 border-l-4 border-amber-500 rounded-r"><div class="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">IMPORTANT</div><p class="mt-1 text-sm text-neutral-700 dark:text-neutral-300"><strong>Note that the phase velocity does not violate Lorentz covariance</strong> because the wave packet envelope satisfies relativistic dispersion relations.</p></div><blockquote class="border-l-3 border-blue-600 pl-3 my-2 text-neutral-600 dark:text-neutral-400 italic">"The invariant tensor maintains gauge symmetry under all affine transformations of the Riemannian manifold." <span class="text-xs text-blue-600 dark:text-blue-400 font-mono font-medium ml-2 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded cursor-pointer" data-page="3">p. 3</span></blockquote><p>We observe that when the temperature approaches $T \\to 0$, the partition function simplifies to the ground state manifold.</p>`,
        backlinks: [
          {
            pdfId: 'proj_quantum_01',
            pdfTitle: 'Quantum Foundations & Entanglement Invariants',
            page: 3,
            textSnippet: 'The invariant tensor maintains gauge symmetry under all affine transformations of the Riemannian manifold.'
          }
        ]
      },
      {
        id: 'nb_quantum_exp',
        title: 'Experimental Protocol & Verification',
        type: 'notebook',
        icon: 'test-tube',
        colorDot: '#2E9E5B',
        citationStyle: 'IEEE',
        fontFamily: 'serif',
        updatedAt: Date.now() - 600000,
        plainText: `Experimental setup uses cryogenic ion traps operating at 15 mK.\nMeasurement fidelity reached 99.4% across 10,000 randomized benchmark cycles.`,
        bodyHtml: `<h2>Experimental Verification Protocol</h2><p>Cryogenic ion traps operating at 15 mK achieve high coherence times ($T_2^* > 1.2\\text{ s}$).</p><p>Measurement fidelity reached <strong>99.4%</strong> across 10,000 randomized benchmark cycles.</p>`,
        backlinks: []
      }
    ],
    canvases: [
      {
        id: 'cv_quantum_graph',
        title: 'State Transition & Topology Map',
        type: 'canvas',
        colorDot: '#D9822B',
        viewport: { x: 40, y: 30, zoom: 1 },
        updatedAt: Date.now() - 300000,
        nodes: [
          {
            id: 'node_1',
            type: 'quote',
            title: 'Foundational Postulate (p. 3)',
            x: 80,
            y: 90,
            width: 260,
            height: 140,
            colorDot: '#1F4E79',
            content: {
              text: 'The invariant tensor maintains gauge symmetry under all affine transformations of the Riemannian manifold.',
              backlink: {
                pdfId: 'proj_quantum_01',
                pdfTitle: 'Quantum Foundations & Entanglement Invariants',
                page: 3
              }
            }
          },
          {
            id: 'node_2',
            type: 'latex',
            title: 'Schrödinger Field Tensor',
            x: 420,
            y: 70,
            width: 270,
            height: 150,
            colorDot: '#D9822B',
            content: {
              latex: 'i \\hbar \\frac{\\partial \\Psi}{\\partial t} = \\hat{\\mathcal{H}} \\Psi',
              text: 'Time-dependent wave equation'
            }
          },
          {
            id: 'node_3',
            type: 'ai',
            title: 'Gemini Insight: S-Matrix',
            x: 420,
            y: 280,
            width: 280,
            height: 170,
            colorDot: '#E9A23B',
            content: {
              text: 'Unitarity ensures conservation of total probability $S^\\dagger S = \\mathbb{I}$. Singularities in the S-matrix correspond to bound states.',
              aiPrompt: 'Explain S-matrix unitarity in quantum scattering'
            }
          },
          {
            id: 'node_4',
            type: 'notebook-ref',
            title: 'Ref: Analytical Notes',
            x: 80,
            y: 290,
            width: 240,
            height: 110,
            colorDot: '#2E9E5B',
            content: {
              text: 'Linked to "Analytical Notes & Formal Derivations"',
              notebookId: 'nb_quantum_main'
            }
          }
        ],
        wires: [
          {
            id: 'wire_1',
            fromNodeId: 'node_1',
            fromPort: 'right',
            toNodeId: 'node_2',
            toPort: 'left',
            label: 'governs dynamics'
          },
          {
            id: 'wire_2',
            fromNodeId: 'node_2',
            fromPort: 'bottom',
            toNodeId: 'node_3',
            toPort: 'top',
            label: 'conserves norm'
          },
          {
            id: 'wire_3',
            fromNodeId: 'node_4',
            fromPort: 'right',
            toNodeId: 'node_3',
            toPort: 'left',
            label: 'referenced'
          }
        ],
        strokes: [
          {
            id: 'str_1',
            type: 'arrow',
            color: '#1F4E79',
            size: 2,
            points: [
              { x: 345, y: 155 },
              { x: 410, y: 145 }
            ]
          }
        ]
      }
    ],
    annotations: [
      {
        id: 'ann_1',
        type: 'highlight',
        page: 3,
        color: '#FFE066',
        rect: { x: 60, y: 180, width: 480, height: 26 },
        text: 'The invariant tensor maintains gauge symmetry under all affine transformations',
        createdAt: Date.now() - 900000
      },
      {
        id: 'ann_2',
        type: 'note',
        page: 3,
        color: '#E4EDF6',
        rect: { x: 550, y: 175, width: 24, height: 24 },
        comment: 'Check correspondence with Theorem 4.1 in standard texts',
        createdAt: Date.now() - 850000
      }
    ]
  },
  {
    id: 'proj_attention_02',
    title: 'Attention_Is_All_You_Need.pdf',
    type: 'pdf',
    filePath: 'Workspace / References / Attention_Is_All_You_Need.pdf',
    pdfTitle: 'Attention Is All You Need (Vaswani et al.)',
    currentPage: 1,
    totalPages: 15,
    viewMode: 'split',
    splitRatio: 0.5,
    activeNotebookId: 'nb_attn_transformer',
    activeNotebookType: 'notebook',
    notebooks: [
      {
        id: 'nb_attn_transformer',
        title: 'Transformer Architecture & Self-Attention',
        type: 'notebook',
        icon: 'cpu',
        colorDot: '#1F4E79',
        citationStyle: 'APA 7',
        fontFamily: 'sans',
        updatedAt: Date.now() - 400000,
        plainText: `Scaled Dot-Product Attention formulation:\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$\n\nThe scaling factor $1/\\sqrt{d_k}$ prevents the dot products from growing excessively large for high dimensions, which would otherwise push the softmax function into regions with vanishingly small gradients.`,
        bodyHtml: `<h2>Scaled Dot-Product Attention</h2><p>The core computational primitive maps a query and a set of key-value pairs to an output vector:</p><div class="katex-display-block">$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$</div><p>The scaling factor $\\frac{1}{\\sqrt{d_k}}$ counteracts the magnitude scaling for large dimensionalities, keeping gradients in a stable regime.</p>`,
        backlinks: []
      }
    ],
    canvases: [
      {
        id: 'cv_attn_pipeline',
        title: 'Multi-Head Projection Pipeline',
        type: 'canvas',
        colorDot: '#2E9E5B',
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: Date.now() - 250000,
        nodes: [
          {
            id: 'n_qkv',
            type: 'note',
            title: 'Linear Projections (Q, K, V)',
            x: 100,
            y: 120,
            width: 250,
            height: 130,
            colorDot: '#1F4E79',
            content: {
              text: 'Input embedding $X$ multiplied by parameter matrices $W_i^Q, W_i^K, W_i^V$.'
            }
          },
          {
            id: 'n_heads',
            type: 'latex',
            title: 'Multi-Head Concatenation',
            x: 430,
            y: 120,
            width: 280,
            height: 140,
            colorDot: '#D9822B',
            content: {
              latex: '\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O',
              text: 'Final projected output'
            }
          }
        ],
        wires: [
          {
            id: 'w_qkv_head',
            fromNodeId: 'n_qkv',
            fromPort: 'right',
            toNodeId: 'n_heads',
            toPort: 'left',
            label: 'parallel heads'
          }
        ],
        strokes: []
      }
    ],
    annotations: []
  }
];

export function getStoredTabs(): ProjectTab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TABS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load tabs from localStorage:', e);
  }
  return SAMPLE_PROJECTS;
}

export function saveStoredTabs(tabs: ProjectTab[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(tabs));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function getActiveTabId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
    if (id) return id;
  } catch (e) {}
  return SAMPLE_PROJECTS[0].id;
}

export function saveActiveTabId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, id);
  } catch (e) {}
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export function getStoredUser(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    isSignedIn: true,
    name: 'Pramod Tiwari',
    email: 'pramodtiwari2612@gmail.com',
    avatarUrl: ''
  };
}

export function saveStoredUser(user: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {}
}

export interface VersionSnapshot {
  id: string;
  targetId: string; // notebookId or canvasId
  targetType: 'notebook' | 'canvas';
  title: string;
  timestamp: number;
  data: any;
}

export function recordVersionSnapshot(snapshot: VersionSnapshot): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERSIONS);
    let list: VersionSnapshot[] = raw ? JSON.parse(raw) : [];
    // Keep max 20 per targetId
    list = list.filter((item) => item.targetId === snapshot.targetId);
    list.unshift(snapshot);
    if (list.length > 20) {
      list = list.slice(0, 20);
    }
    const otherSnapshots: VersionSnapshot[] = raw ? JSON.parse(raw).filter((i: any) => i.targetId !== snapshot.targetId) : [];
    const combined = [...list, ...otherSnapshots];
    localStorage.setItem(STORAGE_KEY_VERSIONS, JSON.stringify(combined));
  } catch (e) {}
}

export function getVersionSnapshots(targetId: string): VersionSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VERSIONS);
    if (raw) {
      const all: VersionSnapshot[] = JSON.parse(raw);
      return all.filter((s) => s.targetId === targetId).sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (e) {}
  return [];
}
