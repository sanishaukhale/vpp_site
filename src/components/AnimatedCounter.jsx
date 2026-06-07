import React, { useState, useEffect, useRef } from "react";

/**
 * Animated counter that counts up to a target number when scrolled into view
 * @param {string} value - Value like "2,500+" or "150+"
 * @param {number} duration - Animation duration in ms
 */
const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  // Extract numeric part (including commas) and suffix
  // e.g. "2,500+" -> number: 2500, suffix: "+"
  const numericString = value.replace(/[^0-9]/g, "");
  const targetNumber = parseInt(numericString, 10) || 0;
  const suffix = value.replace(/[0-9,]/g, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Calculate progress percentage capped at 1
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function: easeOutCubic
      const easeProgress = 1 - Math.pow(1 - percentage, 3);
      
      // Calculate current value
      const currentValue = Math.round(easeProgress * targetNumber);
      setCount(currentValue);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(targetNumber);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, targetNumber, duration]);

  // Format count with localized commas
  const formattedCount = count.toLocaleString();

  return (
    <span ref={elementRef} className="counter-number">
      {formattedCount}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
