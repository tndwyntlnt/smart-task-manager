import React, { useEffect, useRef, useState } from "react";

/**
 * BirthdayPage.tsx
 *
 * No external library required.
 * Replace the PLACEHOLDER paths in the `assets` object with your own images/videos.
 *
 * Recommended structure:
 * public/
 *   images/
 *     photo-1.jpg
 *     photo-2.jpg
 *     photo-3.jpg
 *     decoration.png
 *   videos/
 *     memory.mp4
 */

const assets = {
  photo1: "/images/photo-1.jpeg",
  photo2: "/images/photo-2.jpeg",
  photo3: "/images/photo-3.jpeg",
  memoryVideo: "/videos/memory.mp4",
};

const letterText = `Happy birthday to youuu. Aku harap hari
kamu dipenuhi kemudahan, cinta, dan semua
hal-hal kecil favorit kamu. Kamu berhak
dapetin semua kebahagiaan di dunia, today
and always. Semoga tahun ini berperilaku baik
sama kamu, dan semua mimpi kamu terwujud.
Sekali lagi, Selamat Ulang Tahun Sayanggg, Oiya besok web ini bakal berubah jadi aplikasi buat bantu kamu lebih produktif wkwkwkwk.`;

function PlaceholderImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`asset-placeholder ${className}`}>
        <span>PHOTO PLACEHOLDER</span>
        <small>{alt}</small>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default function BirthdayPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          )[0];

        if (visible) {
          const index = sectionsRef.current.indexOf(
            visible.target as HTMLElement
          );
          if (index >= 0) setActiveSection(index);
        }
      },
      { threshold: [0.45, 0.65, 0.85] }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const registerSection = (el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el;
  };

  return (
    <main className="birthday-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=Great+Vibes&display=swap');

        :root {
          --brown: #281f21;
          --cream: #f4eee7;
          --paper: #eee2cf;
          --denim: #17314b;
          --wine: #5e252e;
          --gold: #b18a54;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #111;
          color: #fff;
          font-family: "DM Sans", sans-serif;
        }

        button {
          font: inherit;
        }

        .birthday-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--brown);
        }

        .section {
          position: relative;
          min-height: 100svh;
          width: 100%;
          overflow: hidden;
          isolation: isolate;
        }

        /* Intro */
        .intro {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          background: #211c1e;
          transition: opacity .7s ease, visibility .7s ease;
        }

        .intro.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .intro-text {
          font-size: clamp(18px, 4vw, 30px);
          letter-spacing: .02em;
          animation: introPulse 1.7s ease both;
        }

        @keyframes introPulse {
          0% { opacity: 0; transform: translateY(8px); }
          25%, 75% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }

        /* Decorative stitched strips */
        .stitch {
          position: absolute;
          left: 0;
          right: 0;
          height: 22px;
          z-index: 3;
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0 12px,
              rgba(255,255,255,.88) 12px 18px,
              transparent 18px 30px
            );
          border-top: 3px solid rgba(255,255,255,.4);
          border-bottom: 3px solid rgba(255,255,255,.22);
          opacity: .75;
        }

        .stitch.top { top: 8px; }
        .stitch.bottom { bottom: 8px; }

        /* Floating scrapbook decorations */
        .deco {
          position: absolute;
          pointer-events: none;
          user-select: none;
          z-index: 2;
        }

        .flower {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background:
            radial-gradient(circle at center, #d8c9b2 0 13%, transparent 14%),
            radial-gradient(circle at 50% 8%, #f2eee7 0 19%, transparent 20%),
            radial-gradient(circle at 92% 50%, #f2eee7 0 19%, transparent 20%),
            radial-gradient(circle at 50% 92%, #f2eee7 0 19%, transparent 20%),
            radial-gradient(circle at 8% 50%, #f2eee7 0 19%, transparent 20%);
          filter: drop-shadow(0 7px 8px rgba(0,0,0,.2));
        }

        .heart {
          font-size: 48px;
          filter: drop-shadow(0 5px 5px rgba(0,0,0,.3));
        }

        .tape {
          width: 94px;
          height: 27px;
          background: rgba(222,204,164,.82);
          transform: rotate(-8deg);
          box-shadow: 0 3px 5px rgba(0,0,0,.15);
        }

        /* Hero */
        .hero {
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 50% 40%, #34282b 0, #211b1e 58%, #191517 100%);
          text-align: center;
        }

        .hero-content {
          position: relative;
          z-index: 4;
          padding: 30px;
          animation: riseIn 1.2s .8s both;
        }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(35px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .eyebrow {
          margin: 0 0 -15px;
          font-family: "Great Vibes", cursive;
          font-size: clamp(52px, 12vw, 110px);
          line-height: .9;
          color: #f7f0e9;
          transform: rotate(-3deg);
        }

        .hero-title {
          margin: 0;
          font-family: "Great Vibes", cursive;
          font-weight: 400;
          font-size: clamp(74px, 16vw, 155px);
          line-height: .9;
          color: #f7f0e9;
          text-shadow: 2px 3px 0 rgba(80, 38, 42, .35);
        }

        .hero-subtitle {
          margin: 30px auto 0;
          max-width: 600px;
          font-family: "Cormorant Garamond", serif;
          font-size: clamp(15px, 2.4vw, 22px);
          letter-spacing: .03em;
          color: #ded3ca;
        }

        /* Collage */
        .collage {
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,.05), transparent 22%),
            radial-gradient(circle at 80% 65%, rgba(255,255,255,.04), transparent 25%),
            #17314b;
        }

        .collage-inner {
          position: relative;
          width: min(900px, 90vw);
          height: min(620px, 82svh);
        }

        .photo-card {
          position: absolute;
          background: #f6f1e8;
          padding: 13px 13px 48px;
          box-shadow: 0 18px 30px rgba(0,0,0,.32);
        }

        .photo-card img,
        .asset-placeholder {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .asset-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,.75);
          background:
            linear-gradient(135deg, #49515a, #252b31);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          letter-spacing: .12em;
          text-align: center;
        }

        .asset-placeholder small {
          max-width: 90%;
          font-size: 10px;
          opacity: .7;
          letter-spacing: .04em;
        }

        .main-photo {
          width: min(430px, 58vw);
          height: min(500px, 68svh);
          left: 10%;
          top: 10%;
          transform: rotate(-7deg);
          z-index: 3;
          animation: floatPhoto 5s ease-in-out infinite;
        }

        .main-photo .asset-placeholder {
          height: 100%;
        }

        .heart-photo {
          width: min(270px, 38vw);
          height: min(270px, 38vw);
          right: 8%;
          top: 15%;
          z-index: 4;
          transform: rotate(5deg);
          clip-path: polygon(
            50% 100%, 9% 62%, 3% 38%, 10% 19%, 28% 8%,
            50% 25%, 72% 8%, 90% 19%, 97% 38%, 91% 62%
          );
          padding: 0;
          background: #f6f1e8;
          box-shadow: none;
        }

        .heart-photo img,
        .heart-photo .asset-placeholder {
          width: 100%;
          height: 100%;
          clip-path: inherit;
        }

        @keyframes floatPhoto {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -8px; }
        }

        .small-photo {
          width: min(190px, 27vw);
          height: min(145px, 22vw);
          right: 16%;
          bottom: 9%;
          padding: 8px 8px 28px;
          transform: rotate(7deg);
          z-index: 5;
        }

        .gift {
          position: absolute;
          z-index: 6;
          left: 4%;
          top: 8%;
          font-size: 45px;
          transform: rotate(-12deg);
        }

        /* Letter */
        .letter-section {
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(rgba(0,0,0,.13), rgba(0,0,0,.13)),
            #17314b;
        }

        .letter-paper {
          position: relative;
          width: min(610px, 78vw);
          min-height: min(500px, 72svh);
          padding: clamp(55px, 8vw, 82px) clamp(34px, 7vw, 74px);
          background:
            linear-gradient(180deg, rgba(255,255,255,.15), transparent 14%),
            var(--paper);
          color: #2c2521;
          box-shadow: 0 22px 35px rgba(0,0,0,.28);
          transform: rotate(-1deg);
        }

        .letter-paper::before,
        .letter-paper::after {
          content: "";
          position: absolute;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background:
            radial-gradient(circle at center, #cdbda3 0 12%, transparent 13%),
            radial-gradient(circle at 50% 10%, #f5eee3 0 20%, transparent 21%),
            radial-gradient(circle at 90% 50%, #f5eee3 0 20%, transparent 21%),
            radial-gradient(circle at 50% 90%, #f5eee3 0 20%, transparent 21%),
            radial-gradient(circle at 10% 50%, #f5eee3 0 20%, transparent 21%);
        }

        .letter-paper::before {
          right: -17px;
          bottom: -13px;
        }

        .letter-paper::after {
          left: -19px;
          top: -13px;
          transform: scale(.85);
        }

        .letter-title {
          margin: 0 0 22px;
          text-align: center;
          font-family: "Great Vibes", cursive;
          font-size: clamp(38px, 7vw, 60px);
          font-weight: 400;
        }

        .letter-text {
          margin: 0;
          white-space: pre-line;
          text-align: center;
          font-family: "Cormorant Garamond", serif;
          font-size: clamp(18px, 2.5vw, 25px);
          line-height: 1.35;
          font-weight: 600;
        }

        /* Video */
        .video-section {
          display: grid;
          place-items: center;
          background: #080808;
        }

        .video-frame {
          position: relative;
          width: min(720px, 86vw);
          aspect-ratio: 16 / 10;
          padding: 10px;
          background: #151515;
          box-shadow: 0 25px 70px rgba(0,0,0,.65);
        }

        .video-frame::before {
          content: "";
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(255,255,255,.13);
          pointer-events: none;
          z-index: 2;
        }

        .video-frame video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%) contrast(.92);
          background: #242424;
        }

        .video-placeholder {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          background:
            radial-gradient(circle, #3a3a3a, #121212 65%);
          color: #bbb;
          font-family: "Cormorant Garamond", serif;
          font-size: 22px;
        }

        .video-caption {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: -58px;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 16px;
          letter-spacing: .03em;
          color: #eee;
        }

        /* Navigation dots */
        .dots {
          position: fixed;
          z-index: 30;
          right: 22px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dot {
          width: 7px;
          height: 7px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.4);
          cursor: pointer;
          transition: .3s ease;
        }

        .dot.active {
          height: 25px;
          border-radius: 8px;
          background: #fff;
        }

        .scroll-hint {
          position: absolute;
          z-index: 8;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: .22em;
          text-transform: uppercase;
          opacity: .65;
          animation: hint 2s ease-in-out infinite;
        }

        .scroll-arrow {
          width: 12px;
          height: 12px;
          border-right: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          transform: rotate(45deg);
        }

        @keyframes hint {
          0%, 100% { transform: translate(-50%, 0); opacity: .45; }
          50% { transform: translate(-50%, 7px); opacity: .9; }
        }

        @media (max-width: 650px) {
          .dots {
            right: 12px;
          }

          .collage-inner {
            width: 100vw;
            height: 76svh;
          }

          .main-photo {
            left: 8%;
            width: 56vw;
            height: 54vw;
            max-height: 60svh;
          }

          .heart-photo {
            right: 5%;
            width: 35vw;
            height: 35vw;
          }

          .small-photo {
            right: 10%;
            width: 31vw;
            height: 24vw;
          }

          .gift {
            left: 5%;
            top: 4%;
          }

          .letter-paper {
            width: 82vw;
            min-height: auto;
            padding: 55px 30px;
          }

          .letter-text {
            font-size: 18px;
          }

          .video-frame {
            width: 88vw;
          }

          .video-caption {
            bottom: -45px;
            font-size: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className={`intro ${showIntro ? "" : "hidden"}`}>
        <div className="intro-text">haiii</div>
      </div>

      <nav className="dots" aria-label="Page sections">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            className={`dot ${activeSection === index ? "active" : ""}`}
            aria-label={`Go to section ${index + 1}`}
            onClick={() =>
              sectionsRef.current[index]?.scrollIntoView({
                behavior: "smooth",
              })
            }
          />
        ))}
      </nav>

      <section
        className="section hero"
        ref={(el) => registerSection(el, 0)}
      >
        <div className="stitch top" />
        <div className="stitch bottom" />

        <span
          className="deco flower"
          style={{ left: "13%", top: "28%", transform: "rotate(-15deg)" }}
        />
        <span
          className="deco flower"
          style={{ right: "15%", bottom: "25%", transform: "scale(.75)" }}
        />
        <span
          className="deco heart"
          style={{ right: "11%", top: "19%" }}
        >
          ♡
        </span>

        <div className="hero-content">
          <p className="eyebrow">Happy</p>
          <h1 className="hero-title">Birthday!</h1>
          <p className="hero-subtitle">
            Semoga di tahun ini banyak kebahagiaan dan momen indah yang nunggu kamu.
          </p>
        </div>

        <div className="scroll-hint">
          <span>scroll</span>
          <span className="scroll-arrow" />
        </div>
      </section>

      <section
        className="section collage"
        ref={(el) => registerSection(el, 1)}
      >
        <div className="stitch top" />
        <div className="stitch bottom" />

        <div className="collage-inner">
          <div className="gift">🎁</div>

          <div className="photo-card main-photo">
            <PlaceholderImage
              src={assets.photo1}
              alt="Main memory photo"
            />
          </div>

          <div className="photo-card heart-photo">
            <PlaceholderImage
              src={assets.photo2}
              alt="Heart-shaped memory photo"
            />
          </div>

          <div className="photo-card small-photo">
            <PlaceholderImage
              src={assets.photo3}
              alt="Small memory photo"
            />
          </div>

          <span
            className="deco heart"
            style={{ left: "45%", bottom: "12%" }}
          >
            ♡
          </span>
          <span
            className="deco flower"
            style={{ right: "3%", bottom: "7%", transform: "scale(.65)" }}
          />
        </div>

        <div className="scroll-hint">
          <span>scroll</span>
          <span className="scroll-arrow" />
        </div>
      </section>

      <section
        className="section letter-section"
        ref={(el) => registerSection(el, 2)}
      >
        <div className="stitch top" />
        <div className="stitch bottom" />

        <span
          className="deco tape"
          style={{ left: "12%", top: "18%" }}
        />

        <article className="letter-paper">
          <h2 className="letter-title">A little letter</h2>
          <p className="letter-text">{letterText}</p>
        </article>

        <div className="scroll-hint">
          <span>one more</span>
          <span className="scroll-arrow" />
        </div>
      </section>

      <section
        className="section video-section"
        ref={(el) => registerSection(el, 3)}
      >
        <div className="video-frame">
          <video
            src={assets.memoryVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              const video = e.currentTarget;
              video.style.display = "none";
              const placeholder =
                video.parentElement?.querySelector(".video-placeholder");

              if (placeholder instanceof HTMLElement) {
                placeholder.style.display = "grid";
              }
            }}
          />

          <div className="video-placeholder" style={{ display: "none" }}>
            VIDEO PLACEHOLDER
          </div>

          <div className="video-caption">i do, love you</div>
        </div>
      </section>
    </main>
  );
}
