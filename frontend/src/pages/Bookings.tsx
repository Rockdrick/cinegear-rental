import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Bookings = () => {
  const { t } = useLanguage();

  // Mock booking data - will be replaced with real data later
  const bookings = [
    {
      id: 1,
      projectName: "Documentary Production",
      clientName: "ABC Studios",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "confirmed",
      items: ["Sony FX6", "MacBook Pro", "OWC Storage"],
      totalValue: 2500
    },
    {
      id: 2,
      projectName: "Commercial Shoot",
      clientName: "XYZ Agency",
      startDate: "2024-01-18",
      endDate: "2024-01-22",
      status: "pending",
      items: ["RED Camera", "Teradek Bond", "Sony Monitor"],
      totalValue: 3200
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
              <p className="text-muted-foreground mt-1">
                Manage equipment bookings and rentals
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>

          {/* Bookings List */}
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-semibold break-words leading-tight">
                        {booking.projectName}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1 break-words">
                        Client: {booking.clientName}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} flex-shrink-0`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.startDate} - {booking.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Items</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Value</p>
                        <p className="text-sm text-muted-foreground">
                          ${booking.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Equipment:</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.items.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs break-words">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first booking to get started
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookings;
