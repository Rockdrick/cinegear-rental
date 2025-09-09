import { TranslationKeys } from "./en";

export const es: TranslationKeys = {
  // Navigation
  nav: {
    title: "Film Ops Manager",
    subtitle: "Gestión de Equipo y Personal",
    dashboard: "Panel de Control",
    gear: "Inventario de Equipo",
    bookings: "Reservas",
    projects: "Proyectos",
    team: "Equipo",
    settings: "Configuración",
    searchPlaceholder: "Buscar equipo, proyectos...",
    profile: {
      name: "John Smith",
      role: "Gerente de Equipo"
    }
  },

  // Dashboard
  dashboard: {
    title: "Panel de Control",
    subtitle: "¡Bienvenido de vuelta! Esto es lo que está pasando con tu equipo y personal.",
    stats: {
      totalGear: "Total de Equipos",
      activeBookings: "Reservas Activas",
      teamMembers: "Miembros del Equipo", 
      itemsInService: "Equipos en Servicio",
      changes: {
        thisMonth: "este mes",
        dueToday: "vencen hoy",
        onAssignment: "en asignación",
        overdue: "atrasados"
      }
    },
    alerts: {
      title: "Alertas Recientes",
      viewAll: "Ver Todas las Alertas",
      items: {
        dueback: "Sony FX6 Camera Kit debe devolverse hoy",
        calibration: "Arri SkyPanel necesita calibración",
        request: "Nueva solicitud de equipo del Proyecto Alpha"
      }
    },
    quickActions: {
      title: "Acciones Rápidas",
      createBooking: "Crear Nueva Reserva",
      checkAvailability: "Verificar Disponibilidad de Equipo",
      generateReport: "Generar Reporte de Inventario"
    },
    buttons: {
      exportReport: "Exportar Reporte",
      addBooking: "Agregar Reserva", 
      viewAllGear: "Ver Todo el Equipo"
    },
    recentActivity: "Actividad Reciente del Equipo"
  },

  // Gear
  gear: {
    status: {
      available: "Disponible",
      booked: "Reservado",
      maintenance: "Mantenimiento", 
      unavailable: "No Disponible"
    },
    actions: {
      view: "Ver",
      edit: "Editar",
      book: "Reservar"
    },
    next: "Próximo",
    items: {
      sonyFx6: "Kit de Cámara Sony FX6",
      redKomodo: "RED Komodo 6K",
      arriSkyPanel: "Arri SkyPanel S60-C",
      canon2470: "Canon 24-70mm f/2.8L"
    },
    categories: {
      camera: "Cámara",
      lighting: "Iluminación",
      lens: "Lente"
    },
    locations: {
      studioAShelf2: "Estudio A - Estante 2",
      studioBCheckout: "Estudio B - Salida",
      repairBay: "Área de Reparación",
      studioALensCabinet: "Estudio A - Gabinete de Lentes"
    }
  },

  // Calendar/Bookings
  calendar: {
    title: "Calendario de Reservas",
    newBooking: "Nueva Reserva",
    upcomingBookings: "Próximas Reservas",
    status: {
      confirmed: "confirmado",
      pending: "pendiente"
    },
    bookings: {
      commercial: "Filmación Comercial - Kit Sony FX6",
      documentary: "Documental - Paquete Cámara RED",
      corporate: "Video Corporativo - Kit de Iluminación A", 
      musicVideo: "Video Musical - Set de Gimbal y Lentes"
    },
    months: {
      january: "Enero"
    },
    days: {
      sun: "Dom",
      mon: "Lun",
      tue: "Mar", 
      wed: "Mié",
      thu: "Jue",
      fri: "Vie",
      sat: "Sáb"
    }
  },

  // Projects
  projects: {
    title: "Proyectos",
    subtitle: "Gestiona tus proyectos de producción y clientes",
    createProject: "Crear Proyecto",
    editProject: "Editar Proyecto",
    deleteProject: "Eliminar Proyecto",
    noProjects: "Aún no hay proyectos",
    createFirst: "Crea tu primer proyecto para comenzar",
    noProjectsWithStatus: "No hay proyectos con el estado seleccionado",
    noProjectsWithStatuses: "No hay proyectos con los estados seleccionados",
    tryDifferentFilters: "Intenta seleccionar diferentes filtros de estado",
    viewAllProjects: "Ver Todos los Proyectos",
    projectsCalendar: "Calendario de Proyectos",
    status: {
      planning: "Planificación",
      planned: "Planificado",
      active: "Activo", 
      completed: "Completado",
      onHold: "En Pausa",
      cancelled: "Cancelado"
    }
  },

  // Team
  team: {
    title: "Miembros del Equipo",
    subtitle: "Gestiona los miembros de tu equipo y su información",
    createMember: "Agregar Miembro",
    editMember: "Editar Miembro",
    deleteMember: "Eliminar Miembro",
    noMembers: "Aún no hay miembros del equipo",
    createFirst: "Agrega tu primer miembro del equipo para comenzar",
    showingMembers: "Mostrando {start}-{end} de {total} miembros",
    permissions: {
      viewGear: "Ver Inventario de Equipo",
      editGear: "Editar Inventario de Equipo",
      viewBookings: "Ver Reservas",
      editBookings: "Editar Reservas",
      viewProjects: "Ver Proyectos",
      editProjects: "Editar Proyectos",
      viewTeam: "Ver Equipo",
      editTeam: "Editar Equipo"
    }
  },

  // Common
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar"
  }
};