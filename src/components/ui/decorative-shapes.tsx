import { motion } from 'framer-motion';

export const PawPrint = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <ellipse cx="50" cy="65" rx="20" ry="25" />
    <circle cx="30" cy="35" r="12" />
    <circle cx="70" cy="35" r="12" />
    <circle cx="20" cy="55" r="10" />
    <circle cx="80" cy="55" r="10" />
  </svg>
);

export const FloatingPaws = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          delay: i * 0.5,
        }}
        style={{
          left: `${10 + i * 15}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
      >
        <PawPrint className="w-8 h-8 text-primary/20" />
      </motion.div>
    ))}
  </div>
);

export const BlobShape = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className}>
    <path
      fill="currentColor"
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.4,-0.9C86.8,14.4,81,28.8,72.4,40.9C63.8,53,52.4,62.8,39.5,69.6C26.6,76.4,13.3,80.2,-1.1,82C-15.5,83.8,-31,83.6,-44.4,77.7C-57.8,71.8,-69.1,60.2,-76.8,46.4C-84.5,32.6,-88.6,16.3,-87.9,0.4C-87.2,-15.5,-81.7,-31,-72.3,-43.5C-62.9,-56,-49.6,-65.5,-35.5,-72.7C-21.4,-79.9,-10.7,-84.8,2.4,-88.9C15.5,-93,30.6,-83.6,44.7,-76.4Z"
      transform="translate(100 100)"
    />
  </svg>
);

export const WavyDivider = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 1440 120" className={className} preserveAspectRatio="none">
    <path
      fill="currentColor"
      d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
    />
  </svg>
);
