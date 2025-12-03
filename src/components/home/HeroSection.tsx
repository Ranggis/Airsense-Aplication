import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 hero-glow">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Machine Learning</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="block">Pantau & Prediksi</span>
            <span className="block mt-2 gradient-text">Kualitas Udara</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Sistem monitoring dan prediksi kualitas udara real-time menggunakan teknologi 
            <span className="text-foreground font-medium"> IoT</span> dan 
            <span className="text-foreground font-medium"> Decision Tree</span> untuk 
            peringatan dini polusi udara di Indonesia.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {['Real-time Monitoring', 'ML Prediction', 'Multi Data Source', 'Early Warning'].map((feature, index) => (
              <div
                key={feature}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
