import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useDashboardData = () => {
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => apiClient.getItems(),
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiClient.getBookings(),
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });

  const isLoading = itemsLoading || bookingsLoading || projectsLoading;

  // Calculate stats
  const totalGear = items?.length || 0;
  const activeBookings = bookings?.filter(booking => 
    booking.status === 'Confirmed' || booking.status === 'Checked Out'
  ).length || 0;
  const teamMembers = 8; // From imported users
  const itemsInService = items?.filter(item => 
    item.currentCondition.name === 'Needs Repair' || item.currentCondition.name === 'Out of Service'
  ).length || 0;

  return {
    totalGear,
    activeBookings,
    teamMembers,
    itemsInService,
    isLoading,
    items,
    bookings,
    projects
  };
};
