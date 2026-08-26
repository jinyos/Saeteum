'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';

export const POSTIT_CLASS =
  'absolute inset-0 flex items-center justify-center rounded-md border-2 border-ink-primary bg-white px-8 text-center shadow-md filter-[url(#hand-rough)]';

export function Mission() {
  const { data } = useTodayMission();

  const revealed = data.drawn;

  return (
    <div className="relative mx-auto aspect-square w-4/5 -rotate-2">
      <div className={POSTIT_CLASS}>
        {data.drawn && (
          <p className="absolute top-6 left-1/2 -translate-x-1/2 font-body text-base text-ink-tertiary">
            오늘의 미션
          </p>
        )}
        <p className="line-clamp-4 font-caption text-2xl text-ink-primary">
          {data.drawn ? data.mission.content : ''}
        </p>
      </div>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="postit"
            exit={{
              y: [0, -16, -140],
              x: [0, 4, 90],
              rotate: [0, -6, 30],
              opacity: [1, 0.9, 0.15],
            }}
            transition={{
              duration: 0.7,
              times: [0, 0.25, 1],
              ease: 'easeIn',
            }}
            className={POSTIT_CLASS}
          >
            <p className="font-caption text-2xl text-ink-secondary">
              아직 미션이 없어요.
              <br />
              미션을 뽑아보세요!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-point-red/20" />
    </div>
  );
}
