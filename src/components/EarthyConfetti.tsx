/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number; // percentage width (0-100)
  delay: number; // in seconds
  duration: number; // in seconds
  size: number; // size in pixels
  color: string;
  shape: 'leaf' | 'petal' | 'rounded';
  rotation: number;
  rotationSpeed: number;
  swayAmplitude: number;
}

const COLORS = [
  '#8FA88B', // moss green
  '#B8C7B4', // light sage
  '#D4A373', // ochre / gold
  '#E5C39E', // light wheat
  '#C08A58', // terracotta
  '#9A7B56', // wood / walnut
];

const SHAPES: ('leaf' | 'petal' | 'rounded')[] = ['leaf', 'petal', 'rounded'];

export default function EarthyConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 45 deterministic organic particles
    const list: Particle[] = Array.from({ length: 45 }).map((_, i) => {
      const x = Math.random() * 100;
      const delay = Math.random() * 2.0;
      const duration = 3.0 + Math.random() * 3.5;
      const size = 12 + Math.random() * 14;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const rotation = Math.random() * 360;
      const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 240);
      const swayAmplitude = 12 + Math.random() * 20;

      return {
        id: i,
        x,
        delay,
        duration,
        size,
        color,
        shape,
        rotation,
        rotationSpeed,
        swayAmplitude,
      };
    });
    setParticles(list);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden">
      {particles.map((p) => {
        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.x}vw`, 
              y: '-5vh', 
              rotate: p.rotation,
              opacity: 0 
            }}
            animate={{
              y: '105vh',
              rotate: p.rotation + p.rotationSpeed,
              opacity: [0, 0.9, 0.9, 0],
              x: [
                `${p.x}vw`, 
                `${p.x + p.swayAmplitude / 12}vw`, 
                `${p.x - p.swayAmplitude / 12}vw`, 
                `${p.x + p.swayAmplitude / 24}vw`
              ],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeInOut',
              repeat: 0,
            }}
            className="absolute"
            style={{ width: p.size, height: p.size }}
          >
            <svg
              viewBox="0 0 20 20"
              fill={p.color}
              className="w-full h-full drop-shadow-sm opacity-80"
            >
              {p.shape === 'leaf' && (
                <path d="M 0 10 C 5 0, 15 0, 20 10 C 15 20, 5 20, 0 10" />
              )}
              {p.shape === 'petal' && (
                <path d="M 10 0 C 18 2, 20 10, 10 20 C 0 10, 2 2, 10 0" />
              )}
              {p.shape === 'rounded' && (
                <path d="M 5 0 C 11 1, 15 6, 12 13 C 8 18, 1 12, 5 0" />
              )}
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}
