import { useEffect, useState } from "react";

interface Confetti {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  color: string;
}

export const ConfettiEffect = () => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [clickConfetti, setClickConfetti] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Generate initial falling confetti
    const initialConfetti: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
      color: ["hsl(280 100% 60%)", "hsl(340 100% 60%)", "hsl(160 100% 50%)", "hsl(50 100% 60%)"][
        Math.floor(Math.random() * 4)
      ],
    }));
    setConfetti(initialConfetti);

    // Add new confetti periodically
    const interval = setInterval(() => {
      setConfetti((prev) => [
        ...prev.slice(-40),
        {
          id: Date.now(),
          left: Math.random() * 100,
          animationDuration: 3 + Math.random() * 4,
          delay: 0,
          color: ["hsl(280 100% 60%)", "hsl(340 100% 60%)", "hsl(160 100% 50%)", "hsl(50 100% 60%)"][
            Math.floor(Math.random() * 4)
          ],
        },
      ]);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add burst of confetti at click position
    const newConfetti = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));

    setClickConfetti((prev) => [...prev, ...newConfetti]);

    // Remove click confetti after animation
    setTimeout(() => {
      setClickConfetti((prev) => prev.slice(15));
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      onClick={handleClick}
      style={{ pointerEvents: "auto" }}
    >
      {/* Falling confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-3 opacity-80"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            backgroundColor: piece.color,
            animation: `fall ${piece.animationDuration}s linear ${piece.delay}s infinite`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      {/* Click burst confetti */}
      {clickConfetti.map((piece, index) => {
        const angle = (index / 15) * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const color = ["hsl(280 100% 60%)", "hsl(340 100% 60%)", "hsl(160 100% 50%)", "hsl(50 100% 60%)"][
          Math.floor(Math.random() * 4)
        ];

        return (
          <div
            key={piece.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${piece.x}px`,
              top: `${piece.y}px`,
              backgroundColor: color,
              animation: `burst 1s ease-out forwards`,
              "--burst-x": `${Math.cos(angle) * distance}px`,
              "--burst-y": `${Math.sin(angle) * distance}px`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }

        @keyframes burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--burst-x), var(--burst-y)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
