import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Eye,
  Edit
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface GearItem {
  id: string;
  name: string;
  category: string;
  status: "available" | "booked" | "maintenance" | "unavailable";
  location: string;
  nextBooking?: string;
  image?: string;
}

interface GearCardProps {
  item: GearItem;
}

const GearCard = ({ item }: GearCardProps) => {
  const { t } = useLanguage();
  
  const statusConfig = {
    available: {
      label: t.gear.status.available,
      className: "bg-available text-success-foreground",
    },
    booked: {
      label: t.gear.status.booked,
      className: "bg-booked text-primary-foreground",
    },
    maintenance: {
      label: t.gear.status.maintenance,
      className: "bg-maintenance text-warning-foreground",
    },
    unavailable: {
      label: t.gear.status.unavailable,
      className: "bg-unavailable text-destructive-foreground",
    },
  };
  
  const statusInfo = statusConfig[item.status];

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors break-words leading-tight">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground break-words">{item.category}</p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${statusInfo.className} flex-shrink-0`}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{item.location}</span>
          </div>
          
          {item.nextBooking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{t.gear.next}: {item.nextBooking}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 min-w-0">
            <Eye className="h-4 w-4 mr-1" />
            <span className="truncate">{t.gear.actions.view}</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 min-w-0">
            <Edit className="h-4 w-4 mr-1" />
            <span className="truncate">{t.gear.actions.edit}</span>
          </Button>
          {item.status === "available" && (
            <Button size="sm" className="flex-1 min-w-0">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="truncate">{t.gear.actions.book}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GearCard;