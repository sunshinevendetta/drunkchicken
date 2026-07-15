"use client";

import Image from "next/image";
import { useState } from "react";
import StarBorder from "./components/react-bits/StarBorder";
import SwapWidget from "./components/SwapWidget";

const CONTRACT_ADDRESS = "0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";
const PONS_URL =
  "https://pons.family/launchpad/0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";

const chaosWords = [
  "🍺 100% CHICKEN",
  "🐔 0% COORDINATION",
  "💥 MAXIMUM CLUCK",
  "📺 PONS FAMILY APPROVED*",
  "🍗 BEST VIEWED AFTER MIDNIGHT",
];

export default function Home() {
  const [copied, setCopied] = useState(false);

  async function copyContract() {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main id="top" className="site-shell">
      <a className="skip-link" href="#contract">
        Skip to contract
      </a>

      <div className="panic-bar" aria-label="Important announcement">
        <div className="panic-track">
          {[...chaosWords, ...chaosWords].map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>

      <header className="chaos-nav">
        <a className="brand" href="#top" aria-label="DRUNKCHICKEN home">
          <span aria-hidden="true">🐔</span>
          <strong>$DRUNKCHICKEN</strong>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#contract">CA</a>
          <a href="#swap">SWAP</a>
          <a href="#lore">WHY?</a>
          <a href={PONS_URL} target="_blank" rel="noreferrer">
            PONS ↗
          </a>
        </nav>
        <span className="online-dot">● ONLINE??</span>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="float-emoji emoji-one" aria-hidden="true">
          🍺
        </div>
        <div className="float-emoji emoji-two" aria-hidden="true">
          💫
        </div>
        <div className="float-emoji emoji-three" aria-hidden="true">
          🍗
        </div>

        <p className="eyebrow">★ THE INTERNET&apos;S LEAST SOBER CHICKEN ★</p>
        <h1 id="hero-title" className="hero-title">DRUNKCHICKEN</h1>
        <p className="jp-banner" aria-label="Drunk chicken worldwide">
          酔っぱらいチキン ・ WORLD WIDE WEB ・ 酔っぱらいチキン
        </p>
        <div className="brainrot-ribbon" aria-label="Anime chicken shrine warning">
          <span aria-hidden="true">(˶˃ ᵕ ˂˶) .ᐟ.ᐟ</span>
          <strong>WELCOME 2 MY CHICKEN SHRINE</strong>
          <span aria-hidden="true">☆*:・ﾟ にわとり最高</span>
        </div>

        <div className="hero-stage">
          <aside className="hero-note note-left">
            <span className="tiny-label">BREAKING!!!</span>
            <strong>LAUNCHED ON ROBINHOOD</strong>
            <span className="arrow" aria-hidden="true">
              ➜➜➜
            </span>
          </aside>

          <div className="meme-stack">
            <span className="new-badge">NEW!</span>
            <div className="geocities-photo-frame">
              <Image
                className="official-meme"
                src="/drunkchicken.jpg"
                alt="The official DRUNKCHICKEN meme: a yellow chicken relaxing in an armchair with a beer"
                width={1440}
                height={1152}
                priority
              />
              <div className="infomercial-bug" aria-label="Drunkmaxxer, maxx profits">
                <small>★ BUT WAIT! ★</small>
                <strong>DRUNKMAXXER</strong>
                <span>MAXX PROFITS*</span>
              </div>
            </div>
            <p className="photo-caption">
              <span aria-hidden="true">📸</span> OFFICIAL MEME — DO NOT FEED AFTER 2AM
            </p>
          </div>

          <aside className="as-seen-badge" aria-label="As seen on Pons Family">
            <span>BUT WAIT! AS SEEN ON</span>
            <strong>PONS</strong>
            <em>FAMILY</em>
            <small>📺 CALL NOW!!!</small>
          </aside>
        </div>

        <p className="hero-copy">
          One chicken. Several beverages. Zero ability to walk in a straight line.
        </p>
      </section>

      <section id="contract" className="contract-zone" aria-labelledby="contract-title">
        <span className="tape tape-one">AUTHENTIC CA</span>
        <span className="tape tape-two">COPY THIS THING</span>
        <div className="contract-window">
          <div className="window-titlebar">
            <span id="contract-title">🍺 TOKEN_ADDRESS_FINAL_FINAL_REAL.txt</span>
            <span aria-hidden="true">_ □ ×</span>
          </div>
          <p className="contract-label">CONTRACT ADDRESS (CA)</p>
          <code>{CONTRACT_ADDRESS}</code>
          <div className="contract-actions">
            <button type="button" onClick={copyContract} aria-live="polite">
              {copied ? "✓ COPIED. CLUCK!" : "📋 COPY CA"}
            </button>
            <a href={PONS_URL} target="_blank" rel="noreferrer">
              GET IT ON PONS FAMILY ↗
            </a>
          </div>
          <p className="small-print">
            CHECK THE FULL ADDRESS. THE CHICKEN CANNOT TYPE AND WILL NOT FIX YOUR MISTAKES.
          </p>
        </div>
      </section>

      <SwapWidget />

      <section id="lore" className="lore-zone" aria-labelledby="lore-title">
        <div className="anime-banner">
          <span aria-hidden="true">✨</span>
          <div>
            <small>THE LEGEND OF</small>
            <h2 id="lore-title">THE WASTED ROOSTER</h2>
            <p>酔っても、まだ鳴く。 // EVEN DRUNK, IT STILL CLUCKS.</p>
          </div>
          <span aria-hidden="true">✨</span>
        </div>

        <div className="lore-grid">
          <article className="ugly-card card-yellow">
            <span className="card-icon" aria-hidden="true">🐣</span>
            <h3>THE PLAN</h3>
            <p>There is no plan. There is a chicken. Please try to keep up.</p>
          </article>
          <article className="ugly-card card-pink">
            <span className="card-icon" aria-hidden="true">🍻</span>
            <h3>THE VIBE</h3>
            <p>Late-night cable TV, warm beer, dial-up noises and one heroic bird.</p>
          </article>
          <article className="ugly-card card-cyan">
            <span className="card-icon" aria-hidden="true">📡</span>
            <h3>THE SIGNAL</h3>
            <p>Broadcasting live from the Pons Family launchpad to every cursed guestbook.</p>
          </article>
        </div>
      </section>

      <section className="final-cta" aria-label="Visit DRUNKCHICKEN on Pons Family">
        <p>YOU HAVE REACHED THE BOTTOM OF THE INTERNET.</p>
        <h2 className="cta-title">STILL THIRSTY?</h2>
        <StarBorder
          href={PONS_URL}
          target="_blank"
          rel="noreferrer"
          color="#ffff00"
          speed="4s"
          className="geocities-star-button"
        >
          🐔 ENTER PONS FAMILY 🐔
        </StarBorder>
      </section>

      <footer>
        <p>© 1994–FOREVER DRUNKCHICKEN WORLD WIDE WEB HEADQUARTERS</p>
        <p>MEME TOKEN. NOT FINANCIAL ADVICE. DON&apos;T DRINK AND TRADE.</p>
        <div className="visitor-counter" aria-label="Fake visitor counter">
          VISITOR # 000🍺420
        </div>
      </footer>
    </main>
  );
}
