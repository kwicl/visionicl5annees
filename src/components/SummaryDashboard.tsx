/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LayoutGrid, CalendarDays, Search, Trash2, Edit3, CheckCircle, Clock, BookOpen, Filter } from 'lucide-react';
import { TimeNode, CategoryType } from '../types';
import { formatDateFR, getWeekNumber, formatMonthYearFR } from '../utils';

interface SummaryDashboardProps {
  nodes: TimeNode[];
  onEditNode: (node: TimeNode) => void;
  onDeleteNode: (id: string) => void;
}

type GroupViewMode = 'week' | 'month';

const CATEGORY_TAGS: Record<CategoryType, { bg: string; text: string; dot: string; label: string }> = {
  Professional: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Pro' },
  Personal: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Perso' },
  Financial: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Finance' },
  Health: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Santé' },
  Growth: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Développement' },
};

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  nodes,
  onEditNode,
  onDeleteNode,
}) => {
  const [viewMode, setViewMode] = useState<GroupViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter and sort nodes initially
  const filteredNodes = useMemo(() => {
    return nodes
      .filter((node) => {
        const matchesSearch =
          node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.notes.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'ALL' || node.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [nodes, searchQuery, selectedCategory]);

  // Group by Week: "Année W[Numéro]"
  const groupedByWeek = useMemo(() => {
    const groups: Record<string, { label: string; nodes: TimeNode[]; completedCount: number }> = {};
    
    filteredNodes.forEach((node) => {
      const d = new Date(node.date);
      if (isNaN(d.getTime())) return;
      
      const { week, year } = getWeekNumber(d);
      // Format: "Semaine 42, 2024" or similar
      const key = `${year}-W${String(week).padStart(2, '0')}`;
      const label = `Semaine ${week}, ${year}`;
      
      if (!groups[key]) {
        groups[key] = { label, nodes: [], completedCount: 0 };
      }
      
      groups[key].nodes.push(node);
      if (node.completed) {
        groups[key].completedCount++;
      }
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredNodes]);

  // Group by Month: "Année - Mois (Numéro)"
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, { label: string; nodes: TimeNode[]; completedCount: number }> = {};
    
    filteredNodes.forEach((node) => {
      const d = new Date(node.date);
      if (isNaN(d.getTime())) return;
      
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      // Capitalize first letter of month
      const rawLabel = formatMonthYearFR(node.date);
      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
      
      if (!groups[key]) {
        groups[key] = { label, nodes: [], completedCount: 0 };
      }
      
      groups[key].nodes.push(node);
      if (node.completed) {
        groups[key].completedCount++;
      }
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredNodes]);

  const activeGroups = viewMode === 'week' ? groupedByWeek : groupedByMonth;

  return (
    <div id="summary-dashboard-container" className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 md:p-6 transition-all">
      
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              Récapitulatif & Progression
            </h3>
            <p className="text-xs text-gray-500">
              {filteredNodes.length} éléments sur {nodes.length} filtrés et groupés.
            </p>
          </div>

          {/* View Toggles (Semaine vs Mois) */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit self-start sm:self-center border border-gray-200/50">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Vue par Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Vue par Mois
            </button>
          </div>
        </div>

        {/* Input search and category filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher un projet, une note, un jalon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-hidden transition-all text-gray-800"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Filter className="w-4 h-4" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-hidden transition-all text-gray-800 appearance-none cursor-pointer"
            >
              <option value="ALL">🔍 Toutes thématiques</option>
              <option value="Professional">💼 Professionnel</option>
              <option value="Personal">🎨 Personnel / Vie</option>
              <option value="Financial">📈 Finances / Investissement</option>
              <option value="Health">❤️ Santé & Sport</option>
              <option value="Growth">🌱 Développement & Sagesse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Aggregated Groups */}
      {activeGroups.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Aucun élément trouvé.</p>
          <p className="text-xs text-gray-400 mt-1">Essayez de réinitialiser vos filtres ou de créer de nouvelles saisies.</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
          {activeGroups.map(([key, group]) => {
            const pct = Math.round((group.completedCount / group.nodes.length) * 100);
            
            return (
              <div key={key} className="border border-gray-100 rounded-xl p-4 bg-gray-50/40 hover:bg-gray-50 transition-all">
                
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {group.label}
                  </h4>
                  
                  {/* Completion Mini Progress Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                      {group.completedCount} / {group.nodes.length} Réalisés
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-linear-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Nodes inside group */}
                <div className="space-y-3">
                  {group.nodes.map((node) => {
                    const tag = CATEGORY_TAGS[node.category];
                    
                    return (
                      <div
                        key={node.id}
                        className="bg-white border border-gray-100/80 rounded-xl p-3.5 shadow-xs hover:border-gray-300/60 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Title and Badge */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${tag.bg} ${tag.text}`}>
                              {tag.label}
                            </span>
                            
                            <h5 className="text-xs font-bold text-gray-800 truncate">
                              {node.title}
                            </h5>

                            <span className="text-[10px] text-gray-400 font-mono">
                              ({formatDateFR(node.date)})
                            </span>
                          </div>

                          {/* Quick description */}
                          {node.description && (
                            <p className="text-xs text-gray-500 italic truncate pl-1">
                              {node.description}
                            </p>
                          )}

                          {/* Collapsible observation notes */}
                          <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-2.5 mt-1 text-[11px] text-gray-600 leading-relaxed font-normal whitespace-pre-line">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1 font-mono">
                              {node.completed ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-amber-500" />
                                  Observations & Feedbacks :
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-emerald-500" />
                                  Feuille de route & Projection :
                                </>
                              )}
                            </div>
                            {node.notes}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            onClick={() => onEditNode(node)}
                            title="Modifier cette saisie"
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNode(node.id)}
                            title="Supprimer cette saisie"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
