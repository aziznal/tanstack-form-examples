import { useId } from 'react';
import range from 'lodash.range';
import random from 'lodash.random';
import { Button } from '../ui/button';
import type { ButtonProps } from '../ui/button';
import { cn } from '@/lib/utils';

import './submit-button-styles.css';

const ANIMATION_DURATION_MS = 300;
const PARTICLE_DURATION = 1200;

let particleTimeout: NodeJS.Timeout | null = null;
const particles = [] as Array<HTMLElement>;

export const SubmitButton: React.FC<ButtonProps> = ({
  className,
  onClick,
  ...props
}) => {
  const id = useId();

  const animate = () => {
    if (particleTimeout) clearTimeout(particleTimeout);

    const button = document.querySelector(
      `[data-animation-id=${id}]`,
    ) as HTMLElement;

    button.classList.add('animating');

    button.style.setProperty(
      '--animation-duration',
      `${ANIMATION_DURATION_MS}ms`,
    );

    range(5).forEach(() => {
      const particle = document.createElement('div');
      particles.push(particle);
      particle.classList.add('particle');
      particle.innerText = 'ok';
      // particle.innerText = sample(['wow', 'such form', 'much submit']);
      button.parentNode?.appendChild(particle);

      const angle = random(0, 360);
      const distance = random(64, 96);

      const [x, y] = convertToCartesian(angle, distance);
      const rotation = random(-30, 30);

      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      particle.style.setProperty('--rotation', `${rotation}deg`);
      particle.style.setProperty(
        '--animation-duration',
        `${PARTICLE_DURATION}ms`,
      );
    });

    setTimeout(() => {
      button.classList.remove('animating');
    }, ANIMATION_DURATION_MS);

    particleTimeout = setTimeout(() => {
      particles.forEach((particle) => particle.remove());
    }, PARTICLE_DURATION + 100);
  };

  return (
    <div className="relative w-fit h-fit">
      <Button
        {...props}
        data-animation-id={id}
        className={cn('fancy-button', className)}
        onClick={(e) => {
          animate();
          return onClick?.(e);
        }}
      />
    </div>
  );
};

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function convertToCartesian(
  angleDeg: number,
  distance: number,
): [number, number] {
  const rad = toRadians(angleDeg);
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;
  return [x, y];
}
