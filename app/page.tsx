"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import StarBorder from "./components/react-bits/StarBorder";
import SwapWidget from "./components/SwapWidget";

const CONTRACT_ADDRESS = "0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";
const PONS_URL =
  "https://pons.family/launchpad/0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";

const chaosWords = [
  "🍺 100% CHICKEN",
  "🐔 0% COORDINASHUN",
  "💥 MAXIMUM CLUCK",
  "📺 PONS FAMLY APPROVD*",
  "🍗 BEST VIEEWED AFTER MIDNITE",
];

const drunkTabMessages = [
  "$DRUNKCHICKEN is typign...",
  "helo holder u awake??? 🐔",
  "wen rich i spild the chart",
  "dont sell im still txting",
  "chikcen.exe had one beer",
  "wait wher is my portfoilo",
  "ok luv u holderss 🍗💸",
];

export default function Home() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.title = "$DRUNKCHICKEN 🍺 helo holderss";
      return;
    }

    let messageIndex = 0;
    let characterIndex = 0;
    let timeoutId = 0;

    const typeDrunkText = () => {
      const message = drunkTabMessages[messageIndex];
      characterIndex += 1;
      document.title = `${message.slice(0, characterIndex)}${characterIndex < message.length ? "▌" : ""}`;

      if (characterIndex < message.length) {
        timeoutId = window.setTimeout(typeDrunkText, 105 + (characterIndex % 4) * 38);
        return;
      }

      timeoutId = window.setTimeout(() => {
        messageIndex = (messageIndex + 1) % drunkTabMessages.length;
        characterIndex = 0;
        typeDrunkText();
      }, 950);
    };

    typeDrunkText();
    return () => window.clearTimeout(timeoutId);
  }, []);

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
          <a href="#manifesto">MANIFSTO</a>
          <a href={PONS_URL} target="_blank" rel="noreferrer">
            PONS ↗
          </a>
        </nav>
        <span className="online-dot">● ONLNE??</span>
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
        <p className="language-banner" aria-label="Drunk chicken worldwide in Japanese and Chinese">
          <span lang="ja">酔っぱらいチキン</span> ・ <span lang="zh-CN">醉鸡</span> ・ WORLD
          WIDE WEB ・ <span lang="zh-CN">醉鸡</span> ・ <span lang="ja">酔っぱらいチキン</span>
        </p>
        <div className="brainrot-ribbon" aria-label="Anime chicken shrine warning">
          <span aria-hidden="true">(˶˃ ᵕ ˂˶) .ᐟ.ᐟ</span>
          <strong>WELCOME 2 MY CHIKEN SHRINE</strong>
          <span aria-hidden="true">
            ☆*:・ﾟ <i lang="ja">にわとり最高</i> / <i lang="zh-CN">醉鸡最强</i>
          </span>
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
              <span aria-hidden="true">📸</span> OFICIAL MEME — DO NOT FEED AFTER 2AM
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
          One chicken. Several bevreges. Zero abiltiy to walk in a straight line.
        </p>
      </section>

      <section id="contract" className="contract-zone" aria-labelledby="contract-title">
        <span className="tape tape-one">AUTHENTIC CA</span>
        <span className="tape tape-two">COPY THIS THING</span>
        <div className="contract-window">
          <div className="window-titlebar">
            <span id="contract-title">🍺 TOKEN_ADDRESS_FINAL_FINAL_IMDOINGITRIGHT_DRUNK_BLABLABLA.txt</span>
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
            <h2 id="lore-title">THE DRUNKEST CHICKEN</h2>
            <p>
              <span lang="ja">酔っても、まだ鳴く。</span>{" // "}
              <span lang="zh-CN">就算喝醉了，也还会咯咯叫。</span>{" // "}EVEN DRUNK, IT STILL CLUCKS.
            </p>
          </div>
          <span aria-hidden="true">✨</span>
        </div>

        <div className="lore-grid">
          <article className="ugly-card card-yellow">
            <span className="card-icon" aria-hidden="true">🐣</span>
            <h3>THE BEST BAD DECISION</h3>
            <p>Buying one drunk chicken and getting rich. 🍗💸</p>
          </article>
          <article className="ugly-card card-pink">
            <span className="card-icon" aria-hidden="true">🍻</span>
            <h3>THE VIBE_final</h3>
            <p>Late-night cable TV, warm beer, dial-up noises and one heroic bird.</p>
          </article>
          <article className="ugly-card card-cyan">
            <span className="card-icon" aria-hidden="true">📡</span>
            <h3>THE SIGNAL_v2</h3>
            <p>Broadcasting live from the Pons Family launchpad to every cursed guestbook.</p>
          </article>
        </div>
      </section>

      <section id="manifesto" className="manifesto-zone" aria-labelledby="manifesto-title">
        <span className="manifesto-sticker">4:07 AM // 12% BATTRY</span>
        <div className="manifesto-window">
          <div className="manifesto-titlebar">
            <span>🍺 drunkchikcen_unsent_FINAL_final_2.txt</span>
            <span aria-hidden="true">_ □ ×</span>
          </div>
          <div className="manifesto-screen">
            <p className="manifesto-meta">
              <span>TO: teh holderss 💚</span>
              <span>delivred probably ✓✓</span>
            </p>
            <h2 id="manifesto-title">THE DRUNKCHICKEN MANIFSTO</h2>

            <div className="drunk-message msg-one">
              helo holders its me. the drunk chiken. i foudn the phone behind couch and i have
              somthing importnat to say
              <small>4:07 AM</small>
            </div>
            <div className="drunk-message msg-two">
              we are gona get rich becase i did the math on a napkin and the napkin said YES. i
              lost teh napkin but trust the proces probably
              <small>4:08 AM</small>
            </div>
            <div className="drunk-message msg-three">
              RULE 1: hold the chicken. RULE 2: hold my drink. RULE 3: wait wich one was the token
              <small>4:08 AM</small>
            </div>
            <div className="drunk-message msg-four">
              if chart go up: genius. if chart go down: chicken is just bending knees for a HUGE
              jump. this is sicence
              <small>4:09 AM</small>
            </div>
            <div className="drunk-message msg-five">
              we dont leave holders at the bar. we cluck together. we drunkmaxx together. we wake
              up and check wallet with one eye together
              <small>4:11 AM</small>
            </div>
            <p className="manifesto-signoff">
              ok goodnite see u at the top or in the group chat asking what happend. luv, chicken
              xoxo
            </p>
            <strong className="manifesto-stamp">GET RIHCH OR GET ANOTHR ROUND</strong>
          </div>
        </div>
        <p className="manifesto-footnote">
          *napkin math is not financal advice. the napkin has not been located.
        </p>
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
        <p className="footer-language">
          <span lang="ja">酔っぱらいチキン世界網本部</span>{" // "}
          <span lang="zh-CN">醉鸡万维网总部</span>
        </p>
        <p>MEME TOKEN. NOT FINANCIAL ADVICE. DON&apos;T DRINK AND TRADE.</p>
        <div className="visitor-counter" aria-label="Fake visitor counter">
          VISITOR # 000🍺420
        </div>
      </footer>
    </main>
  );
}
