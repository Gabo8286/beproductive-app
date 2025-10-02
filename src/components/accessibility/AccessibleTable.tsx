import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T = any> {
  id: string;
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  headerScope?: 'col' | 'row';
}

interface AccessibleTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  hideCaption?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Accessible table component with proper ARIA semantics
 * Implements WCAG table requirements with captions, scope attributes, and proper roles
 * 
 * @param data - Array of data objects to display
 * @param columns - Column definitions with headers and accessors
 * @param caption - Table caption for context (required for accessibility)
 * @param hideCaption - Visually hide caption but keep it for screen readers
 * @param ariaLabel - Optional ARIA label for the table
 */
export function AccessibleTable<T = any>({
  data,
  columns,
  caption,
  hideCaption = false,
  className,
  ariaLabel,
}: AccessibleTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    if (column.accessor) {
      const value = row[column.accessor];
      return value as ReactNode;
    }
    return null;
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table 
        role="table" 
        aria-label={ariaLabel}
        className="w-full border-collapse"
      >
        {caption && (
          <caption className={cn(
            "text-sm font-medium mb-2 text-left",
            hideCaption && "sr-only"
          )}>
            {caption}
          </caption>
        )}
        
        <thead>
          <tr role="row">
            {columns.map((col) => (
              <th
                key={col.id}
                scope={col.headerScope || 'col'}
                role="columnheader"
                className="px-4 py-3 text-left text-sm font-semibold border-b"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr role="row">
              <td 
                role="cell" 
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                role="row"
                className="border-b hover:bg-accent/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    role="cell"
                    className="px-4 py-3 text-sm"
                  >
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
