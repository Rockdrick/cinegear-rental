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