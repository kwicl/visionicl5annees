/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PeriodType = 'past' | 'future';
export type ItemType = 'project' | 'milestone' | 'observation';
export type CategoryType = 'Professional' | 'Personal' | 'Financial' | 'Health' | 'Growth';

export interface TimeNode {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format: YYYY-MM-DD
  type: ItemType;
  category: CategoryType;
  notes: string;
  completed?: boolean;
}

export interface TimelineConfig {
  startDate: string; // e.g. 2024-07-01
  endDate: string; // e.g. 2029-06-30
  todayDate: string; // e.g. 2026-07-04
}
