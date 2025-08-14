declare module 'react-calendar-timeline' {
  import * as React from 'react';

  export interface TimelineGroup {
    id: number | string;
    title: string;
  }

  export interface TimelineItem {
    id: number | string;
    group: number | string;
    title: string;
    start_time: number | Date;
    end_time: number | Date;
    [key: string]: any;
  }

  export interface TimelineProps {
    groups: TimelineGroup[];
    items: TimelineItem[];
    defaultTimeStart?: Date;
    defaultTimeEnd?: Date;
    sidebarWidth?: number;
    lineHeight?: number;
    itemHeightRatio?: number;
    canMove?: boolean;
    canResize?: boolean;
    stackItems?: boolean;
    itemRenderer?: any;
    onItemClick?: (itemId: number | string, e: React.SyntheticEvent) => void;
    [key: string]: any;
  }

  const Timeline: React.FC<TimelineProps>;

  export const TimelineMarkers: any;
  export const CustomMarker: any;
  export const TimelineHeaders: any;
  export const SidebarHeader: any;
  export const DateHeader: any;

  export default Timeline;
}
