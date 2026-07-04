import { TimeNode, TimelineConfig } from './types';

// The timeline spans from 2026-01-01 to 2030-12-31 (5 Years)
// Today is exactly 2026-07-04
export const DEFAULT_CONFIG: TimelineConfig = {
  startDate: '2026-01-01',
  endDate: '2030-12-31',
  todayDate: '2026-07-04',
};

export const INITIAL_NODES: TimeNode[] = [];
