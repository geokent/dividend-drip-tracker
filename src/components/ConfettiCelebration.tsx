import { useEffect, useState } from 'react';

interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration = ({ show, onComplete }: ConfettiCelebrationProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    delay: string;
    color: string;
    size: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (show) {
      const colors = [
        'hsl(142, 76%, 36%)', // green
        'hsl(217, 91%, 60%)', // blue
        'hsl(270, 76%, 60%)', // purple
        'hsl(45, 93%, 47%)',  // gold/yellow
        'hsl(340, 82%, 52%)', // pink
        'hsl(25, 95%, 53%)',  // orange
      ];
      
      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }));
      
      setParticles(newParticles);
      
      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: particle.id % 3 === 0 ? '50%' : particle.id % 3 === 1 ? '2px' : '0',
            transform: `rotate(${particle.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};
