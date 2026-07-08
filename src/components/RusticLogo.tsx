import React from 'react';
import { motion } from 'motion/react';

interface RusticLogoProps {
  className?: string;
  showSignature?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RusticLogo: React.FC<RusticLogoProps> = ({
  className = '',
  showSignature = true,
  size = 'md',
}) => {
  const getLogoSize = () => {
    switch (size) {
      case 'sm':
        return { box: 'w-10 h-10', text: 'text-base', sub: 'text-[9px]' };
      case 'lg':
        return { box: 'w-20 h-20', text: 'text-2xl', sub: 'text-xs' };
      case 'md':
      default:
        return { box: 'w-12 h-12', text: 'text-lg', sub: 'text-[10px]' };
    }
  };

  const dims = getLogoSize();

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Interactive Vector Logo */}
      <motion.div
        className="flex items-center gap-3 select-none"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {/* The Graphic Logo Box */}
        <div className={`relative ${dims.box} flex-shrink-0`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Wooden/Clay Wordle Tile Background */}
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="24"
              className="fill-linen-card stroke-clay-border/60"
              strokeWidth="5"
            />
            {/* Subtle Wooden Texture Grain Details */}
            <path
              d="M15 25C25 22 45 28 55 24C65 20 80 25 85 27"
              className="stroke-clay-border/20"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 75C30 72 40 78 60 74C80 70 82 76 88 75"
              className="stroke-clay-border/20"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Wordle-grid dotted guide behind */}
            <circle cx="28" cy="28" r="3" className="fill-clay-border/40" />
            <circle cx="72" cy="28" r="3" className="fill-clay-border/40" />
            <circle cx="28" cy="72" r="3" className="fill-clay-border/40" />
            <circle cx="72" cy="72" r="3" className="fill-clay-border/40" />

            {/* The Stylized Letter "S" interlinked with Leaves & Vines */}
            {/* Bottom-left to top-right leafy vine curve */}
            <path
              d="M25 72C22 55 35 48 50 50C65 52 78 45 75 28"
              className="stroke-moss-correct"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Completing the S curve with golden-ochre Wordle tiles concept */}
            <path
              d="M75 72C78 55 65 48 50 50C35 52 22 45 25 28"
              className="stroke-ochre-present"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="4 8"
            />
            
            {/* Elegant Solid "S" Spine Overlay */}
            <path
              d="M72 32C72 32 60 22 48 22C34 22 26 31 26 41C26 55 42 54 52 58C66 62 74 67 74 79C74 91 60 96 46 96C32 96 24 88 24 88"
              className="stroke-walnut-text"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Nature Wordle Motif: Sprouting Green Leaf on the "S" */}
            <path
              d="M74 24C82 24 86 16 86 16C86 16 76 18 70 26C68 28 70 30 74 24Z"
              className="fill-moss-correct"
            />
            <path
              d="M26 76C18 76 14 84 14 84C14 84 24 82 30 74C32 72 30 70 26 76Z"
              className="fill-moss-correct"
            />
          </svg>
        </div>

        {/* Text Brand Header */}
        <div className="flex flex-col text-left">
          <span className={`font-serif font-black tracking-tight text-walnut-text leading-none ${dims.text}`}>
            Rustic<span className="text-moss-correct font-sans font-bold">Wordle</span>
          </span>
          <span className={`font-mono font-bold tracking-widest text-walnut-muted/80 uppercase leading-none mt-1 ${dims.sub}`}>
            Soumya's Edition
          </span>
        </div>
      </motion.div>

      {/* Signature Credit below the logo */}
      {showSignature && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-2.5 flex flex-col items-center gap-1"
        >
          {/* Decorative divider line */}
          <div className="w-16 h-[1.5px] bg-gradient-to-r from-transparent via-clay-border to-transparent" />
          
          <span className="text-[10px] sm:text-xs font-serif italic text-walnut-muted tracking-wide flex items-center gap-1.5">
            <span>made with care by</span>
            <span className="font-sans font-bold not-italic tracking-wider text-moss-correct uppercase hover:text-ochre-present transition-colors duration-300">
              Soumya Ranjan Bhujabal
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
};
