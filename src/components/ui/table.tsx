import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BaseProps {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<BaseProps> = ({ children, className }) => (
  <table className={cn('min-w-full divide-y divide-gray-200', className)}>{children}</table>
);

export const TableBody: React.FC<BaseProps> = ({ children, className }) => (
  <tbody className={cn('bg-white divide-y divide-gray-200', className)}>{children}</tbody>
);

export const TableCell: React.FC<BaseProps> = ({ children, className }) => (
  <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-500', className)}>{children}</td>
);

export const TableHead: React.FC<BaseProps> = ({ children, className }) => (
  <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>{children}</th>
);

export const TableHeader: React.FC<BaseProps> = ({ children, className }) => (
  <thead className={cn('bg-gray-50', className)}>{children}</thead>
);

export const TableRow: React.FC<BaseProps> = ({ children, className }) => (
  <tr className={cn('hover:bg-gray-50', className)}>{children}</tr>
);
