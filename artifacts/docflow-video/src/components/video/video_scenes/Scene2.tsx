import { motion } from 'framer-motion';
import { MediaFrame, SafeFrame, VideoText } from '@/lib/video';

const BASE = import.meta.env.BASE_URL;

export function Scene2() {
  const labels = [
    { text: 'CREATE', left: '7vmin', top: '58vmin', rotate: -5 },
    { text: 'RENAME', left: '63vmin', top: '29vmin', rotate: 4 },
    { text: 'IMPORT', left: '72vmin', top: '74vmin', rotate: -3 },
  ];
  return (
    <motion.section
      className="scene-layer"
      initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      transition={{ duration: .85, ease: [0.4, 0, .2, 1] }}
      style={{ background: 'linear-gradient(155deg, #f7f4ed 10%, #f0eadf 100%)', color: '#173d3e', zIndex: 1 }}
    >
      <SafeFrame>
        <motion.div style={{ position: 'absolute', left: '7vmin', top: '8vmin', zIndex: 4 }} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22, duration: .55 }}>
          <VideoText as="p" scale="caption" className="eyebrow" style={{ color: '#2a8b82', marginBottom: '1.7vmin' }}>The starting point</VideoText>
          <VideoText as="h2" scale="heading" className="display" style={{ fontWeight: 800, fontSize: 'clamp(2.3rem, 7.8vmin, 5.5rem)', maxWidth: '64vmin' }}>
            One workspace.<br /><span style={{ color: '#2a8b82' }}>Many ways in.</span>
          </VideoText>
        </motion.div>

        <motion.div
          className="screen-shell screen-shadow"
          style={{ position: 'absolute', left: '7vmin', top: '41vmin', width: '86vmin', height: '60vmin', zIndex: 2 }}
          initial={{ y: 40, opacity: 0, scale: .95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: .5, duration: 1, ease: [0.16, 1, .3, 1] }}
        >
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/docflow-workspace.jpg`} alt="DocFlow workspace document library" />
          </MediaFrame>
          <motion.div style={{ position: 'absolute', inset: 0, border: '1.2vmin solid rgba(255,171,88,.82)', pointerEvents: 'none' }} initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0 0 0)' }} transition={{ delay: 1.15, duration: .8 }} />
        </motion.div>

        {labels.map((label, index) => (
          <motion.div
            key={label.text}
            className="mono"
            style={{ position: 'absolute', left: label.left, top: label.top, color: '#f7f4ed', background: '#17484a', padding: '1.25vmin 1.7vmin', fontSize: '1.05vmin', letterSpacing: '.16em', zIndex: 5, transform: `rotate(${label.rotate}deg)`, boxShadow: '0 1vmin 2vmin rgba(23,61,62,.15)' }}
            initial={{ opacity: 0, scale: .7, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .85 + index * .18, type: 'spring', stiffness: 330, damping: 24 }}
          >
            {label.text}
          </motion.div>
        ))}
        <motion.p className="mono" style={{ position: 'absolute', left: '7vmin', bottom: '5vmin', margin: 0, fontSize: '1vmin', opacity: .56 }} initial={{ opacity: 0 }} animate={{ opacity: .56 }} transition={{ delay: 1.4 }}>ROUGH LINES WELCOME</motion.p>
      </SafeFrame>
    </motion.section>
  );
}