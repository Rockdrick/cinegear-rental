import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  status: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ 
  status, 
  isActive, 
  onClick, 
  className 
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "planned": return "bg-blue-100 text-blue-800 border-blue-200";
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "on hold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "planning": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInactiveColor = () => {
    return "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none",
        isActive ? getStatusColor(status) : getInactiveColor(),
        "hover:scale-105 active:scale-95",
        className
      )}
    >
      {status}
    </button>
  );
};

interface StatusToggleGroupProps {
  statuses: string[];
  activeStatuses: string[];
  onToggle: (status: string) => void;
  className?: string;
}

export const StatusToggleGroup: React.FC<StatusToggleGroupProps> = ({
  statuses,
  activeStatuses,
  onToggle,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {statuses.map((status) => (
        <StatusToggle
          key={status}
          status={status}
          isActive={activeStatuses.includes(status)}
          onClick={() => onToggle(status)}
        />
      ))}
    </div>
  );
};

export default StatusToggle;
