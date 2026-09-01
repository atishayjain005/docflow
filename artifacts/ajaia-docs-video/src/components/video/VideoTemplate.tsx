import {
  VideoCanvas,
  type VideoAspectRatio,
  VideoPausedContext,
  useVideoPlayer,
} from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  scene1: 3600,
  scene2: 4100,
  scene3: 4400,
  scene4: 3900,
  scene5: 4300,
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '1:1';

const SCENE_COMPONENTS = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const starts: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, duration] of Object.entries(SCENE_DURATIONS)) {
    starts[key] = cumulativeMs / 1000;
    cumulativeMs += duration;
  }
  return starts;
})();

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({
    durations,
    loop,
    paused,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent =
    SCENE_COMPONENTS[baseSceneKey as keyof typeof SCENE_COMPONENTS];

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.45;
    if (paused) {
      audio.pause();
      return;
    }

    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
      if (Math.abs(audio.currentTime - targetTime) > 0.18) {
        audio.currentTime = targetTime;
      }
    }

    audio.play().catch(() => {});
  }, [baseSceneKey, currentSceneKey, muted, paused]);

  return (
    <VideoPausedContext.Provider value={paused}>
      <VideoCanvas aspectRatio={VIDEO_ASPECT_RATIO} className="video-root">
        <PersistentAtmosphere scene={sceneIndex >= 0 ? sceneIndex : currentScene} />
        <AnimatePresence mode="sync" initial={false}>
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
          preload="auto"
          autoPlay
          muted={muted}
        />
      </VideoCanvas>
    </VideoPausedContext.Provider>
  );
}

function PersistentAtmosphere({ scene }: { scene: number }) {
  const positions = [
    { x: '84%', y: '15%', scale: 1.1, color: '#ffab58' },
    { x: '14%', y: '78%', scale: .8, color: '#2a8b82' },
    { x: '85%', y: '80%', scale: 1.45, color: '#ffab58' },
    { x: '18%', y: '19%', scale: .95, color: '#2a8b82' },
    { x: '50%', y: '46%', scale: .6, color: '#ffab58' },
  ];
  const orb = positions[scene] ?? positions[0];
  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute', width: '25vmin', height: '25vmin', borderRadius: '50%',
          filter: 'blur(34px)', opacity: .24, zIndex: 0,
        }}
        animate={{ left: orb.x, top: orb.y, scale: orb.scale, backgroundColor: orb.color }}
        transition={{ duration: 2.4, ease: [0.16, 1, .3, 1] }}
      />
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: '10%', zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(23,61,62,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(23,61,62,.045) 1px, transparent 1px)',
          backgroundSize: '7vmin 7vmin', maskImage: 'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
        }}
        animate={{ x: scene % 2 ? -18 : 12, y: scene * 7, opacity: scene === 4 ? .45 : .8 }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute', zIndex: 2, left: '7vmin', top: '5vmin',
          width: '2.2vmin', height: '2.2vmin', borderRadius: '50%', background: '#ffab58',
        }}
        animate={{ rotate: 360, scale: [1, 1.16, 1] }}
        transition={{ rotate: { duration: 16, repeat: Infinity, ease: 'linear' }, scale: { duration: 2.8, repeat: Infinity } }}
      />
    </>
  );
}
