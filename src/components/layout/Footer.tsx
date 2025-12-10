
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          {/* Kiri */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2024 AirSense</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Dibuat dengan <Coffee className="h-3 w-3 text-destructive" /> oleh Ranggis
            </span>
          </div>

          {/* Kanan */}
          <div className="text-sm text-muted-foreground text-center sm:text-right">
            Internet Of Things With Machine Learning
          </div>

        </div>
      </div>
    </footer>
  );
}
