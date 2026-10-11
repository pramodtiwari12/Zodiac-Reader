import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer,
  Hand,
  PlusSquare,
  Type,
  PenTool,
  ArrowRight,
  Minus,
  Square,
  Circle,
  Eraser,
  StickyNote,
  Image as ImageIcon,
  Sigma,
  Globe,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  MapPin,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  ExternalLink,
  Move
} from 'lucide-react';
import { CanvasData, CanvasNode, CanvasWire, CanvasStroke } from '../../types';
import { Tooltip } from '../common/Tooltip';
import katex from 'katex';

interface InfiniteCanvasProps {
  canvas: CanvasData;
  onUpdateCanvas: (canvas: CanvasData) => void;
  onJumpToPdfPage: (page: number) => void;
  onSelectNotebook: (id: string) => void;
  onOpenLatexModal: () => void;
  onOpenBrowser: () => void;
  sourcePdfTitle: string;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  canvas,
  onUpdateCanvas,
  onJumpToPdfPage,
  onSelectNotebook,
  onOpenLatexModal,
  onOpenBrowser,
  sourcePdfTitle
}) => {
  const [viewport, setViewport] = useState(canvas.viewport || { x: 0, y: 0, zoom: 1 });
  const [activeTool, setActiveTool] = useState<
    'select' | 'hand' | 'node' | 'text' | 'pen' | 'arrow' | 'rect' | 'ellipse' | 'eraser' | 'note'
  >('select');

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan state (space + drag or middle mouse)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wire connection dragging
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    port: 'left' | 'right' | 'top' | 'bottom';
  } | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [strokeColor, setStrokeColor] = useState('#1F4E79');
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Minimap toggle
  const [showMinimap, setShowMinimap] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const isSpacePressedRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpacePressedRef.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpacePressedRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Pan with Space or middle click
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpacePressedRef.current || activeTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      return;
    }

    if (activeTool === 'pen' || activeTool === 'arrow') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const worldX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const worldY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      setIsDrawing(true);
      setCurrentStroke([{ x: worldX, y: worldY }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning) {
      setViewport((vp) => ({
        ...vp,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    // Drag node
    if (draggingNodeId) {
      const worldX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const worldY = (e.clientY - rect.top - viewport.y) / viewport.zoom;

      const updatedNodes = canvas.nodes.map((node) => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            x: Math.round(worldX - dragOffset.x),
            y: Math.round(worldY - dragOffset.y)
          };
        }
        return node;
      });

      onUpdateCanvas({ ...canvas, nodes: updatedNodes, updatedAt: Date.now() });
      return;
    }

    // Drag wire connection
    if (connectingFrom) {
      const worldX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const worldY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      setConnectingMousePos({ x: worldX, y: worldY });
      return;
    }

    // Freehand drawing
    if (isDrawing) {
      const worldX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
      const worldY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
      setCurrentStroke((pts) => [...pts, { x: worldX, y: worldY }]);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingFrom(null);
    setConnectingMousePos(null);

    if (isDrawing && currentStroke.length > 1) {
      const newStroke: CanvasStroke = {
        id: `str_${Date.now()}`,
        type: activeTool === 'arrow' ? 'arrow' : 'pen',
        points: currentStroke,
        color: strokeColor,
        size: strokeWidth
      };
      onUpdateCanvas({
        ...canvas,
        strokes: [...canvas.strokes, newStroke],
        updatedAt: Date.now()
      });
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setViewport((vp) => ({
        ...vp,
        zoom: Math.min(3, Math.max(0.3, vp.zoom * zoomFactor))
      }));
    } else {
      setViewport((vp) => ({
        ...vp,
        x: vp.x - e.deltaX,
        y: vp.y - e.deltaY
      }));
    }
  };

  // Node Port Connect target
  const handlePortMouseUp = (nodeId: string, port: 'left' | 'right' | 'top' | 'bottom') => {
    if (connectingFrom && connectingFrom.nodeId !== nodeId) {
      const newWire: CanvasWire = {
        id: `wire_${Date.now()}`,
        fromNodeId: connectingFrom.nodeId,
        fromPort: connectingFrom.port,
        toNodeId: nodeId,
        toPort: port
      };
      onUpdateCanvas({
        ...canvas,
        wires: [...canvas.wires, newWire],
        updatedAt: Date.now()
      });
    }
    setConnectingFrom(null);
    setConnectingMousePos(null);
  };

  // Helper to get port coordinates
  const getPortCoords = (node: CanvasNode, port: 'left' | 'right' | 'top' | 'bottom') => {
    switch (port) {
      case 'left':
        return { x: node.x, y: node.y + node.height / 2 };
      case 'right':
        return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'top':
        return { x: node.x + node.width / 2, y: node.y };
      case 'bottom':
        return { x: node.x + node.width / 2, y: node.y + node.height };
    }
  };

  // Add new note node
  const handleAddNode = (type: CanvasNode['type'] = 'note') => {
    const centerWorldX = (-viewport.x + 300) / viewport.zoom;
    const centerWorldY = (-viewport.y + 200) / viewport.zoom;

    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type,
      title: type === 'ai' ? 'Gemini Synthesis' : type === 'latex' ? 'LaTeX Equation' : 'Research Note',
      x: Math.round(centerWorldX),
      y: Math.round(centerWorldY),
      width: 260,
      height: 140,
      colorDot: '#1F4E79',
      content: {
        text: 'Type your insights here. Supports @ to link notebooks and @@ for documents.',
        latex: type === 'latex' ? '\\mathcal{L} = \\frac{1}{2} (\\partial_\\mu \\phi)^2 - V(\\phi)' : undefined
      }
    };

    onUpdateCanvas({
      ...canvas,
      nodes: [...canvas.nodes, newNode],
      updatedAt: Date.now()
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="flex-1 h-full w-full overflow-hidden relative select-none"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        cursor: activeTool === 'hand' || isPanning ? 'grab' : 'default'
      }}
    >
      {/* Background Dotted Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <pattern
            id="canvas-grid-dots"
            width={24 * viewport.zoom}
            height={24 * viewport.zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewport.x % (24 * viewport.zoom)}, ${viewport.y % (24 * viewport.zoom)})`}
          >
            <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#canvas-grid-dots)" />
      </svg>

      {/* Floating Centered Canvas Toolbar (Pill shape, live responsive icon behavior) */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg border"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
      >
        <Tooltip content="Select Tool" shortcut="V">
          <button
            onClick={() => setActiveTool('select')}
            className={`z-btn-icon w-7 h-7 rounded-full ${activeTool === 'select' ? 'active' : ''}`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Hand Pan (Space + drag)" shortcut="H">
          <button
            onClick={() => setActiveTool('hand')}
            className={`z-btn-icon w-7 h-7 rounded-full ${activeTool === 'hand' ? 'active' : ''}`}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        <Tooltip content="New Research Node" shortcut="N">
          <button
            onClick={() => handleAddNode('note')}
            className="z-btn-icon w-7 h-7 rounded-full text-[var(--accent)] font-semibold"
          >
            <PlusSquare className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Freehand Pen" shortcut="P">
          <button
            onClick={() => setActiveTool('pen')}
            className={`z-btn-icon w-7 h-7 rounded-full ${activeTool === 'pen' ? 'active' : ''}`}
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Hand-drawn Arrow">
          <button
            onClick={() => setActiveTool('arrow')}
            className={`z-btn-icon w-7 h-7 rounded-full ${activeTool === 'arrow' ? 'active' : ''}`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Sticky Note">
          <button
            onClick={() => handleAddNode('note')}
            className="z-btn-icon w-7 h-7 rounded-full text-amber-500"
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="LaTeX Node" shortcut="Ctrl+L">
          <button
            onClick={() => handleAddNode('latex')}
            className="z-btn-icon w-7 h-7 rounded-full text-[var(--accent)]"
          >
            <Sigma className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Open Built-in Browser" shortcut="Ctrl+/">
          <button
            onClick={onOpenBrowser}
            className="z-btn-icon w-7 h-7 rounded-full text-emerald-600"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        <Tooltip content="Eraser">
          <button
            onClick={() => {
              if (selectedNodeId) {
                onUpdateCanvas({
                  ...canvas,
                  nodes: canvas.nodes.filter((n) => n.id !== selectedNodeId),
                  wires: canvas.wires.filter((w) => w.fromNodeId !== selectedNodeId && w.toNodeId !== selectedNodeId),
                  updatedAt: Date.now()
                });
                setSelectedNodeId(null);
              }
            }}
            className="z-btn-icon w-7 h-7 rounded-full text-rose-500"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>

      {/* Main Pan/Zoom World Container */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
        }}
      >
        {/* SVG Bezier Wires Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none z-10">
          {canvas.wires.map((wire) => {
            const fromNode = canvas.nodes.find((n) => n.id === wire.fromNodeId);
            const toNode = canvas.nodes.find((n) => n.id === wire.toNodeId);
            if (!fromNode || !toNode) return null;

            const start = getPortCoords(fromNode, wire.fromPort);
            const end = getPortCoords(toNode, wire.toPort);

            // Compute DaVinci-style cubic bezier control points
            const dx = Math.abs(end.x - start.x) * 0.5;
            const pathData = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
            const isSelected = selectedNodeId === fromNode.id || selectedNodeId === toNode.id;

            return (
              <g key={wire.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? 'var(--wire-active)' : 'var(--wire)'}
                  strokeWidth={isSelected ? '2.5' : '2'}
                  strokeDasharray="4 2"
                  className={isSelected ? 'animate-pulse' : ''}
                />
                {wire.label && (
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 6}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono bg-white px-1 select-none pointer-events-none"
                  >
                    {wire.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active In-Progress Wire while dragging */}
          {connectingFrom && connectingMousePos && (() => {
            const fromNode = canvas.nodes.find((n) => n.id === connectingFrom.nodeId);
            if (!fromNode) return null;
            const start = getPortCoords(fromNode, connectingFrom.port);
            const dx = Math.abs(connectingMousePos.x - start.x) * 0.5;
            const pathData = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${connectingMousePos.x - dx} ${connectingMousePos.y}, ${connectingMousePos.x} ${connectingMousePos.y}`;

            return (
              <path
                d={pathData}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            );
          })()}

          {/* Freehand Strokes Layer */}
          {canvas.strokes.map((stroke) => {
            if (stroke.points.length < 2) return null;
            const d = stroke.points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
            return (
              <path
                key={stroke.id}
                d={d}
                fill="none"
                stroke={stroke.color}
                strokeWidth={stroke.size}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Active drawing stroke */}
          {isDrawing && currentStroke.length > 1 && (
            <path
              d={currentStroke.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {canvas.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              className={`absolute rounded-xl border select-none transition-shadow z-20 ${
                isSelected ? 'ring-2 ring-[var(--accent)] shadow-xl' : 'shadow-md hover:shadow-lg'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                minHeight: `${node.height}px`,
                backgroundColor: 'var(--node-bg)',
                borderColor: 'var(--node-border)'
              }}
            >
              {/* Node Header Strip (Draggable Handle) */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const worldX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
                  const worldY = (e.clientY - rect.top - viewport.y) / viewport.zoom;
                  setDraggingNodeId(node.id);
                  setDragOffset({ x: worldX - node.x, y: worldY - node.y });
                }}
                className="h-8 px-2.5 flex items-center justify-between border-b rounded-t-xl cursor-grab active:cursor-grabbing text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--bg-toolbar)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: node.colorDot || 'var(--accent)' }}
                  />
                  <span className="truncate text-[var(--text-primary)]">{node.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateCanvas({
                        ...canvas,
                        nodes: canvas.nodes.filter((n) => n.id !== node.id),
                        wires: canvas.wires.filter((w) => w.fromNodeId !== node.id && w.toNodeId !== node.id),
                        updatedAt: Date.now()
                      });
                    }}
                    className="p-0.5 hover:text-rose-500 rounded"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Node Body Content */}
              <div className="p-3 text-xs space-y-2 text-[var(--text-secondary)]">
                {/* PDF Snapshot node */}
                {node.type === 'snapshot' && node.content.imageUrl && (
                  <div>
                    <img src={node.content.imageUrl} alt="Snapshot" className="rounded border max-h-32 w-full object-cover" />
                    {node.content.backlink?.page && (
                      <button
                        onClick={() => onJumpToPdfPage(node.content.backlink!.page)}
                        className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Jump to Page {node.content.backlink.page}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Text Quote node */}
                {node.type === 'quote' && (
                  <div className="border-l-2 border-[var(--accent)] pl-2 italic">
                    <p className="line-clamp-4">"{node.content.text}"</p>
                    {node.content.backlink?.page && (
                      <button
                        onClick={() => onJumpToPdfPage(node.content.backlink!.page)}
                        className="mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>p. {node.content.backlink.page}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* LaTeX Node */}
                {node.type === 'latex' && node.content.latex && (
                  <div className="text-center font-mono py-1 overflow-x-auto text-[var(--text-primary)]">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: katex.renderToString(node.content.latex, { throwOnError: false })
                      }}
                    />
                  </div>
                )}

                {/* AI Node */}
                {node.type === 'ai' && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Gemini Synthesis</span>
                    </div>
                    <p className="line-clamp-4">{node.content.text}</p>
                  </div>
                )}

                {/* Notebook reference node */}
                {node.type === 'notebook-ref' && (
                  <button
                    onClick={() => {
                      if (node.content.notebookId) onSelectNotebook(node.content.notebookId);
                    }}
                    className="w-full text-left p-2 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-medium flex items-center justify-between hover:opacity-90"
                  >
                    <span className="truncate">{node.content.text}</span>
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}

                {/* Standard Note node */}
                {node.type === 'note' && (
                  <p className="line-clamp-4 text-[var(--text-primary)]">{node.content.text}</p>
                )}
              </div>

              {/* Input / Output Ports (Left, Right, Top, Bottom) */}
              {(['left', 'right', 'top', 'bottom'] as const).map((portPos) => {
                const isLeftOrRight = portPos === 'left' || portPos === 'right';
                const style: React.CSSProperties = {
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--wire)',
                  border: '2px solid var(--node-bg)',
                  zIndex: 30,
                  cursor: 'crosshair',
                  transition: 'transform 100ms ease, background-color 100ms ease'
                };

                if (portPos === 'left') {
                  style.left = '-5px';
                  style.top = 'calc(50% - 5px)';
                } else if (portPos === 'right') {
                  style.right = '-5px';
                  style.top = 'calc(50% - 5px)';
                } else if (portPos === 'top') {
                  style.top = '-5px';
                  style.left = 'calc(50% - 5px)';
                } else {
                  style.bottom = '-5px';
                  style.left = 'calc(50% - 5px)';
                }

                return (
                  <div
                    key={portPos}
                    style={style}
                    className="hover:scale-150 hover:bg-[var(--accent)] hover:shadow-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setConnectingFrom({ nodeId: node.id, port: portPos });
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      handlePortMouseUp(node.id, portPos);
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Right Controls: Zoom Controls & Minimap Toggle */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
        <div
          className="flex items-center gap-1 p-1 rounded-lg border shadow-lg text-xs"
          style={{
            backgroundColor: 'var(--bg-toolbar)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={() => setViewport((vp) => ({ ...vp, zoom: Math.max(0.3, vp.zoom - 0.15) }))}
            className="z-btn-icon w-6.5 h-6.5"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center font-mono text-[11px] text-[var(--text-secondary)]">
            {Math.round(viewport.zoom * 100)}%
          </span>

          <button
            onClick={() => setViewport((vp) => ({ ...vp, zoom: Math.min(3, vp.zoom + 0.15) }))}
            className="z-btn-icon w-6.5 h-6.5"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setViewport({ x: 40, y: 30, zoom: 1 })}
            className="z-btn-icon w-6.5 h-6.5"
            title="Fit / Reset View"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
