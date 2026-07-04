/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Compass, TrendingUp, CheckCircle, Flame } from 'lucide-react';
import { TimeNode, TimelineConfig } from '../types';
import { getRelativeTime } from '../utils';

interface HeaderProps {
  config: TimelineConfig;
  nodes: TimeNode[];
}

export const Header: React.FC<HeaderProps> = ({ config, nodes }) => {
  const elapsedPercent = Math.round(getRelativeTime(config.todayDate, config.startDate, config.endDate) * 100);
  const completedCount = nodes.filter(n => n.completed).length;
  const futureCount = nodes.filter(n => !n.completed).length;
  const totalCount = nodes.length;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-tr from-orange-500 to-amber-500 rounded-2xl text-white shadow-md shadow-orange-100">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Kwicl vision <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">4 Ans d'Avenir</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-normal">
                Projection & visualisation de vie sur la période 2026 — 2029
              </p>
            </div>
          </div>

          {/* Quick Stats Grid with Time vs Projects Ratio Comparison */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:w-auto w-full">
            
            {/* Unified Comparison Panel: Temps Écoulé vs Projets En Cours et Planifiés */}
            <div className="bg-gray-900 text-white rounded-xl p-3.5 border border-gray-800 shadow-sm flex flex-col gap-2 min-w-[280px] sm:min-w-[340px]">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-400 font-bold font-mono">
                <span>Temps écoulé vs Projets</span>
                <span className="text-orange-400 font-extrabold animate-pulse">● Comparatif</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Temps écoulé */}
                <div className="border-r border-gray-800 pr-2">
                  <div className="text-[10px] text-gray-400">Temps Écoulé</div>
                  <div className="text-lg font-extrabold text-orange-400 font-mono">
                    {elapsedPercent}%
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${elapsedPercent}%` }} />
                  </div>
                </div>

                {/* Projets Planifiés / En cours */}
                <div className="pl-1">
                  <div className="text-[10px] text-gray-400">Planifiés & En cours</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono">
                    {Math.round((futureCount / (totalCount || 1)) * 100)}%
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    {futureCount} sur {totalCount} jalons
                  </div>
                </div>
              </div>

              {/* Status helper */}
              <div className="text-[9.5px] text-gray-300 border-t border-gray-800/60 pt-1.5 flex justify-between">
                <span>Statut :</span>
                <span className="font-semibold text-orange-300">
                  {elapsedPercent > Math.round((futureCount / (totalCount || 1)) * 100) 
                    ? "En avance sur l'horizon" 
                    : "Plan de projection équilibré"}
                </span>
              </div>
            </div>

            {/* General Counts for quick oversight */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center min-w-[90px]">
                <span className="text-[8.5px] uppercase tracking-wider text-gray-400 font-semibold font-mono">Réalisés (Passé)</span>
                <span className="text-sm font-extrabold text-gray-800">{completedCount}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex flex-col justify-center min-w-[90px]">
                <span className="text-[8.5px] uppercase tracking-wider text-gray-400 font-semibold font-mono">Cibles (Futur)</span>
                <span className="text-sm font-extrabold text-emerald-600">{futureCount}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
