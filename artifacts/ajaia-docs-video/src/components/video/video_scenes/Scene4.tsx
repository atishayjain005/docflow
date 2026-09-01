import { motion } from 'framer-motion';
import { MediaFrame, SafeFrame, VideoText } from '@/lib/video';

const BASE = import.meta.env.BASE_URL;

export function Scene4() {
  const people = [
    { name: 'MAYA', role: 'OWNER', color: '#ffab58', top: '38vmin' },
    { name: 'SAM', role: 'EDITOR', color: '#2a8b82', top: '53vmin' },
    { name: 'NOOR', role: 'READER', color: '#d9b98d', top: '68vmin' },
  ];
  return (
    <motion.section
      className="scene-layer"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: .9, ease: [0.4, 0, .2, 1] }}
      style={{ background: 'linear-gradient(120deg, #f4f0e8 0%, #f7f4ed 62%, #e9e3d7 100%)', color: '#173d3e', zIndex: 1 }}
    >
      <SafeFrame>
        <motion.div style={{ position: 'absolute', left: '7vmin', top: '9vmin', width: '38vmin', zIndex: 4 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25, duration: .7 }}>
          <VideoText as="p" scale="caption" className="eyebrow" style={{ color: '#2a8b82', marginBottom: '1.8vmin' }}>The circle</VideoText>
          <VideoText as="h2" scale="heading" className="display" style={{ fontSize: 'clamp(2.2rem, 7.2vmin, 5.2rem)', fontWeight: 800 }}>
            Work alone,<br /><span style={{ color: '#2a8b82' }}>then share well.</span>
          </VideoText>
          <p style={{ fontSize: '1.55vmin', lineHeight: 1.45, maxWidth: '32vmin', color: '#587071', marginTop: '3vmin' }}>Ownership stays clear. Access stays intentional.</p>
        </motion.div>

        <motion.div className="screen-shell screen-shadow" style={{ position: 'absolute', left: '47vmin', top: '16vmin', width: '51vmin', height: '67vmin', zIndex: 3, transform: 'rotate(2.2deg)' }} initial={{ opacity: 0, x: 35, rotate: 5, scale: .91 }} animate={{ opacity: 1, x: 0, rotate: 2.2, scale: 1 }} transition={{ delay: .48, duration: 1.05, ease: [0.16, 1, .3, 1] }}>
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/ajaia-docs-editor.jpg`} alt="Ajaia Docs editor with share context" />
          </MediaFrame>
        </motion.div>

        <motion.div style={{ position: 'absolute', left: '7vmin', top: '34vmin', width: '31vmin', zIndex: 4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8, duration: .45 }}>
          <div className="mono" style={{ fontSize: '1vmin', letterSpacing: '.14em', color: '#84908c', marginBottom: '1.5vmin' }}>ACCESS / BY DESIGN</div>
          {people.map((person, index) => (
            <motion.div key={person.name} style={{ position: 'absolute', top: `calc(${index} * 15vmin + 3vmin)`, left: 0, display: 'flex', alignItems: 'center', gap: '1.3vmin' }} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + index * .17, duration: .45 }}>
              <span style={{ width: '3.2vmin', height: '3.2vmin', borderRadius: '50%', border: `1px solid ${person.color}`, display: 'grid', placeItems: 'center', color: '#173d3e', fontSize: '.85vmin', fontWeight: 800 }}>{person.name[0]}</span>
              <span><strong className="display" style={{ display: 'block', fontSize: '1.35vmin', letterSpacing: '.02em' }}>{person.name}</strong><span className="mono" style={{ display: 'block', marginTop: '.35vmin', fontSize: '.85vmin', color: '#84908c' }}>{person.role}</span></span>
              <motion.span style={{ marginLeft: '1vmin', width: '7vmin', height: '1px', background: person.color, transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2 + index * .16, duration: .45 }} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="mono" style={{ position: 'absolute', right: '8vmin', bottom: '7vmin', fontSize: '1vmin', color: '#2a8b82', zIndex: 5 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.65 }}>PRIVATE → SHARED</motion.div>
      </SafeFrame>
    </motion.section>
  );
}