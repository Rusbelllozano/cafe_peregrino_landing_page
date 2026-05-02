"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapFadeUp(
  selector: string,
  options?: {
    stagger?: number;
    duration?: number;
    delay?: number;
    y?: number;
    start?: string;
  }
) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(selector);
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: options?.y ?? 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.8,
          delay: options?.delay ?? 0,
          stagger: options?.stagger ?? 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: options?.start ?? "top 80%",
            once: true,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [selector, options?.stagger, options?.duration, options?.delay, options?.y, options?.start]);

  return containerRef;
}

export function useGsapParallax(speed: number = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.to(element, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, element);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useGsapReveal(
  options?: {
    duration?: number;
    scale?: number;
    start?: string;
  }
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          scale: options?.scale ?? 0.95,
        },
        {
          opacity: 1,
          scale: 1,
          duration: options?.duration ?? 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: options?.start ?? "top 75%",
            once: true,
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [options?.duration, options?.scale, options?.start]);

  return ref;
}
