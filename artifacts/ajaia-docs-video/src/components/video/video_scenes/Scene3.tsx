import { motion } from 'framer-motion';
import { MediaFrame, SafeFrame, VideoText } from '@/lib/video';

const BASE = import.meta.env.BASE_URL;

export function Scene3() {
  return (
    <motion.section
      className="scene-layer"
      initial={{ clipPath: 'circle(0% at 12% 86%)' }}
      animate={{ clipPath: 'circle(150% at 12% 86%)' }}
      exit={{ clipPath: 'circle(0% at 12% 86%)', scale: 1.06 }}
      transition={{ duration: 1.05, ease: [0.16, 1, .3, 1] }}
      style={{ background: 'linear-gradient(130deg, #17484a, #123c3e 72%)', color: '#f8f4eb', zIndex: 1 }}
    >
      <SafeFrame>
        <motion.div style={{ position: 'absolute', left: '7vmin', top: '8vmin', zIndex: 4 }} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .65 }}>
          <VideoText as="p" scale="caption" className="eyebrow" style={{ color: '#ffab58', marginBottom: '1.5vmin' }}>The edit</VideoText>
          <VideoText as="h2" scale="heading" className="display" style={{ fontSize: 'clamp(2.5rem, 8.8vmin, 6rem)', fontWeight: 800 }}>
            Shape the<br /><span style={{ color: '#ffab58' }}>thought.</span>
          </VideoText>
        </motion.div>

        <motion.div
          style={{ position: 'absolute', right: '7vmin', top: '11vmin', display: 'flex', gap: '1.2vmin', alignItems: 'center', zIndex: 4 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7, duration: .4 }}
        >
          <span className="mono" style={{ fontSize: '1vmin', opacity: .68 }}>EDITING</span>
          <span style={{ width: '1vmin', height: '1vmin', borderRadius: '50%', background: '#ffab58' }} />
        </motion.div>

        <motion.div
          className="screen-shell screen-shadow"
          style={{ position: 'absolute', left: '15vmin', top: '34vmin', width: '82vmin', height: '61vmin', zIndex: 3, transform: 'rotate(1.4deg)' }}
          initial={{ opacity: 0, y: 38, rotate: -2, scale: .9 }} animate={{ opacity: 1, y: 0, rotate: 1.4, scale: 1 }}
          transition={{ delay: .55, duration: 1.15, ease: [0.16, 1, .3, 1] }}
        >
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/ajaia-docs-editor.jpg`} alt="Ajaia Docs rich text editor" />
          </MediaFrame>
          <motion.div style={{ position: 'absolute', left: '53%', top: '23%', width: '1px', height: '8vmin', background: '#ffab58', transformOrigin: 'top' }} initial={{ scaleY: 0 }} animate={{ scaleY: [0, 1, 1, 0] }} transition={{ delay: 1.25, duration: 1.6, times: [0, .35, .8, 1] }} />
        </motion.div>
        <motion.div className="mono" style={{ position: 'absolute', left: '7vmin', bottom: '7vmin', fontSize: '1vmin', opacity: .6, zIndex: 4 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: .6, y: 0 }} transition={{ delay: 1.35 }}>TEXT / FORM / FLOW</motion.div>
        <motion.div className="rule" style={{ position: 'absolute', left: '7vmin', bottom: '12vmin', width: '24vmin', color: '#ffab58', zIndex: 4 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: .9, duration: .7 }} />
      </SafeFrame>
    </motion.section>
  );
}