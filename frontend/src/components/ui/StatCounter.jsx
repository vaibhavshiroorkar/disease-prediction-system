import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Animated counter that counts up from 0 to a target value when scrolled into view.
 * Supports numbers like "41+", "130+", "95%+", "<1s".
 */
export default function StatCounter({ value, duration = 1.5 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    // Parse the numeric part
    const numStr = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    const prefix = value.startsWith('<') ? '<' : '';
    const suffix = value.replace(/^[<]?[\d.]+/, '');

    if (isNaN(num)) {
      setDisplay(value);
      return;
    }

    const startTime = Date.now();
    const durationMs = duration * 1000;
    const isFloat = numStr.includes('.');

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;

      if (isFloat) {
        setDisplay(`${prefix}${current.toFixed(1)}${suffix}`);
      } else {
        setDisplay(`${prefix}${Math.round(current)}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {display}
    </motion.span>
  );
}
