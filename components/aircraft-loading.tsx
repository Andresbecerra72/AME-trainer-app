"use client"

interface AircraftLoadingAnimationProps {
  title?: string
  description?: string
}

export function AircraftLoadingAnimation({ 
  title = "Preparing for takeoff",
  description = "Loading data..."
}: AircraftLoadingAnimationProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Aircraft Loading Animation */}
        <div className="relative w-full h-32 overflow-hidden">
          {/* Runway Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent">
            <div className="h-full w-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 animate-pulse" />
          </div>
          
          {/* Flying Aircraft */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full animate-fly">
            <svg
              viewBox="0 0 120 60"
              className="w-20 h-20 sm:w-24 sm:h-24 text-primary"
              fill="currentColor"
            >
              {/* Aircraft Body */}
              <path d="M60 20 L80 30 L70 35 L60 40 L50 35 L40 30 Z" opacity="0.9" />
              {/* Wings */}
              <path d="M40 30 L20 25 L25 32 L40 35 Z" opacity="0.7" />
              <path d="M80 30 L100 25 L95 32 L80 35 Z" opacity="0.7" />
              {/* Tail */}
              <path d="M50 35 L45 45 L55 45 Z" opacity="0.8" />
            </svg>
          </div>

          {/* Clouds */}
          <div className="absolute top-2 left-10 w-12 h-6 bg-muted/30 rounded-full blur-sm animate-float" />
          <div className="absolute top-6 right-20 w-16 h-7 bg-muted/30 rounded-full blur-sm animate-float-delayed" />
        </div>

        {/* Maintenance Gears */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg
              viewBox="0 0 100 100"
              className="w-12 h-12 sm:w-16 sm:h-16 text-primary/70 animate-spin-slow"
            >
              <path
                d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z"
                fill="currentColor"
              />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
          </div>
          <div className="relative">
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 sm:w-20 sm:h-20 text-primary animate-spin-reverse"
            >
              <path
                d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z"
                fill="currentColor"
              />
              <circle cx="50" cy="50" r="10" fill="currentColor" />
            </svg>
          </div>
          <div className="relative">
            <svg
              viewBox="0 0 100 100"
              className="w-12 h-12 sm:w-16 sm:h-16 text-primary/70 animate-spin-slow"
            >
              <path
                d="M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z"
                fill="currentColor"
              />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Loading Text with Aviation Phrases */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg sm:text-xl font-semibold text-foreground animate-pulse">
              {title}
            </span>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fly {
          0% {
            transform: translateX(-100%) translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateX(50%) translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateX(120%) translateY(0) rotate(5deg);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
        .animate-fly {
          animation: fly 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
