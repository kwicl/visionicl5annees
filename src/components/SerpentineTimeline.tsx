/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import { TimeNode, TimelineConfig, CategoryType } from '../types';
import { getRelativeTime, getSerpentineCoords, generatePathData, formatDateFR } from '../utils';

interface SerpentineTimelineProps {
  config: TimelineConfig;
  nodes: TimeNode[];
  onSelectNodeToEdit: (node: TimeNode) => void;
  onDeleteNode: (id: string) => void;
  selectedNodeId: string | null;
  onSelectNodeId: (id: string | null) => void;
}

const CATEGORY_COLORS: Record<CategoryType, { bg: string; border: string; text: string; pin: string }> = {
  Professional: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', pin: '#3B82F6' },
  Personal: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', pin: '#8B5CF6' },
  Financial: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', pin: '#F59E0B' },
  Health: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', pin: '#EF4444' },
  Growth: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', pin: '#10B981' },
};

export const SerpentineTimeline: React.FC<SerpentineTimelineProps> = ({
  config,
  nodes,
  onSelectNodeToEdit,
  onDeleteNode,
  selectedNodeId,
  onSelectNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout parameters for SVG
  const width = 1600; // Increased width for horizontal span
  const height = 380; // Elegant vertical envelope
  const padding = 50; // Tighter padding so curves touch near the limits
  const amplitude = 135; // Maximized wave swing
  const frequency = 5; // 2.5 full S-curve waves across the screen

  // Today ratio
  const tToday = useMemo(() => {
    return getRelativeTime(config.todayDate, config.startDate, config.endDate);
  }, [config.todayDate, config.startDate, config.endDate]);

  // Today coordinates
  const todayCoords = useMemo(() => {
    return getSerpentineCoords(tToday, width, height, padding, amplitude, frequency);
  }, [tToday]);

  // Map each node to its ratio and coordinates on the horizontal curve
  const mappedNodes = useMemo(() => {
    return nodes.map((node) => {
      const t = getRelativeTime(node.date, config.startDate, config.endDate);
      const coords = getSerpentineCoords(t, width, height, padding, amplitude, frequency);
      return {
        ...node,
        t,
        x: coords.x,
        y: coords.y,
        isPast: t <= tToday,
      };
    }).sort((a, b) => a.t - b.t); // Chronological order
  }, [nodes, config.startDate, config.endDate, tToday]);

  // Year blocks spanning the timeline horizontally
  const yearBlocks = useMemo(() => {
    const years = [2026, 2027, 2028, 2029, 2030];
    const yearNamesFR = {
      2026: 'Fondations & Lancement',
      2027: 'Croissance & Structuration',
      2028: 'Expansion & Stabilisation',
      2029: 'Consécration & Mentorat',
      2030: 'Rayonnement & Transmission',
    };
    return years.map((yr, idx) => {
      const startStr = `${yr}-01-01`;
      // Next year start or end of timeline
      const endStr = yr === 2030 ? '2030-12-31' : `${yr + 1}-01-01`;
      
      const tStart = getRelativeTime(startStr, config.startDate, config.endDate);
      const tEnd = getRelativeTime(endStr, config.startDate, config.endDate);
      
      const xStart = padding + tStart * (width - 2 * padding);
      const xEnd = padding + tEnd * (width - 2 * padding);
      const blockWidth = xEnd - xStart;
      
      const styles = [
        {
          bg: '#F8FAFC',
          borderColor: '#E2E8F0',
          textColor: 'text-slate-700',
          badgeBg: 'bg-slate-100 border-slate-200 text-slate-800',
          fill: '#f1f5f9',
          strokeColor: '#cbd5e1',
          gradient: ['#F8FAFC', '#F1F5F9'],
        },
        {
          bg: '#FFFBEB',
          borderColor: '#FDE68A',
          textColor: 'text-amber-800',
          badgeBg: 'bg-amber-100 border-amber-200 text-amber-900',
          fill: '#fffbeb',
          strokeColor: '#fde68a',
          gradient: ['#FFFBEB', '#FEF3C7'],
        },
        {
          bg: '#F0FDF4',
          borderColor: '#A7F3D0',
          textColor: 'text-emerald-800',
          badgeBg: 'bg-emerald-100 border-emerald-200 text-emerald-900',
          fill: '#f0fdf4',
          strokeColor: '#a7f3d0',
          gradient: ['#F0FDF4', '#D1FAE5'],
        },
        {
          bg: '#F0F9FF',
          borderColor: '#BAE6FD',
          textColor: 'text-sky-800',
          badgeBg: 'bg-sky-100 border-sky-200 text-sky-900',
          fill: '#f0f9ff',
          strokeColor: '#bae6fd',
          gradient: ['#F0F9FF', '#E0F2FE'],
        },
        {
          bg: '#FAF5FF',
          borderColor: '#E9D5FF',
          textColor: 'text-purple-800',
          badgeBg: 'bg-purple-100 border-purple-200 text-purple-900',
          fill: '#faf5ff',
          strokeColor: '#e9d5ff',
          gradient: ['#FAF5FF', '#F3E8FF'],
        }
      ][idx];

      return {
        year: yr,
        label: yearNamesFR[yr as keyof typeof yearNamesFR],
        xStart,
        xEnd,
        width: blockWidth,
        styles,
      };
    });
  }, [config.startDate, config.endDate]);

  // Month markings placed along the horizontal axis
  const monthMarkings = useMemo(() => {
    const years = [2026, 2027, 2028, 2029, 2030];
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const monthNamesFR = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    const list: { x: number; label: string; year: number; month: number }[] = [];
    
    years.forEach((yr) => {
      months.forEach((m) => {
        const dateStr = `${yr}-${String(m).padStart(2, '0')}-01`;
        const t = getRelativeTime(dateStr, config.startDate, config.endDate);
        const x = padding + t * (width - 2 * padding);
        list.push({
          x,
          label: monthNamesFR[m - 1],
          year: yr,
          month: m,
        });
      });
    });
    return list;
  }, [config.startDate, config.endDate, width]);

  // SVG Paths
  const pastPathData = useMemo(() => {
    return generatePathData(0, tToday, 250, width, height, padding, amplitude, frequency);
  }, [tToday]);

  const futurePathData = useMemo(() => {
    return generatePathData(tToday, 1, 250, width, height, padding, amplitude, frequency);
  }, [tToday]);

  // Toggle accordion state
  const handleToggleAccordion = (nodeId: string) => {
    if (selectedNodeId === nodeId) {
      onSelectNodeId(null);
    } else {
      onSelectNodeId(nodeId);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* FULL-WIDTH ROW: The Horizontal Serpentine SVG Canvas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">La Timeline en Serpentin Horizontal</h3>
            <p className="text-[11px] text-gray-500">
              Visualisation panoramique sur 5 ans. Les bords s'étendent au maximum pour une longueur de ligne optimale.
            </p>
          </div>
          <div className="flex gap-4 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Temps écoulé (Passé)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Horizon (Futur)
            </span>
          </div>
        </div>

        {/* Horizontal scroll wrapper with stylized indicators */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
          
          <div 
            ref={containerRef}
            className="w-full overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/20 py-4 px-2"
          >
            {/* SVG with wide viewport for sweeping panoramic experience */}
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="select-none mx-auto"
            >
              {/* Defs for gradients & shadows */}
              <defs>
                <linearGradient id="pastGradHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>

                <linearGradient id="futureGradHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>

                {yearBlocks.map((block) => (
                  <linearGradient id={`bgGrad-${block.year}`} key={block.year} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={block.styles.gradient[0]} />
                    <stop offset="100%" stopColor={block.styles.gradient[1]} />
                  </linearGradient>
                ))}

                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                <style>{`
                  @keyframes haloGlowWide {
                    0% { r: 12px; opacity: 0.9; }
                    50% { r: 35px; opacity: 0.15; }
                    100% { r: 12px; opacity: 0.9; }
                  }
                  @keyframes haloGlowNarrow {
                    0% { r: 8px; opacity: 0.9; }
                    50% { r: 22px; opacity: 0.35; }
                    100% { r: 8px; opacity: 0.9; }
                  }
                  .today-halo-wide {
                    animation: haloGlowWide 2s infinite ease-in-out;
                  }
                  .today-halo-narrow {
                    animation: haloGlowNarrow 2s infinite ease-in-out;
                  }
                `}</style>
              </defs>

              {/* Background Year Blocks / lanes to distinguish each year uniquely */}
              {yearBlocks.map((block, idx) => (
                <g key={block.year}>
                  {/* Outer container of the year block with beautiful soft gradient fill */}
                  <rect
                    x={block.xStart}
                    y={15}
                    width={block.width}
                    height={height - 30}
                    rx="12"
                    fill={`url(#bgGrad-${block.year})`}
                    stroke={block.styles.borderColor}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                  
                  {/* Subtle top banner block for the Year Header */}
                  <path
                    d={`M ${block.xStart + 12} 15 L ${block.xStart + block.width - 12} 15 A 12 12 0 0 1 ${block.xStart + block.width} 27 L ${block.xStart + block.width} 44 L ${block.xStart} 44 L ${block.xStart} 27 A 12 12 0 0 1 ${block.xStart + 12} 15 Z`}
                    fill="#FFFFFF"
                    opacity="0.85"
                  />

                  {/* Year Number Title */}
                  <text
                    x={block.xStart + block.width / 2}
                    y={31}
                    fill="#1F2937"
                    fontSize="12"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    letterSpacing="0.05em"
                  >
                    {block.year}
                  </text>

                  {/* Year Subtitle/Label describing the theme */}
                  <text
                    x={block.xStart + block.width / 2}
                    y={41}
                    fill="#6B7280"
                    fontSize="7.5"
                    fontWeight="800"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    {block.label}
                  </text>

                  {/* Vertical division line on the right boundary of the year */}
                  {idx < yearBlocks.length - 1 && (
                    <line
                      x1={block.xEnd}
                      y1={15}
                      x2={block.xEnd}
                      y2={height - 15}
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeDasharray="4 6"
                      opacity="0.4"
                    />
                  )}
                </g>
              ))}

              {/* Subtle background vertical guidelines for each Month */}
              {monthMarkings.map((month) => {
                const isJan = month.month === 1;
                return (
                  <g key={`${month.year}-${month.month}`}>
                    {!isJan && (
                      <line
                        x1={month.x}
                        y1={44}
                        x2={month.x}
                        y2={height - 24}
                        stroke="#94A3B8"
                        strokeWidth="0.5"
                        strokeDasharray="2 3"
                        opacity="0.25"
                      />
                    )}
                    <text
                      x={month.x}
                      y={height - 16}
                      fill="#64748B"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                      fontWeight="500"
                      textAnchor="middle"
                      opacity="0.5"
                    >
                      {month.label}
                    </text>
                  </g>
                );
              })}

              {/* PAST SERPENTINE PATH (Red / Orange) */}
              <path
                d={pastPathData}
                fill="none"
                stroke="url(#pastGradHorizontal)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* FUTURE SERPENTINE PATH (Sky-Blue / Green) */}
              <path
                d={futurePathData}
                fill="none"
                stroke="url(#futureGradHorizontal)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 1.2"
                className="transition-all duration-300"
              />

              {/* White overlay path for depth */}
              <path
                d={pastPathData}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* TODAY CURSOR INDICATOR (Highly remarkable, glowing and animated) */}
              <g className="cursor-pointer">
                {/* Outermost pulsing glow */}
                <circle
                  cx={todayCoords.x}
                  cy={todayCoords.y}
                  className="today-halo-wide"
                  fill="#FF6B00"
                  opacity="0.4"
                />
                {/* Innermost pulsing glow */}
                <circle
                  cx={todayCoords.x}
                  cy={todayCoords.y}
                  className="today-halo-narrow"
                  fill="#EF4444"
                  opacity="0.6"
                />
                {/* Luminous halo border */}
                <circle
                  cx={todayCoords.x}
                  cy={todayCoords.y}
                  r="14"
                  fill="#FFF"
                  stroke="#FF6B00"
                  strokeWidth="4"
                  filter="url(#glow)"
                />
                {/* Flashing core */}
                <circle
                  cx={todayCoords.x}
                  cy={todayCoords.y}
                  r="5"
                  fill="#EF4444"
                  className="animate-pulse"
                />

                {/* "Aujourd'hui" Banner */}
                <foreignObject
                  x={todayCoords.x - 60}
                  y={todayCoords.y > height / 2 ? todayCoords.y - 52 : todayCoords.y + 20}
                  width="120"
                  height="30"
                >
                  <div className="bg-orange-600 text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-md shadow-md border border-orange-400 text-center tracking-wider flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    Aujourd'hui
                  </div>
                </foreignObject>
              </g>

              {/* INTERACTIVE NODES & FLOATING LABELS */}
              {mappedNodes.map((node) => {
                const isCurveHigh = node.y < height / 2;
                const activeColor = node.isPast ? '#F97316' : '#10B981';
                const catConfig = CATEGORY_COLORS[node.category];
                const isSelected = selectedNodeId === node.id;

                // Connecting wire length
                const wireLen = 22;
                const targetY = isCurveHigh ? node.y + wireLen : node.y - wireLen;

                return (
                  <g key={node.id} className="group cursor-pointer">
                    
                    {/* Vertical connecting wire at 90 degrees */}
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={node.x}
                      y2={targetY}
                      stroke={activeColor}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />

                    {/* Distinctive shapes for milestone points */}
                    {node.type === 'milestone' ? (
                      // Diamond for Milestones
                      <g onClick={() => handleToggleAccordion(node.id)}>
                        {isSelected && (
                          <polygon
                            points={`${node.x},${node.y - 12} ${node.x + 12},${node.y} ${node.x},${node.y + 12} ${node.x - 12},${node.y}`}
                            fill="none"
                            stroke={activeColor}
                            strokeWidth="3.5"
                            opacity="0.5"
                            className="animate-ping"
                          />
                        )}
                        <polygon
                          points={`${node.x},${node.y - 8.5} ${node.x + 8.5},${node.y} ${node.x},${node.y + 8.5} ${node.x - 8.5},${node.y}`}
                          fill="#FFFFFF"
                          stroke={activeColor}
                          strokeWidth={isSelected ? '4' : '2.5'}
                          className="transition-all duration-200 hover:scale-125"
                        />
                        <polygon
                          points={`${node.x},${node.y - 4} ${node.x + 4},${node.y} ${node.x},${node.y + 4} ${node.x - 4},${node.y}`}
                          fill={catConfig.pin}
                        />
                      </g>
                    ) : node.type === 'project' ? (
                      // Rounded square for Projects
                      <g onClick={() => handleToggleAccordion(node.id)}>
                        {isSelected && (
                          <rect
                            x={node.x - 7.5}
                            y={node.y - 7.5}
                            width="15"
                            height="15"
                            rx="3"
                            fill="none"
                            stroke={activeColor}
                            strokeWidth="3.5"
                            opacity="0.5"
                            className="animate-ping"
                          />
                        )}
                        <rect
                          x={node.x - 5.5}
                          y={node.y - 5.5}
                          width="11"
                          height="11"
                          rx="2.5"
                          fill="#FFFFFF"
                          stroke={activeColor}
                          strokeWidth={isSelected ? '4' : '2.5'}
                          className="transition-all duration-200 hover:scale-125"
                        />
                        <rect
                          x={node.x - 2.5}
                          y={node.y - 2.5}
                          width="5"
                          height="5"
                          rx="1"
                          fill={catConfig.pin}
                        />
                      </g>
                    ) : (
                      // Circle for observations
                      <g onClick={() => handleToggleAccordion(node.id)}>
                        {isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="11"
                            fill="none"
                            stroke={activeColor}
                            strokeWidth="3.5"
                            opacity="0.5"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSelected ? '8' : '6'}
                          fill="#FFFFFF"
                          stroke={activeColor}
                          strokeWidth={isSelected ? '4' : '2.5'}
                          className="transition-all duration-200 hover:scale-125"
                        />
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="2.5"
                          fill={catConfig.pin}
                        />
                      </g>
                    )}

                    {/* Floating Label in exactly 90 degrees vertical alignment */}
                    <g transform={`translate(${node.x}, ${isCurveHigh ? node.y + wireLen : node.y - wireLen}) rotate(${isCurveHigh ? 90 : -90})`}>
                      <foreignObject
                        x={0}
                        y={-20}
                        width={130}
                        height={40}
                        onClick={() => handleToggleAccordion(node.id)}
                      >
                        <div className={`h-full flex items-center px-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-400 shadow-md scale-105'
                            : 'bg-white/95 hover:bg-white text-gray-800 border-gray-200 shadow-2xs hover:border-gray-400'
                        }`}>
                          <div className="flex flex-col justify-center min-w-0 w-full">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[8px] font-mono font-extrabold leading-none ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                                {formatDateFR(node.date)}
                              </span>
                              <span 
                                className="w-2 h-2 rounded-full border border-white shrink-0" 
                                style={{ backgroundColor: catConfig.pin }}
                                title={node.category}
                              />
                            </div>
                            <div className={`text-[10px] font-extrabold truncate mt-0.5 ${isSelected ? 'text-white' : 'text-gray-900'}`} title={node.title}>
                              {node.title}
                            </div>
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-medium">
          <span>💡 Astuce : Faites défiler horizontalement pour balayer les 5 ans.</span>
          <span>🖱️ Cliquez sur n'importe quel jalon ou projet pour déplier ses notes et observations.</span>
        </div>
      </div>

      {/* LOWER ROW: Accordion Observations & Action Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Detail/Accordion View */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-orange-500" />
              Observations & Détails du jalon sélectionné
            </h3>
            <p className="text-xs text-gray-500">
              Cliquez sur un jalon ci-dessus pour afficher et explorer ses notes d'observations ou son plan de route.
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {mappedNodes.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                Aucun jalon enregistré pour le moment.
              </div>
            ) : (
              (() => {
                let lastYear: number | null = null;
                return mappedNodes.map((node) => {
                  const nodeYear = new Date(node.date).getFullYear();
                  const showYearSeparator = nodeYear !== lastYear;
                  lastYear = nodeYear;

                  const block = yearBlocks.find((b) => b.year === nodeYear);
                  const yearLabel = block ? block.label : '';

                  const isOpen = selectedNodeId === node.id;
                  const cat = CATEGORY_COLORS[node.category];

                  return (
                    <React.Fragment key={node.id}>
                      {showYearSeparator && (
                        <div className={`mt-6 mb-3 first:mt-0 px-3.5 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 border transition-all ${
                          nodeYear === 2026 ? 'bg-slate-50 text-slate-800 border-slate-100' :
                          nodeYear === 2027 ? 'bg-amber-50/50 text-amber-900 border-amber-100/60' :
                          nodeYear === 2028 ? 'bg-emerald-50/50 text-emerald-900 border-emerald-100/60' :
                          nodeYear === 2029 ? 'bg-sky-50/50 text-sky-900 border-sky-100/60' :
                          'bg-purple-50/50 text-purple-900 border-purple-100/60'
                        }`}>
                          <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: block?.styles.strokeColor || '#9CA3AF' }} />
                            Projection de l'Année {nodeYear}
                          </span>
                          <span className="text-[10px] font-bold opacity-75 italic sm:not-italic">
                            🎯 Thème : {yearLabel}
                          </span>
                        </div>
                      )}

                      <div
                        id={`accordion-node-${node.id}`}
                        className={`border rounded-xl transition-all ${
                          isOpen
                            ? 'border-orange-400 bg-orange-50/10 shadow-sm'
                            : 'border-gray-100 bg-white hover:bg-gray-50/50'
                        }`}
                      >
                        {/* Header trigger */}
                        <div
                          onClick={() => handleToggleAccordion(node.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              className={`p-1 rounded-lg transition-all ${
                                isOpen ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {isOpen ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${cat.bg} ${cat.text}`}>
                                  {node.category}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {formatDateFR(node.date)}
                                </span>
                                {node.isPast ? (
                                  <span className="text-[9px] text-amber-600 font-semibold bg-amber-50 px-1 rounded-sm border border-amber-100">
                                    Passé
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded-sm border border-emerald-100">
                                    Futur (Projection)
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="text-xs font-bold text-gray-800 truncate mt-1">
                                {node.title}
                              </h4>
                            </div>
                          </div>

                          <span className="text-[9px] font-semibold text-gray-400 font-mono shrink-0 hidden sm:inline-block">
                            {node.type === 'project' && '📁 Projet'}
                            {node.type === 'milestone' && '🏆 Jalon'}
                            {node.type === 'observation' && '📝 Observation'}
                          </span>
                        </div>

                        {/* Expanded observations panel */}
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1.5 border-t border-dashed border-gray-100 space-y-3">
                            {node.description && (
                              <p className="text-xs text-gray-500 font-normal leading-relaxed italic">
                                {node.description}
                              </p>
                            )}
                            
                            <div className="bg-white border border-gray-100 p-3.5 rounded-lg space-y-1.5 shadow-2xs">
                              <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1 font-mono">
                                <FileText className="w-3 h-3 text-orange-500" />
                                {node.isPast ? 'Observations rédigées :' : 'Plan de projection & route :'}
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-line">
                                {node.notes}
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                              <button
                                onClick={() => onSelectNodeToEdit(node)}
                                className="text-[10px] font-bold text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-orange-100 transition-all cursor-pointer"
                              >
                                Modifier cette saisie
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteNode(node.id);
                                  onSelectNodeId(null);
                                }}
                                className="text-[10px] font-bold text-red-600 hover:text-white bg-white hover:bg-red-500 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-500 transition-all cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                });
              })()
            )}
          </div>
        </div>

        {/* Tip & Informative Panel */}
        <div className="md:col-span-4 bg-linear-to-tr from-gray-900 to-gray-800 rounded-2xl p-5 text-white flex flex-col justify-between h-fit min-h-[180px] shadow-sm">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2 font-mono">
              💡 Conseil de projection
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              La timeline en serpentin horizontal vous aide à équilibrer votre passé et votre futur de gauche à droite. 
              Analysez les <strong>observations écrites</strong> de votre passé pour affiner de manière réaliste votre trajectoire vers les 4 à 5 prochaines années.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-800/80 text-[10px] text-gray-400 font-mono mt-3">
            Kwicl vision — Projection de Vie
          </div>
        </div>

      </div>
    </div>
  );
};
