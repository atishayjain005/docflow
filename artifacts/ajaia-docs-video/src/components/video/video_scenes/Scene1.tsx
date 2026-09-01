import { motion } from 'framer-motion';
import { MediaFrame, SafeFrame, VideoText } from '@/lib/video';

const BASE = import.meta.env.BASE_URL;

export function Scene1() {
  return (
    <motion.section
      className="scene-layer"
      initial={{ clipPath: 'circle(0% at 86% 12%)' }}
      animate={{ clipPath: 'circle(150% at 86% 12%)' }}
      exit={{ clipPath: 'circle(0% at 86% 12%)', scale: 1.04 }}
      transition={{ duration: 1.05, ease: [0.16, 1, .3, 1] }}
      style={{ background: 'linear-gradient(135deg, #123c3e 0%, #17484a 58%, #236b68 100%)', color: '#f8f4eb', zIndex: 1 }}
    >
      <SafeFrame>
        <motion.div
          style={{ position: 'absolute', top: '7vmin', left: '7vmin', display: 'flex', alignItems: 'center', gap: '1.4vmin', zIndex: 4 }}
          initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .35, duration: .5 }}
        >
          <span style={{ width: '3.2vmin', height: '3.2vmin', borderRadius: '.8vmin', background: '#ffab58', display: 'grid', placeItems: 'center', color: '#173d3e', fontWeight: 800, fontSize: '1.6vmin' }}>a</span>
          <span className="display" style={{ fontWeight: 800, fontSize: '2.2vmin', letterSpacing: '-.08em' }}>ajaia.</span>
          <span className="mono" style={{ opacity: .62, fontSize: '1vmin', marginLeft: '1.8vmin' }}>PRODUCT STORY / 01</span>
        </motion.div>

        <motion.div
          style={{ position: 'absolute', left: '7vmin', top: '19vmin', width: '55vmin', zIndex: 3 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .8, ease: [0.16, 1, .3, 1] }}
        >
          <VideoText as="p" scale="caption" className="eyebrow" style={{ color: '#ffab58', marginBottom: '2.2vmin' }}>A focused document workspace</VideoText>
          <VideoText as="h1" scale="display" className="display" style={{ fontSize: 'clamp(3.6rem, 11.6vmin, 8rem)', maxWidth: '54vmin', fontWeight: 800 }}>
            Make room<br /><span style={{ color: '#ffab58' }}>for good work.</span>
          </VideoText>
          <motion.div className="rule" style={{ width: '19vmin', marginTop: '3.2vmin', color: '#ffab58' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.15, duration: .55 }} />
        </motion.div>

        <motion.div
          className="screen-shell screen-shadow"
          style={{ position: 'absolute', width: '78vmin', height: '54vmin', left: '25vmin', top: '47vmin', transform: 'rotate(-2.5deg)', zIndex: 2 }}
          initial={{ opacity: 0, y: 42, rotate: 1.5, scale: .92 }}
          animate={{ opacity: 1, y: 0, rotate: -2.5, scale: 1 }}
          transition={{ delay: .95, duration: 1.1, ease: [0.16, 1, .3, 1] }}
        >
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/ajaia-docs-workspace.jpg`} alt="Ajaia Docs workspace overview" />
          </MediaFrame>
        </motion.div>
        <motion.div
          className="mono"
          style={{ position: 'absolute', right: '7vmin', bottom: '5vmin', fontSize: '1vmin', opacity: .64, zIndex: 5 }}
          initial={{ opacity: 0 }} animate={{ opacity: .64 }} transition={{ delay: 1.5 }}
        >
          CREATE / EDIT / SHARE
        </motion.div>
      </SafeFrame>
    </motion.section>
  );
}