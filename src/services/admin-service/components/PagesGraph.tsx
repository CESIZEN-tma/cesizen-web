import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { InformationPageDto, InformationTagDto } from '../api/adminTypes';

interface GraphNode {
  id: string;
  name: string;
  type: 'page' | 'tag';
}

interface GraphLink {
  source: string;
  target: string;
}

interface Props {
  pages: InformationPageDto[];
  tags: InformationTagDto[];
}

const PAGE_COLOR = '#58cc02';
const TAG_COLOR = '#1cb0f6';
const LINK_COLOR = 'rgba(156,163,175,0.35)';

const PagesGraph: React.FC<Props> = ({ pages, tags }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(undefined);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const usedTagIds = new Set(pages.flatMap((p) => p.tagIds ?? []));
    const visibleTags = tags.filter((t) => usedTagIds.has(t.id));

    const nodes: GraphNode[] = [
      ...pages.map((p) => ({ id: p.id, name: p.title, type: 'page' as const })),
      ...visibleTags.map((t) => ({ id: t.id, name: t.label, type: 'tag' as const })),
    ];

    const links: GraphLink[] = pages.flatMap((p) =>
      (p.tagIds ?? [])
        .filter((tagId) => usedTagIds.has(tagId))
        .map((tagId) => ({ source: p.id, target: tagId }))
    );

    return { nodes, links };
  }, [pages, tags]);

  if (graphData.nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, color: 'var(--color-gray-400)', fontSize: '0.9rem' }}>
        No pages with tags yet
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: 380, borderRadius: 8, overflow: 'hidden' }}>
      <ForceGraph2D
        ref={graphRef}
        width={width}
        height={380}
        graphData={graphData}
        backgroundColor="transparent"
        linkColor={() => LINK_COLOR}
        linkWidth={2}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNode & { x: number; y: number };
          const isPage = n.type === 'page';
          const radius = isPage ? 5 :7;
          const color = isPage ? PAGE_COLOR : TAG_COLOR;

          // Glow
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 2, 0, 2 * Math.PI);
          ctx.fillStyle = isPage ? 'rgba(88,204,2,0.12)' : 'rgba(28,176,246,0.12)';
          ctx.fill();

          // Node circle
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          // Label
          const fontSize = Math.max(10 / globalScale, 4);
          ctx.font = `${isPage ? 600 : 400} ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(229,231,235,0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const label = n.name.length > 22 ? n.name.slice(0, 20) + '…' : n.name;
          ctx.fillText(label, n.x, n.y + radius + 3);
        }}
        nodeCanvasObjectMode={() => 'replace'}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode & { x: number; y: number };
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        cooldownTicks={120}
        onEngineStop={() => graphRef.current?.zoomToFit(300, 40)}
      />
    </div>
  );
};

export default PagesGraph;
