"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, any>) => void;
    };
  }
}

export default function FormPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  useEffect(() => {
    const startTime = performance.now();

    const intervalId1 = setInterval(() => {
      // Track form start if umami is available
      window.umami?.track?.('form-start', {
        formSlug: slug,
      });
    }, 5000); // every 5 seconds

    const intervalId = setInterval(() => {
      // Track completion time periodically if umami is available
      window.umami?.track?.('completion-time', {
        formSlug: slug,
        time: Math.round(performance.now() - startTime),
      });
    }, 10000); // every 10 seconds

    return () => {
      clearInterval(intervalId1);
      clearInterval(intervalId);
    };
  }, [slug]);

  return (
    <div>
      <h1>Form Page - {slug}</h1>

    </div>
  );
}