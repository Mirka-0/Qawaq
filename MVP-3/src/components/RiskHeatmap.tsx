import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Layers,
  MapPin,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Flame,
  ShieldAlert,
  Eye,
  Crosshair,
  Maximize2,
  Info,
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { CaseItem, RiskType } from '../types';
import { FRENTES_OBRA, RISK_TYPES } from '../constants';
import { CaseDetailModal } from './CaseDetailModal';

interface GridZone {
  id: string;
  name: string;
  ejeX: [number, number]; // [min, max] percentage
  ejeY: [number, number];
  color: string;
  floor: string;
}

const SITE_ZONES: GridZone[] = [
  {
    id: 'z-torre-norte',
    name: 'Torre Norte (Ejes A-C / 1-4)',
    ejeX: [10, 45],
    ejeY: [15, 50],
    color: '#3b82f6',
    floor: 'Frente A (Torre Norte)',
  },
  {
    id: 'z-losa-p14',
    name: 'Losa Central Piso 14 (Ejes C-E / 2-6)',
    ejeX: [35, 75],
    ejeY: [25, 65],
    color: '#f59e0b',
    floor: 'Frente B (Losa Piso 14)',
  },
  {
    id: 'z-excavacion-sur',
    name: 'Excavación y Rampa Sur (Ejes B-F / 5-8)',
    ejeX: [50, 90],
    ejeY: [55, 90],
    color: '#ef4444',
    floor: 'Frente Sur (Excavación)',
  },
  {
    id: 'z-sotano',
    name: 'Sótano 2 Cisterna (Ejes A-C / 6-8)',
    ejeX: [15, 48],
    ejeY: [60, 92],
    color: '#8b5cf6',
    floor: 'Sótano 2 (Cisterna)',
  },
];

export const RiskHeatmap: React.FC = () => {
  const { cases } = useCases();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedZone, setSelectedZone] = useState<string>('TODOS');
  const [selectedPriority, setSelectedPriority] = useState<string>('TODOS');
  const [selectedRiskType, setSelectedRiskType] = useState<string>('TODOS');
  const [selectedCaseModal, setSelectedCaseModal] = useState<CaseItem | null>(null);
  const [hoveredCase, setHoveredCase] = useState<{
    item: CaseItem;
    x: number;
    y: number;
  } | null>(null);
  const [showDensityContours, setShowDensityContours] = useState<boolean>(true);
  const [showGridAxes, setShowGridAxes] = useState<boolean>(true);

  // Map cases to normalized coordinate space (0-100 x, 0-100 y)
  const mappedPoints = useMemo(() => {
    return cases
      .filter((c) => {
        if (selectedZone !== 'TODOS' && c.frente !== selectedZone) return false;
        if (selectedPriority !== 'TODOS' && c.prioridad !== selectedPriority) return false;
        if (selectedRiskType !== 'TODOS' && c.tipo !== selectedRiskType) return false;
        return true;
      })
      .map((item, index) => {
        // Derive stable pseudo-coordinates based on case ID hash or geo offset
        let x = 50;
        let y = 50;

        if (item.frente === 'Frente B (Losa Piso 14)') {
          x = 42 + ((item.id.charCodeAt(item.id.length - 1) * 7 + index * 11) % 30);
          y = 30 + ((item.id.charCodeAt(0) * 5 + index * 13) % 32);
        } else if (item.frente === 'Frente Sur (Excavación)') {
          x = 55 + ((item.id.charCodeAt(item.id.length - 1) * 9 + index * 7) % 32);
          y = 60 + ((item.id.charCodeAt(0) * 11 + index * 9) % 28);
        } else if (item.frente === 'Sótano 2 (Cisterna)') {
          x = 20 + ((item.id.charCodeAt(item.id.length - 1) * 5 + index * 9) % 25);
          y = 65 + ((item.id.charCodeAt(0) * 7 + index * 11) % 24);
        } else {
          x = 18 + ((item.id.charCodeAt(item.id.length - 1) * 6 + index * 14) % 25);
          y = 22 + ((item.id.charCodeAt(0) * 8 + index * 7) % 26);
        }

        const weight =
          item.prioridad === 'Crítico'
            ? 3.5
            : item.prioridad === 'Alto'
            ? 2.2
            : item.prioridad === 'Medio'
            ? 1.4
            : 1.0;

        return {
          caseItem: item,
          x,
          y,
          weight,
        };
      });
  }, [cases, selectedZone, selectedPriority, selectedRiskType]);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = Math.min(Math.max(width * 0.58, 380), 520);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height)
      .style('cursor', 'crosshair');

    // Defs: Gradients, Filters & Blur
    const defs = svg.append('defs');

    // Radial gradient for point heat halos
    const radialGrad = defs
      .append('radialGradient')
      .attr('id', 'heatHaloGrad')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    radialGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444').attr('stop-opacity', 0.65);
    radialGrad.append('stop').attr('offset', '45%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.4);
    radialGrad.append('stop').attr('offset', '80%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0.15);
    radialGrad.append('stop').attr('offset', '100%').attr('stop-color', '#000000').attr('stop-opacity', 0);

    // Glow filter for critical alerts
    const filter = defs.append('filter').attr('id', 'neonGlow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Margins and plotting area
    const margin = { top: 35, right: 35, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([0, innerHeight]);

    // 1. Background Grid & Construction Site Blueprint Blueprint Blueprint
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#070d18')
      .attr('rx', 12)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5);

    // Site Blueprint Sub-zones
    SITE_ZONES.forEach((zone) => {
      const x0 = xScale(zone.ejeX[0]);
      const y0 = yScale(zone.ejeY[0]);
      const zw = xScale(zone.ejeX[1]) - x0;
      const zh = yScale(zone.ejeY[1]) - y0;

      const zoneGroup = g.append('g').attr('class', 'zone-group');

      zoneGroup
        .append('rect')
        .attr('x', x0)
        .attr('y', y0)
        .attr('width', zw)
        .attr('height', zh)
        .attr('rx', 8)
        .attr('fill', zone.color)
        .attr('fill-opacity', 0.05)
        .attr('stroke', zone.color)
        .attr('stroke-opacity', 0.25)
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1);

      zoneGroup
        .append('text')
        .attr('x', x0 + 8)
        .attr('y', y0 + 16)
        .attr('fill', zone.color)
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '0.5px')
        .attr('opacity', 0.8)
        .text(zone.name.split('(')[0]);
    });

    // 2. Axes & Coordinate Ticks (Structural Grid Ejes 1-8 and A-F)
    if (showGridAxes) {
      const xEjes = ['EJE 1', 'EJE 2', 'EJE 3', 'EJE 4', 'EJE 5', 'EJE 6', 'EJE 7', 'EJE 8'];
      const yEjes = ['EJE A', 'EJE B', 'EJE C', 'EJE D', 'EJE E', 'EJE F'];

      // Vertical Grid Lines
      xEjes.forEach((eje, i) => {
        const xPos = (innerWidth / (xEjes.length - 1)) * i;
        g.append('line')
          .attr('x1', xPos)
          .attr('y1', 0)
          .attr('x2', xPos)
          .attr('y2', innerHeight)
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.6);

        g.append('text')
          .attr('x', xPos)
          .attr('y', innerHeight + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748b')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(eje);
      });

      // Horizontal Grid Lines
      yEjes.forEach((eje, i) => {
        const yPos = (innerHeight / (yEjes.length - 1)) * i;
        g.append('line')
          .attr('x1', 0)
          .attr('y1', yPos)
          .attr('x2', innerWidth)
          .attr('y2', yPos)
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.6);

        g.append('text')
          .attr('x', -10)
          .attr('y', yPos + 3)
          .attr('text-anchor', 'end')
          .attr('fill', '#64748b')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(eje);
      });
    }

    // 3. Density Heatmap Contours using D3 Density or Radial Halos
    if (showDensityContours && mappedPoints.length > 0) {
      const heatLayer = g.append('g').attr('class', 'heat-layer');

      mappedPoints.forEach((p) => {
        const cx = xScale(p.x);
        const cy = yScale(p.y);
        const radius = Math.min(innerWidth, innerHeight) * (0.08 * p.weight);

        heatLayer
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', radius)
          .attr('fill', 'url(#heatHaloGrad)')
          .style('mix-blend-mode', 'screen')
          .attr('opacity', 0.85);
      });
    }

    // 4. Hazard Points & Glyphs
    const pointsLayer = g.append('g').attr('class', 'points-layer');

    mappedPoints.forEach((p) => {
      const cx = xScale(p.x);
      const cy = yScale(p.y);
      const isCritical = p.caseItem.prioridad === 'Crítico';
      const isClosed = p.caseItem.estado === 'Cerrado';
      const isPending = p.caseItem.estado === 'Pendiente de Validación SSOMA';

      const pointColor = isClosed
        ? '#10b981'
        : isCritical
        ? '#ef4444'
        : p.caseItem.prioridad === 'Alto'
        ? '#f59e0b'
        : '#38bdf8';

      const pointG = pointsLayer
        .append('g')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('class', 'cursor-pointer group')
        .on('mouseenter', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          setHoveredCase({
            item: p.caseItem,
            x: event.clientX - (rect?.left || 0),
            y: event.clientY - (rect?.top || 0),
          });
        })
        .on('mouseleave', () => {
          setHoveredCase(null);
        })
        .on('click', () => {
          setSelectedCaseModal(p.caseItem);
        });

      // Outer ripple / beacon ring
      pointG
        .append('circle')
        .attr('r', isCritical ? 14 : 10)
        .attr('fill', pointColor)
        .attr('fill-opacity', 0.18)
        .attr('stroke', pointColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.7);

      // Core dot
      pointG
        .append('circle')
        .attr('r', isCritical ? 6 : 4.5)
        .attr('fill', pointColor)
        .attr('filter', isCritical ? 'url(#neonGlow)' : undefined);

      // Case code tag
      pointG
        .append('text')
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#dae2fd')
        .attr('font-size', '9px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', 'bold')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#070d18')
        .attr('stroke-width', 2.5)
        .text(p.caseItem.id);
    });

    // 5. Compass Rose / North Indicator
    const compassG = g
      .append('g')
      .attr('transform', `translate(${innerWidth - 30}, 25)`)
      .attr('opacity', 0.85);

    compassG
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#0b1326')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1);

    compassG
      .append('path')
      .attr('d', 'M 0 -12 L 4 0 L -4 0 Z')
      .attr('fill', '#ef4444');

    compassG
      .append('path')
      .attr('d', 'M 0 12 L 4 0 L -4 0 Z')
      .attr('fill', '#94a3b8');

    compassG
      .append('text')
      .attr('x', 0)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#dae2fd')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .text('N');
  }, [mappedPoints, showDensityContours, showGridAxes]);

  return (
    <div
      id="risk-heatmap-section"
      className="bg-[#131b2e] border border-[#222a3d] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222a3d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#f59e0b] flex items-center justify-center border border-amber-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                D3 GEORREFERENCIACIÓN // HEATMAP
              </span>
              <span className="font-mono text-[9px] text-[#94a3b8]">
                {mappedPoints.length} Puntos Activos
              </span>
            </div>
            <h3 className="font-['Chivo'] font-black text-sm sm:text-base text-[#dae2fd] uppercase tracking-wide">
              Mapa de Calor de Riesgos Críticos en Obra
            </h3>
          </div>
        </div>

        {/* Display Toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowDensityContours(!showDensityContours)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
              showDensityContours
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b]'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Densidad Térmica</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGridAxes(!showGridAxes)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
              showGridAxes
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-[#0b1326] text-[#94a3b8] border-[#1e293b]'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Ejes Estructurales</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
        {/* Frente Filter */}
        <div className="flex items-center gap-1 bg-[#0b1326] px-2.5 py-1 rounded-xl border border-[#1e293b] shrink-0">
          <span className="text-[#94a3b8] text-[10px]">Frente:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-transparent text-[#dae2fd] font-bold outline-none cursor-pointer text-xs"
          >
            <option value="TODOS" className="bg-[#0c1322]">
              Todos los Frentes
            </option>
            {FRENTES_OBRA.map((f) => (
              <option key={f} value={f} className="bg-[#0c1322]">
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-[#0b1326] px-2.5 py-1 rounded-xl border border-[#1e293b] shrink-0">
          <span className="text-[#94a3b8] text-[10px]">Prioridad:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-transparent text-[#dae2fd] font-bold outline-none cursor-pointer text-xs"
          >
            <option value="TODOS" className="bg-[#0c1322]">
              Todas
            </option>
            <option value="Crítico" className="bg-[#0c1322] text-red-400">
              Crítico
            </option>
            <option value="Alto" className="bg-[#0c1322] text-amber-400">
              Alto
            </option>
            <option value="Medio" className="bg-[#0c1322] text-sky-400">
              Medio
            </option>
          </select>
        </div>

        {/* Risk Type Filter */}
        <div className="flex items-center gap-1 bg-[#0b1326] px-2.5 py-1 rounded-xl border border-[#1e293b] shrink-0">
          <span className="text-[#94a3b8] text-[10px]">Tipo de Peligro:</span>
          <select
            value={selectedRiskType}
            onChange={(e) => setSelectedRiskType(e.target.value)}
            className="bg-transparent text-[#dae2fd] font-bold outline-none cursor-pointer text-xs"
          >
            <option value="TODOS" className="bg-[#0c1322]">
              Todos los Tipos
            </option>
            {RISK_TYPES.map((rt) => (
              <option key={rt.id} value={rt.id} className="bg-[#0c1322]">
                {rt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* D3 Heatmap Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden bg-[#070d18] border border-[#1e293b] shadow-inner"
      >
        <svg ref={svgRef} className="w-full select-none" />

        {/* Interactive Hover Tooltip */}
        {hoveredCase && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#0c1322]/95 border border-[#334155] backdrop-blur-md rounded-xl p-3 shadow-2xl w-64 text-left animate-fade-in"
            style={{
              left: `${hoveredCase.x}px`,
              top: `${hoveredCase.y - 12}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1e293b] mb-1.5">
              <span className="font-mono text-[10px] font-black text-[#f59e0b]">
                #{hoveredCase.item.id}
              </span>
              <span
                className={`font-mono text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  hoveredCase.item.prioridad === 'Crítico'
                    ? 'bg-red-500/25 text-red-300'
                    : 'bg-amber-500/25 text-amber-300'
                }`}
              >
                {hoveredCase.item.prioridad}
              </span>
            </div>

            <div className="font-['Chivo'] font-bold text-xs text-[#dae2fd] truncate">
              {hoveredCase.item.tipo}
            </div>
            <div className="font-mono text-[9px] text-[#94a3b8] mt-0.5">
              {hoveredCase.item.frente} · {hoveredCase.item.ubicacion}
            </div>
            <div className="font-mono text-[8px] text-[#38bdf8] mt-1">
              Responsable: {hoveredCase.item.asignadoA?.nombre || hoveredCase.item.responsable}
            </div>
            <div className="text-[8px] text-[#94a3b8] italic mt-1 pt-1 border-t border-[#1e293b]">
              Haz click para abrir expediente completo
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Legend & Summary Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1e293b] text-xs font-mono text-[#94a3b8]">
        {/* Color Key */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-[#dae2fd]">Intensidad:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
            <span className="text-[10px]">Crítico (SLA 30m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-[10px]">Alto (SLA 2h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            <span className="text-[10px]">Medio (SLA 24h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-[10px]">Subsanado</span>
          </div>
        </div>

        <div className="text-[10px] text-[#64748b]">
          Algoritmo D3 Density / Kernel Grid Intersect
        </div>
      </div>

      {/* Modal for detailed view on click */}
      {selectedCaseModal && (
        <CaseDetailModal
          item={selectedCaseModal}
          onClose={() => setSelectedCaseModal(null)}
        />
      )}
    </div>
  );
};
