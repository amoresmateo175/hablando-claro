
"use client";

import { useEffect, useState } from "react";

type Ad = {
  image: string;
  href: string;
  alt: string;
};

const ads = {
  desktopLeft: [
    {
      image: "/ads/desktop-left-1.jpg",
      href: "https://example.com",
      alt: "Anuncio izquierdo 1",
    },
    {
      image: "/ads/desktop-left-2.jpg",
      href: "https://example.com",
      alt: "Anuncio izquierdo 2",
    },
    {
      image: "/ads/desktop-left-3.jpg",
      href: "https://example.com",
      alt: "Anuncio izquierdo 3",
    },
  ],

  desktopRight: [
    {
      image: "/ads/desktop-right-1.jpg",
      href: "https://example.com",
      alt: "Anuncio derecho 1",
    },
    {
      image: "/ads/desktop-right-2.jpg",
      href: "https://example.com",
      alt: "Anuncio derecho 2",
    },
    {
      image: "/ads/desktop-right-3.jpg",
      href: "https://example.com",
      alt: "Anuncio derecho 3",
    },
  ],

  mobile: [
    {
      image: "/ads/mobile-1.jpg",
      href: "https://example.com",
      alt: "Anuncio móvil 1",
    },
    {
      image: "/ads/mobile-2.jpg",
      href: "https://example.com",
      alt: "Anuncio móvil 2",
    },
    {
      image: "/ads/mobile-3.jpg",
      href: "https://example.com",
      alt: "Anuncio móvil 3",
    },
    {
      image: "/ads/mobile-4.jpg",
      href: "https://example.com",
      alt: "Anuncio móvil 4",
    },
    {
      image: "/ads/mobile-5.jpg",
      href: "https://example.com",
      alt: "Anuncio móvil 5",
    },
  ],
};

function AdCarousel({
  items,
  intervalMs = 5000,
}: {
  items: Ad[];
  intervalMs?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % items.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  const ad = items[currentIndex];

  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ad.alt}
      className="block"
    >
      <img
        src={ad.image}
        alt={ad.alt}
        className="block h-auto w-full object-contain"
      />
    </a>
  );
}

export default function AdSlots() {
  return (
    <>
      {/* Left desktop advertisement */}
      <aside
        aria-label="Left advertisement"
        className="fixed left-[calc(50%-540px)] top-1/2 z-40 hidden w-[140px] -translate-x-full -translate-y-1/2 min-[768px]:block min-[768px]:left-[calc(50%-360px)] min-[1100px]:left-[calc(50%-440px)] min-[1280px]:left-[calc(50%-540px)] min-[1100px]:w-[160px]"
      >
        <AdCarousel items={ads.desktopLeft} />
      </aside>

      {/* Right desktop advertisement */}
      <aside
        aria-label="Right advertisement"
        className="fixed left-[calc(50%+360px)] top-1/2 z-40 hidden w-[140px] -translate-y-1/2 min-[768px]:block min-[1100px]:left-[calc(50%+440px)] min-[1280px]:left-[calc(50%+540px)] min-[1100px]:w-[160px]"
      >
        <AdCarousel items={ads.desktopRight} />
      </aside>

      {/* Mobile bottom advertisement */}
      <aside
        aria-label="Mobile advertisement"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-2 shadow-lg min-[768px]:hidden"
      >
        <div className="mx-auto w-full max-w-[720px]">
          <AdCarousel items={ads.mobile} />
        </div>
      </aside>
    </>
  );
}
