import JSZip from 'jszip';
import { ProjectTab, ProjectManifest } from '../types';

export async function exportZodiacBundle(tab: ProjectTab): Promise<Blob> {
  const zip = new JSZip();

  const manifest: ProjectManifest = {
    version: '1.0.0',
    projectId: tab.id,
    title: tab.title,
    createdAt: Date.now() - 3600000,
    modifiedAt: Date.now(),
    sourcePdfTitle: tab.pdfTitle || tab.title,
    notebookCount: tab.notebooks.length,
    canvasCount: tab.canvases.length,
    annotationCount: tab.annotations.length,
    author: 'Zodiac Reader by Rizen'
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // If source PDF data uri is present, save it
  if (tab.pdfDataUri) {
    if (tab.pdfDataUri.startsWith('data:application/pdf;base64,')) {
      const base64Data = tab.pdfDataUri.replace('data:application/pdf;base64,', '');
      zip.file('source.pdf', base64Data, { base64: true });
    } else {
      zip.file('source.pdf.meta.txt', tab.pdfDataUri);
    }
  }

  // Notebooks folder
  const notebooksFolder = zip.folder('notebooks');
  if (notebooksFolder) {
    tab.notebooks.forEach((nb) => {
      notebooksFolder.file(`${nb.id}.json`, JSON.stringify(nb, null, 2));
    });
  }

  // Canvases folder
  const canvasesFolder = zip.folder('canvases');
  if (canvasesFolder) {
    tab.canvases.forEach((cv) => {
      canvasesFolder.file(`${cv.id}.json`, JSON.stringify(cv, null, 2));
    });
  }

  // Annotations
  zip.file('annotations.json', JSON.stringify(tab.annotations, null, 2));

  // Cross-links and references
  const links = {
    projectId: tab.id,
    activeNotebookId: tab.activeNotebookId,
    activeNotebookType: tab.activeNotebookType,
    splitRatio: tab.splitRatio,
    currentPage: tab.currentPage,
    viewMode: tab.viewMode
  };
  zip.file('links.json', JSON.stringify(links, null, 2));

  // Generate binary zip
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.zodiac+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return blob;
}

export async function importZodiacBundle(file: File | Blob): Promise<ProjectTab> {
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Invalid .zodiac bundle: missing manifest.json');
  }

  const manifestStr = await manifestFile.async('text');
  const manifest: ProjectManifest = JSON.parse(manifestStr);

  // Load annotations
  let annotations = [];
  const annotationsFile = zip.file('annotations.json');
  if (annotationsFile) {
    try {
      annotations = JSON.parse(await annotationsFile.async('text'));
    } catch (e) {
      console.warn('Failed parsing annotations.json', e);
    }
  }

  // Load notebooks
  const notebooks: any[] = [];
  const notebookFiles = zip.folder('notebooks');
  if (notebookFiles) {
    for (const relativePath of Object.keys(zip.files)) {
      if (relativePath.startsWith('notebooks/') && relativePath.endsWith('.json')) {
        const fileData = await zip.file(relativePath)?.async('text');
        if (fileData) {
          try {
            notebooks.push(JSON.parse(fileData));
          } catch (e) {
            console.warn(`Error parsing notebook file ${relativePath}`, e);
          }
        }
      }
    }
  }

  // Load canvases
  const canvases: any[] = [];
  for (const relativePath of Object.keys(zip.files)) {
    if (relativePath.startsWith('canvases/') && relativePath.endsWith('.json')) {
      const fileData = await zip.file(relativePath)?.async('text');
      if (fileData) {
        try {
          canvases.push(JSON.parse(fileData));
        } catch (e) {
          console.warn(`Error parsing canvas file ${relativePath}`, e);
        }
      }
    }
  }

  // Load links / layout metadata
  let layoutMeta: any = {};
  const linksFile = zip.file('links.json');
  if (linksFile) {
    try {
      layoutMeta = JSON.parse(await linksFile.async('text'));
    } catch (e) {}
  }

  // Check source PDF
  let pdfDataUri: string | undefined = undefined;
  const pdfFile = zip.file('source.pdf');
  if (pdfFile) {
    const base64 = await pdfFile.async('base64');
    pdfDataUri = `data:application/pdf;base64,${base64}`;
  } else {
    const pdfMetaFile = zip.file('source.pdf.meta.txt');
    if (pdfMetaFile) {
      pdfDataUri = await pdfMetaFile.async('text');
    }
  }

  const restoredTab: ProjectTab = {
    id: manifest.projectId || `proj_${Date.now()}`,
    title: manifest.title || 'Restored Project',
    type: 'zodiac',
    filePath: `Workspace / ${manifest.title || 'Project'}.zodiac`,
    pdfTitle: manifest.sourcePdfTitle || manifest.title,
    pdfDataUri,
    currentPage: layoutMeta.currentPage || 1,
    totalPages: 24,
    splitRatio: layoutMeta.splitRatio ?? 0.5,
    viewMode: layoutMeta.viewMode || 'split',
    activeNotebookId: layoutMeta.activeNotebookId || notebooks[0]?.id || canvases[0]?.id,
    activeNotebookType: layoutMeta.activeNotebookType || (notebooks.length > 0 ? 'notebook' : 'canvas'),
    notebooks: notebooks.length > 0 ? notebooks : [],
    canvases: canvases.length > 0 ? canvases : [],
    annotations: annotations || []
  };

  return restoredTab;
}
