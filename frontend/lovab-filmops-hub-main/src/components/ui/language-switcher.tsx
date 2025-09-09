import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("es")}
          className={language === "es" ? "bg-accent" : ""}
        >
          🇪🇸 Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;