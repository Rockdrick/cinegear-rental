/**
 * Calculate project status based on start and end dates
 * @param startDate - Project start date
 * @param endDate - Project end date
 * @param currentStatus - Current status in database (for manual overrides)
 * @returns Calculated status
 */
export const calculateProjectStatus = (
  startDate: string | null,
  endDate: string | null,
  currentStatus?: string
): string => {
  // If status is manually set to Cancelled or On Hold, keep it
  if (currentStatus === 'Cancelled' || currentStatus === 'On Hold') {
    return currentStatus;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If no dates provided, return Planning
  if (!startDate && !endDate) {
    return 'Planning';
  }

  // Parse dates
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  // If project has ended (end date is in the past)
  if (end && end < today) {
    return 'Completed';
  }

  // If project hasn't started yet (start date is in the future)
  if (start && start > today) {
    return 'Planned';
  }

  // If project is currently running (start date is in the past or today, and end date is in the future or null)
  if (start && start <= today && (!end || end >= today)) {
    return 'Active';
  }

  // If only end date is provided and it's in the future, consider it Planned
  if (!start && end && end > today) {
    return 'Planned';
  }

  // If only start date is provided and it's in the past, consider it Active
  if (start && start <= today && !end) {
    return 'Active';
  }

  // Default fallback
  return 'Planning';
};

/**
 * Get status color for UI display
 * @param status - Project status
 * @returns Color class or hex code
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Planned':
      return 'bg-blue-100 text-blue-800';
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-gray-100 text-gray-800';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Planning':
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

/**
 * Get status description for UI display
 * @param status - Project status
 * @returns Human-readable description
 */
export const getStatusDescription = (status: string): string => {
  switch (status) {
    case 'Planned':
      return 'Scheduled to start in the future';
    case 'Active':
      return 'Currently in progress';
    case 'Completed':
      return 'Project has finished';
    case 'On Hold':
      return 'Temporarily paused';
    case 'Cancelled':
      return 'Project was cancelled';
    case 'Planning':
    default:
      return 'In planning phase';
  }
};
