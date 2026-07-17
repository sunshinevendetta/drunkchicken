"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import StarBorder from "./components/react-bits/StarBorder";
import SwapWidget from "./components/SwapWidget";
import { pageCopy } from "./content";
import { isLocale, LOCALE_STORAGE_KEY, type Locale } from "./lib/i18n";

const CONTRACT_ADDRESS = "0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";
const PONS_URL =
  "https://pons.family/launchpad/0xc7cA3Cade27bbD9514389C0427870770E49bfe7F";
const LOCALE_CHANGE_EVENT = "drunkchicken-locale-change";

function getLocaleSnapshot(): Locale {
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(savedLocale) ? savedLocale : "en";
}

function getServerLocaleSnapshot(): Locale {
  return "en";
}

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );
  const t = pageCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.title = t.reducedTitle;
      return;
    }

    let messageIndex = 0;
    let characterIndex = 0;
    let timeoutId = 0;

    const typeDrunkText = () => {
      const message = t.tabMessages[messageIndex];
      characterIndex += 1;
      document.title = `${message.slice(0, characterIndex)}${characterIndex < message.length ? "▌" : ""}`;

      if (characterIndex < message.length) {
        timeoutId = window.setTimeout(typeDrunkText, 105 + (characterIndex % 4) * 38);
        return;
      }

      timeoutId = window.setTimeout(() => {
        messageIndex = (messageIndex + 1) % t.tabMessages.length;
        characterIndex = 0;
        typeDrunkText();
      }, 950);
    };

    typeDrunkText();
    return () => window.clearTimeout(timeoutId);
  }, [t.reducedTitle, t.tabMessages]);

  function toggleLocale() {
    const nextLocale: Locale = locale === "en" ? "zh-HK" : "en";
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }

  async function copyContract() {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main id="top" className="site-shell">
      <a className="skip-link" href="#contract">
        {t.skip}
      </a>

      <div className="panic-bar" aria-label={t.announcementAria}>
        <div className="panic-track">
          {[...t.chaosWords, ...t.chaosWords].map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>

      <header className="chaos-nav">
        <a className="brand" href="#top" aria-label={t.homeAria}>
          <span aria-hidden="true">🐔</span>
          <strong>$DRUNKCHICKEN</strong>
        </a>
        <nav aria-label={t.navAria}>
          <a href="#contract">CA</a>
          <a href="#swap">SWAP</a>
          <a href="#lore">{t.navWhy}</a>
          <a href="#manifesto">{t.navManifesto}</a>
          <a href={PONS_URL} target="_blank" rel="noreferrer">
            PONS ↗
          </a>
        </nav>
        <div className="nav-tools">
          <button
            type="button"
            className="language-switcher"
            onClick={toggleLocale}
            aria-label={t.switchAria}
          >
            <span>{locale === "en" ? "EN" : "繁中 HK"}</span>
            <b aria-hidden="true">⇄</b>
            <span>{t.switchLabel}</span>
          </button>
          <span className="online-dot">{t.online}</span>
        </div>
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

        <p className="eyebrow">{t.eyebrow}</p>
        <h1 id="hero-title" className="hero-title">DRUNKCHICKEN</h1>
        <p className="language-banner" aria-label={t.languageAria}>
          <span lang="ja">酔っぱらいチキン</span> ・ <span lang="zh-HK">醉雞</span> ・ {t.worldWide}
          {" ・ "}<span lang="zh-HK">醉雞</span> ・ <span lang="ja">酔っぱらいチキン</span>
        </p>
        <div className="brainrot-ribbon" aria-label={t.shrineAria}>
          <span aria-hidden="true">(˶˃ ᵕ ˂˶) .ᐟ.ᐟ</span>
          <strong>{t.shrine}</strong>
          <span aria-hidden="true">
            ☆*:・ﾟ <i lang="ja">にわとり最高</i> / <i lang="zh-HK">醉雞最強</i>
          </span>
        </div>

        <div className="hero-stage">
          <aside className="hero-note note-left">
            <span className="tiny-label">{t.breaking}</span>
            <strong>{t.launched}</strong>
            <span className="arrow" aria-hidden="true">
              ➜➜➜
            </span>
          </aside>

          <div className="meme-stack">
            <span className="new-badge">{t.newBadge}</span>
            <div className="geocities-photo-frame">
              <Image
                className="official-meme"
                src="/drunkchicken.jpg"
                alt={t.imageAlt}
                width={1440}
                height={1152}
                priority
              />
              <div className="infomercial-bug" aria-label={t.infomercialAria}>
                <small>{t.butWait}</small>
                <strong>DRUNKMAXXER</strong>
                <span>{t.maxxProfits}</span>
              </div>
            </div>
            <p className="photo-caption">
              <span aria-hidden="true">📸</span> {t.officialMeme}
            </p>
          </div>

          <aside className="as-seen-badge" aria-label={t.asSeenAria}>
            <span>{t.asSeen}</span>
            <strong>PONS</strong>
            <em>FAMILY</em>
            <small>{t.callNow}</small>
          </aside>
        </div>

        <p className="hero-copy">{t.heroCopy}</p>
      </section>

      <section id="contract" className="contract-zone" aria-labelledby="contract-title">
        <span className="tape tape-one">{t.tapeAuthentic}</span>
        <span className="tape tape-two">{t.tapeCopy}</span>
        <div className="contract-window">
          <div className="window-titlebar">
            <span id="contract-title">{t.contractTitle}</span>
            <span aria-hidden="true">_ □ ×</span>
          </div>
          <p className="contract-label">{t.contractLabel}</p>
          <code>{CONTRACT_ADDRESS}</code>
          <div className="contract-actions">
            <button type="button" onClick={copyContract} aria-live="polite">
              {copied ? t.copied : t.copyCa}
            </button>
            <a href={PONS_URL} target="_blank" rel="noreferrer">
              {t.getPons}
            </a>
          </div>
          <p className="small-print">{t.contractWarning}</p>
        </div>
      </section>

      <SwapWidget locale={locale} />

      <section id="lore" className="lore-zone" aria-labelledby="lore-title">
        <div className="anime-banner">
          <span aria-hidden="true">✨</span>
          <div>
            <small>{t.legendOf}</small>
            <h2 id="lore-title">{t.drunkestChicken}</h2>
            <p>
              <span lang="ja">酔っても、まだ鳴く。</span>{" // "}
              <span lang="zh-HK">就算飲醉，都仲識咯咯叫。</span>{" // "}{t.legendLine}
            </p>
          </div>
          <span aria-hidden="true">✨</span>
        </div>

        <div className="lore-grid">
          {t.cards.map(([title, copy], index) => (
            <article
              className={`ugly-card ${["card-yellow", "card-pink", "card-cyan"][index]}`}
              key={title}
            >
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="manifesto" className="manifesto-zone" aria-labelledby="manifesto-title">
        <span className="manifesto-sticker">{t.manifestoSticker}</span>
        <div className="manifesto-window">
          <div className="manifesto-titlebar">
            <span>{t.manifestoFile}</span>
            <span aria-hidden="true">_ □ ×</span>
          </div>
          <div className="manifesto-screen">
            <p className="manifesto-meta">
              <span>{t.manifestoTo}</span>
              <span>{t.manifestoDelivery}</span>
            </p>
            <h2 id="manifesto-title">{t.manifestoTitle}</h2>

            {t.manifestoMessages.map(([message, time], index) => (
              <div className={`drunk-message ${["msg-one", "msg-two", "msg-three", "msg-four", "msg-five"][index]}`} key={time + message}>
                {message}
                <small>{time}</small>
              </div>
            ))}
            <p className="manifesto-signoff">{t.manifestoSignoff}</p>
            <strong className="manifesto-stamp">{t.manifestoStamp}</strong>
          </div>
        </div>
        <p className="manifesto-footnote">{t.manifestoFootnote}</p>
      </section>

      <section className="final-cta" aria-label={t.finalAria}>
        <p>{t.bottomInternet}</p>
        <h2 className="cta-title">{t.thirsty}</h2>
        <StarBorder
          href={PONS_URL}
          target="_blank"
          rel="noreferrer"
          color="#ffff00"
          speed="4s"
          className="geocities-star-button"
        >
          {t.enterPons}
        </StarBorder>
      </section>

      <footer>
        <p>{t.footerHq}</p>
        <p className="footer-language">
          <span lang="ja">酔っぱらいチキン世界網本部</span>{" // "}
          <span lang="zh-HK">醉雞萬維網總部</span>
        </p>
        <p>{t.footerDisclaimer}</p>
        <div className="visitor-counter" aria-label={t.visitorAria}>
          {t.visitor}
        </div>
      </footer>
    </main>
  );
}
