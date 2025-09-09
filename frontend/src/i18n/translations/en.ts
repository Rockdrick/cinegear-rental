export const en = {
  // Navigation
  nav: {
    title: "MVD Assist",
    subtitle: "Equipment Management System",
    dashboard: "Dashboard",
    gear: "Gear Inventory",
    bookings: "Bookings",
    projects: "Projects",
    team: "Team",
    settings: "Settings",
    searchPlaceholder: "Search gear, projects...",
    profile: {
      name: "John Smith",
      role: "Gear Manager"
    }
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back! Here's what's happening with your gear and team.",
    stats: {
      totalGear: "Total Gear Items",
      activeBookings: "Active Bookings", 
      teamMembers: "Team Members",
      itemsInService: "Items in Service",
      changes: {
        thisMonth: "this month",
        dueToday: "due today",
        onAssignment: "on assignment",
        overdue: "overdue"
      }
    },
    alerts: {
      title: "Recent Alerts",
      viewAll: "View All Alerts",
      items: {
        dueback: "Sony FX6 Camera Kit due back today",
        calibration: "Arri SkyPanel needs calibration",
        request: "New gear request from Project Alpha"
      }
    },
    quickActions: {
      title: "Quick Actions",
      createBooking: "Create New Booking",
      checkAvailability: "Check Gear Availability",
      generateReport: "Generate Inventory Report"
    },
    buttons: {
      exportReport: "Export Report",
      addBooking: "Add Booking",
      viewAllGear: "View All Gear"
    },
    recentActivity: "Recent Gear Activity"
  },

  // Gear
  gear: {
    status: {
      available: "Available",
      booked: "Booked", 
      maintenance: "Maintenance",
      unavailable: "Unavailable"
    },
    actions: {
      view: "View",
      edit: "Edit",
      book: "Book"
    },
    next: "Next",
    items: {
      sonyFx6: "Sony FX6 Camera Kit",
      redKomodo: "RED Komodo 6K",
      arriSkyPanel: "Arri SkyPanel S60-C",
      canon2470: "Canon 24-70mm f/2.8L"
    },
    categories: {
      camera: "Camera",
      lighting: "Lighting",
      lens: "Lens"
    },
    locations: {
      studioAShelf2: "Studio A - Shelf 2",
      studioBCheckout: "Studio B - Checkout",
      repairBay: "Repair Bay",
      studioALensCabinet: "Studio A - Lens Cabinet"
    }
  },

  // Calendar/Bookings
  calendar: {
    title: "Booking Calendar",
    newBooking: "New Booking",
    upcomingBookings: "Upcoming Bookings",
    status: {
      confirmed: "confirmed",
      pending: "pending"
    },
    bookings: {
      commercial: "Commercial Shoot - Sony FX6 Kit",
      documentary: "Documentary - RED Camera Package", 
      corporate: "Corporate Video - Lighting Kit A",
      musicVideo: "Music Video - Gimbal & Lens Set"
    },
    months: {
      january: "January"
    },
    days: {
      sun: "Sun",
      mon: "Mon", 
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat"
    }
  },

  // Projects
  projects: {
    title: "Projects",
    subtitle: "Manage your production projects and clients",
    createProject: "Create Project",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    noProjects: "No projects yet",
    createFirst: "Create your first project to get started",
    noProjectsWithStatus: "No projects with selected status",
    noProjectsWithStatuses: "No projects with selected statuses",
    tryDifferentFilters: "Try selecting different status filters",
    viewAllProjects: "View All Projects",
    projectsCalendar: "Projects Calendar",
    status: {
      planning: "Planning",
      planned: "Planned",
      active: "Active", 
      completed: "Completed",
      onHold: "On Hold",
      cancelled: "Cancelled"
    }
  },

  // Team
  team: {
    title: "Team Members",
    subtitle: "Manage your team members and their information",
    createMember: "Add Team Member",
    editMember: "Edit Team Member",
    deleteMember: "Delete Team Member",
    noMembers: "No team members yet",
    createFirst: "Add your first team member to get started",
    showingMembers: "Showing {start}-{end} of {total} members",
    permissions: {
      viewGear: "View Gear Inventory",
      editGear: "Edit Gear Inventory",
      viewBookings: "View Bookings",
      editBookings: "Edit Bookings",
      viewProjects: "View Projects",
      editProjects: "Edit Projects",
      viewTeam: "View Team",
      editTeam: "Edit Team"
    }
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import"
  }
};

export type TranslationKeys = typeof en;