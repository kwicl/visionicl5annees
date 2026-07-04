/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimeNode, TimelineConfig } from './types';

/**
 * Calculates a relative factor (0 to 1) for a given date within a range.
 */
export function getRelativeTime(dateStr: string, startDateStr: string, endDateStr: string): number {
  const date = new Date(dateStr).getTime();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  
  if (isNaN(date)) return 0.5;
  if (date <= start) return 0;
  if (date >= end) return 1;
  
  return (date - start) / (end - start);
}

/**
 * Computes the (x, y) coordinates on the horizontal serpentine timeline for a relative time t.
 */
export function getSerpentineCoords(
  t: number,
  width = 1600,
  height = 360,
  padding = 40,
  amplitude = 140,
  frequency = 5
): { x: number; y: number } {
  // Constrain t to [0, 1]
  const ct = Math.max(0, Math.min(1, t));
  
  // x grows linearly from left to right
  const x = padding + ct * (width - 2 * padding);
  
  // y winds up and down (vertically) using a sine wave
  // A frequency of 5 gives exactly 2.5 cycles, aligning loops perfectly over 5 years.
  const y = height / 2 + Math.sin(ct * Math.PI * frequency) * amplitude;
  
  return { x, y };
}

/**
 * Generates an SVG path data string (d attribute) for a given range [t_start, t_end].
 */
export function generatePathData(
  tStart: number,
  tEnd: number,
  steps = 150,
  width = 1600,
  height = 360,
  padding = 40,
  amplitude = 140,
  frequency = 5
): string {
  if (tStart >= tEnd) return '';
  
  const points: string[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = tStart + (i / steps) * (tEnd - tStart);
    const { x, y } = getSerpentineCoords(t, width, height, padding, amplitude, frequency);
    if (i === 0) {
      points.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    } else {
      points.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  
  return points.join(' ');
}

/**
 * Formats a date string to a human-readable French format.
 * e.g. "2024-10-12" -> "12 Oct 2024"
 */
export function formatDateFR(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = [
    'Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Formats a date to French month & year only.
 * e.g. "2024-10-12" -> "Octobre 2024"
 */
export function formatMonthYearFR(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = [
    'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars',
    'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre'
  ];
  
  // Let's use the real JavaScript locale formatting in French for full accuracy
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/**
 * Get the ISO week number and year.
 */
export function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}
