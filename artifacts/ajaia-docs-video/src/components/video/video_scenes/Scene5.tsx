import { motion } from 'framer-motion';
import { MediaFrame, SafeFrame, VideoText } from '@/lib/video';

const BASE = import.meta.env.BASE_URL;

export function Scene5() {
  return (
    <motion.section
      className="scene-layer"
      initial={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)', scale: .98 }}
      transition={{ duration: .95, ease: [0.16, 1, .3, 1] }}
      style={{ background: 'linear-gradient(140deg, #123c3e 0%, #17484a 62%, #205f5e 100%)', color: '#f8f4eb', zIndex: 1 }}
    >
      <SafeFrame>
        <motion.div style={{ position: 'absolute', left: '7vmin', top: '8vmin', zIndex: 5 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28, duration: .7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2vmin', marginBottom: '2.4vmin' }}>
            <span style={{ width: '3.1vmin', height: '3.1vmin', borderRadius: '.8vmin', background: '#ffab58', display: 'grid', placeItems: 'center', color: '#173d3e', fontWeight: 800, fontSize: '1.55vmin' }}>a</span>
            <span className="display" style={{ fontWeight: 800, fontSize: '2.1vmin', letterSpacing: '-.08em' }}>ajaia docs</span>
          </div>
          <VideoText as="h2" scale="heading" className="display" style={{ fontSize: 'clamp(2.5rem, 8.4vmin, 6rem)', fontWeight: 800, maxWidth: '76vmin' }}>
            Good work<br /><span style={{ color: '#ffab58' }}>has room to move.</span>
          </VideoText>
        </motion.div>

        <motion.div className="screen-shell screen-shadow" style={{ position: 'absolute', left: '9vmin', top: '43vmin', width: '61vmin', height: '43vmin', transform: 'rotate(-4.3deg)', zIndex: 2 }} initial={{ opacity: 0, x: -35, y: 28, rotate: -8, scale: .85 }} animate={{ opacity: 1, x: 0, y: 0, rotate: -4.3, scale: 1 }} transition={{ delay: .62, duration: 1.15, ease: [0.16, 1, .3, 1] }}>
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/ajaia-docs-workspace.jpg`} alt="Ajaia Docs workspace" />
          </MediaFrame>
        </motion.div>
        <motion.div className="screen-shell screen-shadow" style={{ position: 'absolute', left: '47vmin', top: '52vmin', width: '47vmin', height: '35vmin', transform: 'rotate(5deg)', zIndex: 3 }} initial={{ opacity: 0, x: 32, y: 34, rotate: 10, scale: .82 }} animate={{ opacity: 1, x: 0, y: 0, rotate: 5, scale: 1 }} transition={{ delay: .92, duration: 1.05, ease: [0.16, 1, .3, 1] }}>
          <MediaFrame fit="cover" position="top">
            <img src={`${BASE}screenshots/ajaia-docs-editor.jpg`} alt="Ajaia Docs document editor" />
          </MediaFrame>
        </motion.div>

        <motion.div style={{ position: 'absolute', right: '7vmin', top: '35vmin', zIndex: 5, textAlign: 'right' }} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: .6 }}>
          <p className="mono" style={{ fontSize: '1.05vmin', color: '#ffab58', letterSpacing: '.16em', margin: 0 }}>CREATE · SHAPE · SHARE</p>
          <div style={{ height: '1px', width: '16vmin', background: '#ffab58', margin: '1.6vmin 0 0 auto', opacity: .82 }} />
        </motion.div>
        <motion.p className="mono" style={{ position: 'absolute', left: '7vmin', bottom: '6vmin', fontSize: '1vmin', opacity: .62, margin: 0 }} initial={{ opacity: 0 }} animate={{ opacity: .62 }} transition={{ delay: 1.65 }}>FOCUSED WORK / SHARED WELL</motion.p>
      </SafeFrame>
    </motion.section>
  );
}