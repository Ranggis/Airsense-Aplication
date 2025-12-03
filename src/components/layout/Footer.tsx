<<<<<<< HEAD
import { Coffee } from 'lucide-react';
=======
import { Heart } from 'lucide-react';
>>>>>>> 274f41d6458acd6e6b82d9ddcad6af7971a30fd8

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
<<<<<<< HEAD
            <span>© 2024 AirSense</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Dibuat dengan <Coffee className="h-3 w-3 text-destructive" /> oleh Ranggis
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Internet Of Things With Machine Learning</span>
=======
            <span>© 2024 AirSense.</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Dibuat dengan <Heart className="h-3 w-3 text-destructive" /> untuk Indonesia
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>IoT + Machine Learning</span>
>>>>>>> 274f41d6458acd6e6b82d9ddcad6af7971a30fd8
          </div>
        </div>
      </div>
    </footer>
  );
}
