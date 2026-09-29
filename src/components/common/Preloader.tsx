import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../../assets/logo-baw.png';

const MIN_DURATION_MS = 1600; // brand moment, never longer than needed
const MAX_DURATION_MS = 3500; // safety net if the load event is slow

/**
 * Brand preloader: logo reveal + yellow progress line, then a clean
 * upward wipe into the hero. Shown once per browser session.
 */
export const Preloader = () => {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('baw-preloaded') !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minTime = reduceMotion ? 300 : MIN_DURATION_MS;
    const start = performance.now();
    let done = false;

    document.documentElement.style.overflow = 'hidden';

    const finish = () => {
      if (done) return;
      done = true;
      document.documentElement.style.overflow = '';
      try {
        sessionStorage.setItem('baw-preloaded', '1');
      } catch {
        /* storage unavailable, ignore */
      }
      setVisible(false);
    };

    const scheduleFinish = () => {
      const wait = Math.max(0, minTime - (performance.now() - start));
      window.setTimeout(finish, wait);
    };

    if (document.readyState === 'complete') {
      scheduleFinish();
    } else {
      window.addEventListener('load', scheduleFinish, { once: true });
    }
    const safety = window.setTimeout(finish, MAX_DURATION_MS);

    return () => {
      window.removeEventListener('load', scheduleFinish);
      window.clearTimeout(safety);
      document.documentElement.style.overflow = '';
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading Boss and Wagons"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050507]"
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* soft yellow spotlight behind the logo */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-baw-yellow/10 blur-[120px]" />

          <motion.img
            src={logo}
            alt="Boss and Wagons - Ceramic & PPF Experts"
            width={1800}
            height={250}
            className="relative w-[78vw] max-w-[520px] h-auto"
            initial={{ opacity: 0, y: 14, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="relative mt-8 h-[2px] w-[54vw] max-w-[260px] overflow-hidden bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-baw-yellow"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: MIN_DURATION_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
