// Build the public card + spread library pages from data/.
// Reads the marketing site's index.html for shared <nav> + <footer>,
// emits cards/index.html, cards/<slug>.html, spreads/index.html,
// spreads/<slug>.html, and a top-level sitemap.xml.
//
// Run from the repo root:  npm run build:library

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MAJOR, MINOR_WANDS, MINOR_CUPS, MINOR_SWORDS, MINOR_PENTS, ALL_CARDS }
  from '../data/cards.mjs';
import { SPREADS } from '../data/spreads.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://liminalveil.app';
const APP  = 'https://app.liminalveil.app';
const OG_IMAGE = `${SITE}/og-default.jpg`;

// ── Helpers ──────────────────────────────────────────────────────────
const slugify = (s) => s
  .toLowerCase()
  .replace(/'/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeAttr = escapeHtml;

const between = (src, openRe, closeTag) => {
  const m = src.match(openRe);
  if (!m) throw new Error(`Could not find ${openRe} in index.html`);
  const start = m.index;
  const close = src.indexOf(closeTag, start);
  if (close === -1) throw new Error(`Could not find closing ${closeTag}`);
  return src.slice(start, close + closeTag.length);
};

// Rewrite homepage-anchor links (#features) → root-anchored (/#features)
// so they work from library subpages.
const rewriteAnchors = (html) => html.replace(/href="#([a-z0-9-]+)"/gi, 'href="/#$1"');

// ── Decorate cards with slugs once ──────────────────────────────────
const SUITS = [
  { key: 'major',     label: '✦  Major Arcana', sym: '✦', cards: MAJOR },
  { key: 'wands',     label: '✶  Wands',        sym: '✶', cards: MINOR_WANDS },
  { key: 'cups',      label: '○  Cups',         sym: '○', cards: MINOR_CUPS },
  { key: 'swords',    label: '◆  Swords',       sym: '◆', cards: MINOR_SWORDS },
  { key: 'pentacles', label: '⬡  Pentacles',    sym: '⬡', cards: MINOR_PENTS },
];

for (const c of ALL_CARDS) c.slug = slugify(c.name);
for (const s of SPREADS)   s.slug = s.id;

// ── Spread category grouping (mirrors the in-app accordion) ─────────
const SPREAD_SECTIONS = [
  { key: 'daily',     label: 'Daily',           icon: '◉', ids: ['daily', 'weekly'] },
  { key: 'general',   label: 'General',         icon: '✦', ids: ['ppp', 'celtic', 'horseshoe', 'astro', 'yearahead'] },
  { key: 'love',      label: 'Love',            icon: '♡', ids: ['lovetrio', 'relationship'] },
  { key: 'decision',  label: 'Decision-Making', icon: '◇', ids: ['sao', 'yesno', 'decision'] },
  { key: 'career',    label: 'Career',          icon: '✦', ids: ['career'] },
  { key: 'innerwork', label: 'Inner Work',      icon: '◉', ids: ['shadowwork', 'chakra'] },
  { key: 'lunar',     label: 'Moon Cycle',      icon: '☽',
    ids: ['newmoon', 'waxingcrescent', 'firstquarter', 'waxinggibbous',
          'fullmoon', 'waninggibbous', 'thirdquarter', 'waningcrescent'] },
];

// ── Shared CSS for library pages ─────────────────────────────────────
// Translates the in-app library look (cd-hero, kw-box, card-row, acc-*)
// into the marketing site's existing palette (--gold, --surface-*, etc.).
const LIBRARY_CSS = `
  .lib-wrap { max-width: 780px; margin: 0 auto; padding: 96px 18px 64px; position: relative; z-index: 1; }
  .lib-crumbs { font-family: var(--font-display); font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 18px; }
  .lib-crumbs a { color: var(--text-mid); }
  .lib-crumbs a:hover { color: var(--gold); }
  .lib-eyebrow { font-family: var(--font-display); font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .lib-h1 { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: 0.06em; color: var(--text); margin-bottom: 10px; line-height: 1.2; }
  .lib-intro { font-size: 1.05rem; color: var(--text-mid); font-style: italic; margin-bottom: 28px; }

  /* Search */
  .lib-search { position: relative; margin-bottom: 22px; }
  .lib-search input { width: 100%; background: var(--surface-1); border: 1px solid var(--gold-border); border-radius: 6px; color: var(--text); font-family: var(--font-serif); font-size: 18px; font-style: italic; padding: 11px 38px 11px 14px; outline: none; transition: border-color .2s; }
  .lib-search input:focus { border-color: var(--gold); }
  .lib-search .icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--gold); pointer-events: none; }

  /* Card index list */
  .lib-section { border: 1px solid var(--gold-border); border-radius: 8px; overflow: hidden; background: var(--surface-1); margin-bottom: 12px; }
  .lib-section-hd { font-family: var(--font-display); font-size: 13px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold-dark); padding: 16px 18px 10px; border-bottom: 1px solid rgba(201,168,76,0.08); }
  .lib-row { display: flex; align-items: center; gap: 16px; padding: 13px 18px; border-bottom: 1px solid rgba(201,168,76,0.06); color: var(--text); transition: background .15s; }
  .lib-row:last-child { border-bottom: none; }
  .lib-row:hover { background: var(--surface-2); color: var(--text); }
  .lib-row-num { font-family: var(--font-display); font-size: 15px; color: var(--gold-dark); width: 36px; flex-shrink: 0; text-align: center; }
  .lib-row-name { font-family: var(--font-display); font-size: 18px; color: var(--text); flex: 1; font-weight: 600; }
  .lib-row-kw { font-size: 16px; color: var(--text-mid); font-style: italic; text-align: right; flex-shrink: 0; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lib-empty { text-align: center; padding: 48px 24px; color: var(--text-mid); font-style: italic; font-size: 18px; }

  /* Card detail */
  .cd-hero { background: linear-gradient(160deg, #0D0A18, #0A0D12); padding: 32px 18px 26px; text-align: center; border: 1px solid var(--gold-border); border-radius: 10px; margin-bottom: 14px; }
  .cd-num { font-family: var(--font-display); font-size: 13px; letter-spacing: 0.35em; color: var(--gold-dark); margin-bottom: 10px; text-transform: uppercase; }
  .cd-frame { width: 78px; height: 122px; margin: 0 auto 16px; background: linear-gradient(160deg, #1A1520, #0F0C18); border: 1px solid var(--gold-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; }
  .cd-frame::after { content: ''; position: absolute; inset: 4px; border: 1px solid rgba(201,168,76,0.14); border-radius: 2px; }
  .cd-sym { font-size: 36px; color: var(--gold); opacity: 0.85; position: relative; z-index: 1; }
  .cd-name { font-family: var(--font-display); font-size: 30px; letter-spacing: 0.08em; color: var(--text); }
  .kw-box { background: var(--surface-2); padding: 18px; border: 1px solid var(--gold-border); border-radius: 10px; margin-bottom: 12px; }
  .kw-row { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start; }
  .kw-row:last-child { margin-bottom: 0; }
  .kw-label { font-family: var(--font-display); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); width: 92px; flex-shrink: 0; padding-top: 4px; }
  .kw-val { font-size: 17px; color: var(--text-mid); font-style: italic; flex: 1; line-height: 1.55; }
  .meaning-block, .practical-box { background: var(--surface-2); padding: 18px 20px; border: 1px solid var(--gold-border); border-radius: 10px; margin-bottom: 12px; }
  .mb-label, .pb-label { font-family: var(--font-display); font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
  .mb-text, .pb-text { font-size: 17px; color: var(--text); line-height: 1.7; }
  .practical-box { background: var(--surface-1); }
  .cd-interp { font-size: 1.1rem; color: var(--text-mid); font-style: italic; text-align: center; padding: 22px 14px 6px; line-height: 1.55; }

  /* Spread index accordion */
  .lib-acc { border: 1px solid rgba(201,168,76,0.18); border-radius: 8px; overflow: hidden; background: var(--surface-1); margin-bottom: 10px; transition: border-color .2s; }
  .lib-acc.open { border-color: rgba(201,168,76,0.34); }
  .lib-acc-hd { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: transparent; border: none; cursor: pointer; text-align: left; color: var(--text); font-family: inherit; }
  .lib-acc-hd .icon { font-family: var(--font-display); font-size: 19px; color: var(--gold-dark); min-width: 22px; text-align: center; }
  .lib-acc.open .lib-acc-hd .icon { color: var(--gold); }
  .lib-acc-label { flex: 1; font-family: var(--font-display); font-size: 15px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-mid); }
  .lib-acc.open .lib-acc-label { color: var(--gold); }
  .lib-acc-count { font-family: var(--font-display); font-size: 13px; color: var(--text-dim); letter-spacing: 0.1em; }
  .lib-acc-chev { font-size: 18px; color: var(--text-dim); margin-left: 10px; transition: transform .2s; }
  .lib-acc.open .lib-acc-chev { transform: rotate(90deg); color: var(--gold); }
  .lib-acc-body { display: none; border-top: 1px solid rgba(201,168,76,0.08); }
  .lib-acc.open .lib-acc-body { display: block; }
  .lib-srow { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(201,168,76,0.06); color: var(--text); transition: background .15s; }
  .lib-srow:last-child { border-bottom: none; }
  .lib-srow:hover { background: var(--surface-2); color: var(--text); }
  .lib-srow-sym { font-size: 20px; min-width: 24px; text-align: center; color: var(--gold-dark); }
  .lib-srow-body { flex: 1; min-width: 0; }
  .lib-srow-name { font-family: var(--font-display); font-size: 15px; color: var(--text); letter-spacing: 0.04em; }
  .lib-srow:hover .lib-srow-name { color: var(--gold); }
  .lib-srow-desc { font-size: 15px; color: var(--text-mid); font-style: italic; margin-top: 2px; line-height: 1.45; }
  .lib-srow-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .tier-free, .tier-premium { font-family: var(--font-display); font-size: 10px; letter-spacing: 0.16em; padding: 2px 6px; border-radius: 4px; }
  .tier-free { color: #7EC87E; border: 1px solid rgba(126,200,126,0.3); }
  .tier-premium { color: var(--gold); border: 1px solid rgba(201,168,76,0.35); background: rgba(201,168,76,0.06); }
  .srow-count { font-family: var(--font-display); font-size: 12px; color: var(--text-dim); letter-spacing: 0.08em; }

  /* Spread detail */
  .sd-hero { text-align: center; padding: 8px 0 24px; }
  .sd-sym { font-size: 38px; color: var(--gold); margin-bottom: 12px; line-height: 1; }
  .sd-meta { display: flex; justify-content: center; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
  .sd-meta span { font-family: var(--font-display); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-dim); border: 1px solid var(--gold-border); padding: 4px 10px; border-radius: 4px; }
  .sd-desc { font-size: 1.05rem; color: var(--text-mid); line-height: 1.7; margin-bottom: 28px; }
  .sd-positions-hd { font-family: var(--font-display); font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
  .sd-pos { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid rgba(201,168,76,0.1); }
  .sd-pos:last-child { border-bottom: none; }
  .sd-pos-num { font-family: var(--font-display); font-size: 14px; color: var(--gold); min-width: 30px; padding-top: 3px; }
  .sd-pos-body { flex: 1; }
  .sd-pos-name { font-family: var(--font-display); font-size: 16px; color: var(--text); letter-spacing: 0.06em; margin-bottom: 4px; }
  .sd-pos-desc { font-size: 16px; color: var(--text-mid); font-style: italic; line-height: 1.55; }

  /* Spread layout diagram (ported from in-app SpreadDetail) */
  .sl-layout-wrap { display: flex; justify-content: center; padding: 26px 18px 30px; background: var(--surface-1); border: 1px solid var(--gold-border); border-radius: 10px; margin: 14px 0 24px; }
  .sl-layout-title { font-family: var(--font-display); font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 18px; text-align: center; }
  .sl-card { background: linear-gradient(160deg, #1A1520, #0F0C18); border: 1px solid var(--gold-border); border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
  .sl-card::after { content: ''; position: absolute; inset: 3px; border: 1px solid rgba(201,168,76,0.12); border-radius: 1px; pointer-events: none; }
  .sl-card.empty { background: transparent !important; border: none !important; }
  .sl-card.empty::after { display: none !important; }
  .sl-num { font-family: var(--font-display); font-size: 13px; color: var(--gold); position: relative; z-index: 1; }
  .layout-5 { display: flex; justify-content: center; gap: 8px; align-items: flex-end; padding-bottom: 10px; }
  .layout-5 .sl-card:nth-child(1) { transform: translateY(12px); }
  .layout-5 .sl-card:nth-child(2) { transform: translateY(5px); }
  .layout-5 .sl-card:nth-child(3) { transform: translateY(0); }
  .layout-5 .sl-card:nth-child(4) { transform: translateY(5px); }
  .layout-5 .sl-card:nth-child(5) { transform: translateY(12px); }
  .layout-year .center-card { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 42px; height: 66px; background: linear-gradient(160deg, #201828, #140F1C); border: 1px solid var(--gold); border-radius: 3px; display: flex; align-items: center; justify-content: center; z-index: 2; }
  .layout-year .center-card .sl-num { font-size: 14px; color: var(--gold-light); }

  /* CTA */
  .lib-cta { display: inline-block; margin-top: 28px; padding: 14px 32px; background: rgba(201,168,76,0.16); border: 1px solid var(--gold-border); border-radius: 8px; color: var(--gold); font-family: var(--font-display); font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase; transition: all .25s; text-align: center; }
  .lib-cta:hover { background: rgba(201,168,76,0.3); border-color: var(--gold); color: var(--gold-light); }
  .lib-cta-wrap { text-align: center; margin-top: 28px; }
`;

// ── Spread layout diagrams (ported verbatim from src/pages/SpreadDetail.tsx) ──
function buildSpreadLayout(s) {
  const c = (n, w, h, fs = 13) =>
    `<div class="sl-card" style="width:${w}px;height:${h}px;"><span class="sl-num" style="font-size:${fs}px;">${n}</span></div>`;
  const e = (w, h) =>
    `<div class="sl-card empty" style="width:${w}px;height:${h}px;"></div>`;

  if (s.count === 1) {
    return `<div style="display:flex;justify-content:center;">${c(1, 72, 112, 16)}</div>`;
  }
  if (s.count === 3) {
    return `<div style="display:flex;justify-content:center;gap:12px;">${[1,2,3].map(n => c(n, 56, 88, 15)).join('')}</div>`;
  }
  if (s.count === 5 && !['waxinggibbous','waninggibbous','waxingcrescent','waningcrescent'].includes(s.id)) {
    return `<div class="layout-5">${[1,2,3,4,5].map(n => c(n, 48, 74, 14)).join('')}</div>`;
  }
  if (s.id === 'waxinggibbous' || s.id === 'waninggibbous') {
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:7px;padding:6px 0;">
      <div>${c(1,34,52,12)}</div>
      <div style="display:flex;gap:18px;">${c(2,34,52,12)}${c(3,34,52,12)}</div>
      <div style="display:flex;gap:18px;">${c(4,34,52,12)}${c(5,34,52,12)}</div>
      <div>${c(6,34,52,12)}</div>
    </div>`;
  }
  if (s.id === 'waxingcrescent' || s.id === 'waningcrescent') {
    return `<div style="display:flex;justify-content:center;gap:10px;">${[1,2,3,4].map(n => c(n, 52, 80, 14)).join('')}</div>`;
  }
  if (s.id === 'horseshoe') {
    const cW = 34, cH = 52;
    const pos = [[8,8],[0,50],[18,92],[93,106],[168,92],[186,50],[178,8]];
    const cards = pos.map(([x,y],i) =>
      `<div class="sl-card" style="position:absolute;left:${x}px;top:${y}px;width:${cW}px;height:${cH}px;"><span class="sl-num" style="font-size:12px;">${i+1}</span></div>`
    );
    return `<div style="position:relative;width:220px;height:164px;">${cards.join('')}</div>`;
  }
  if (s.id === 'celtic') {
    const [W, H] = [36, 56];
    const order = [null,4,null,9, 2,0,3,8, null,1,null,7, null,5,null,6];
    return `<div style="display:grid;grid-template-columns:repeat(4,${W}px);grid-template-rows:repeat(4,${H}px);gap:5px;">
      ${order.map(ci => ci === null ? e(W,H) : c(ci+1,W,H,11)).join('')}
    </div>`;
  }
  if (s.id === 'astro') {
    const r = 76, cx = 95, cy = 95, cW = 30, cH = 48;
    const angles = Array.from({ length: 12 }, (_, i) => 180 - i * 30);
    const cards = angles.map((deg, i) => {
      const rad = deg * Math.PI / 180;
      const x = Math.round(cx + r * Math.cos(rad) - cW / 2);
      const y = Math.round(cy + r * Math.sin(rad) - cH / 2);
      return `<div class="sl-card" style="position:absolute;left:${x}px;top:${y}px;width:${cW}px;height:${cH}px;"><span class="sl-num" style="font-size:11px;">${i+1}</span></div>`;
    });
    return `<div style="position:relative;width:190px;height:190px;">${cards.join('')}</div>`;
  }
  if (s.id === 'yearahead') {
    const r = 76, cx = 100, cy = 100, cW = 28, cH = 44;
    const angles = Array.from({ length: 12 }, (_, i) => 90 - i * 30);
    const cards = angles.map((deg, i) => {
      const rad = deg * Math.PI / 180;
      const x = Math.round(cx + r * Math.cos(rad) - cW / 2);
      const y = Math.round(cy - r * Math.sin(rad) - cH / 2);
      return `<div class="sl-card" style="position:absolute;left:${x}px;top:${y}px;width:${cW}px;height:${cH}px;"><span class="sl-num" style="font-size:10px;">${i+1}</span></div>`;
    });
    return `<div class="layout-year" style="position:relative;width:200px;height:200px;">${cards.join('')}<div class="center-card"><span class="sl-num">13</span></div></div>`;
  }
  if (s.id === 'relationship') {
    const [W, H] = [34, 52];
    const pos = {
      1: [110, 20], 2: [145, 54], 3: [128, 104], 4: [83, 150],
      5: [38, 104], 6: [21, 54], 7: [56, 20],
    };
    const hp = `M 100 66 C 100 56 87 46 73 46 C 52 46 38 62 38 80 C 38 104 100 146 100 176 C 100 146 162 104 162 80 C 162 62 148 46 127 46 C 113 46 100 56 100 66 Z`;
    const svg = `<svg width="200" height="205" style="position:absolute;inset:0;pointer-events:none;" viewBox="0 0 200 205"><path d="${hp}" fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.32)" stroke-width="1.5"/></svg>`;
    const cards = Object.entries(pos).map(([n,[x,y]]) =>
      `<div class="sl-card" style="position:absolute;left:${x}px;top:${y}px;width:${W}px;height:${H}px;"><span class="sl-num" style="font-size:12px;">${n}</span></div>`
    );
    return `<div style="position:relative;width:200px;height:205px;">${svg}${cards.join('')}</div>`;
  }
  if (s.id === 'decision') {
    const [W, H] = [34, 52];
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;">
      <div>${c(1,W,H)}</div>
      <div style="display:flex;gap:38px;">${c(2,W,H)}${c(3,W,H)}</div>
      <div style="display:flex;gap:10px;">${c(4,W,H)}${c(5,W,H)}</div>
      <div style="display:flex;gap:38px;">${c(6,W,H)}${c(7,W,H)}</div>
    </div>`;
  }
  if (s.id === 'shadowwork' || s.id === 'career') {
    const [W, H] = [44, 64];
    return `<div style="display:grid;grid-template-columns:${W}px ${W}px;gap:10px;">
      ${[1,2,3,4,5,6].map(n => c(n,W,H)).join('')}
    </div>`;
  }
  if (s.id === 'chakra') {
    const [W, H] = [22, 30];
    const labels = ['','Root','Sacral','Solar Plexus','Heart','Throat','Third Eye','Crown'];
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:4px 0;">
      ${[7,6,5,4,3,2,1].map(n => `<div style="display:flex;align-items:center;gap:8px;">
        <div style="font-family:var(--font-display);font-size:12px;color:var(--text-mid);width:80px;text-align:right;letter-spacing:0.04em;line-height:1.2;">${labels[n]}</div>
        <div class="sl-card" style="width:${W}px;height:${H}px;"><span style="font-family:var(--font-display);font-size:11px;color:var(--gold);position:relative;z-index:1;">${n}</span></div>
      </div>`).join('')}
    </div>`;
  }
  if (s.id === 'weekly') {
    return `<div style="display:flex;justify-content:center;gap:6px;padding:4px 0;flex-wrap:wrap;">
      ${[1,2,3,4,5,6,7].map(n => c(n, 36, 56, 12)).join('')}
    </div>`;
  }
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:280px;">
    ${Array.from({ length: s.count }, (_, i) => c(i+1, 42, 66)).join('')}
  </div>`;
}

// ── Page shell ───────────────────────────────────────────────────────
const pageShell = ({ title, description, canonical, jsonLd, header, footer, body, extraHead = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <link rel="canonical" href="${escapeAttr(canonical)}" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeAttr(canonical)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Liminal Veil — Pull. Reflect. Know." />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet" />
  <style>${BASE_CSS}${LIBRARY_CSS}${extraHead}</style>
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
${header}

<main class="lib-wrap">
${body}
</main>

${footer}

<script>
  // Mobile menu toggle (same as homepage)
  function toggleMenu() {
    var m = document.getElementById('mobile-menu');
    if (m) m.style.display = (m.style.display === 'none' || !m.style.display) ? 'block' : 'none';
  }
</script>
</body>
</html>
`;

// ── Minimal base CSS pulled from the homepage palette ────────────────
// We don't try to extract the entire stylesheet — just the variables and
// nav/footer styles that the injected header/footer markup depends on.
const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E8C97A; --gold-dark: #8B6A2A;
    --gold-glow: rgba(201,168,76,0.18); --gold-border: rgba(201,168,76,0.28);
    --bg: #080808; --surface-1: #0f0f12; --surface-2: #16161a; --surface-3: #1e1e24;
    --text: #EDE8DC; --text-mid: rgba(237,232,220,0.72); --text-dim: rgba(237,232,220,0.50);
    --radius: 10px;
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-display: 'Cinzel', serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-serif); font-size: 18px; line-height: 1.7; overflow-x: hidden; }
  a { color: var(--gold); text-decoration: none; transition: color .2s; }
  a:hover { color: var(--gold-light); }
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse at 20% 10%, rgba(201,168,76,0.04) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 90%, rgba(130,80,180,0.05) 0%, transparent 55%);
  }
  .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; position: relative; }

  /* Nav */
  #nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(8,8,8,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--gold-border); }
  #nav .container { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; }
  .nav-logo { font-family: var(--font-display); font-size: 16px; letter-spacing: 0.18em; color: var(--gold); }
  .nav-links { list-style: none; display: flex; gap: 28px; }
  .nav-links a { font-family: var(--font-display); font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-mid); }
  .nav-links a:hover { color: var(--gold); }
  .nav-cta { display: flex; align-items: center; gap: 14px; }
  .btn { display: inline-block; font-family: var(--font-display); font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; padding: 9px 18px; border-radius: 6px; transition: all .25s; cursor: pointer; }
  .btn-outline { border: 1px solid var(--gold-border); color: var(--gold); }
  .btn-outline:hover { border-color: var(--gold); background: rgba(201,168,76,0.08); }
  .btn-primary { background: rgba(201,168,76,0.2); border: 1px solid var(--gold-border); color: var(--gold); }
  .btn-primary:hover { background: rgba(201,168,76,0.34); border-color: var(--gold); }
  .hamburger { display: none; flex-direction: column; gap: 4px; cursor: pointer; }
  .hamburger span { width: 22px; height: 1.5px; background: var(--gold); }
  @media (max-width: 720px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
  }

  /* Footer */
  #footer { border-top: 1px solid var(--gold-border); padding: 48px 0 32px; margin-top: 64px; position: relative; z-index: 1; background: var(--bg); }
  .footer-inner { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .footer-brand-name { font-family: var(--font-display); font-size: 1.1rem; letter-spacing: 0.14em; color: var(--gold); margin-bottom: 10px; }
  .footer-brand-desc { font-size: 0.88rem; color: var(--text-dim); line-height: 1.6; max-width: 280px; }
  .footer-email { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--gold); margin-top: 14px; }
  .footer-col-title { font-family: var(--font-display); font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .footer-links a { font-size: 0.88rem; color: var(--text-dim); transition: color .2s; }
  .footer-links a:hover { color: var(--gold); }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid rgba(201,168,76,0.12); }
  .footer-copy { font-size: 0.78rem; color: var(--text-dim); }
  .footer-bottom-links { display: flex; gap: 20px; }
  .footer-bottom-links a { font-size: 0.78rem; color: var(--text-dim); }
  @media (max-width: 720px) { .footer-inner { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 480px) { .footer-inner { grid-template-columns: 1fr; } }
`;

// ── JSON-LD builders ────────────────────────────────────────────────
const articleLd = ({ title, description, url, section }) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url,
  articleSection: section,
  publisher: {
    '@type': 'Organization',
    name: 'Liminal Veil',
    url: SITE,
  },
});

const collectionLd = ({ title, description, url, count }) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description,
  url,
  numberOfItems: count,
});

// ── Renderers ───────────────────────────────────────────────────────
function renderCardIndex({ header, footer }) {
  const sections = SUITS.map(suit => `
    <div class="lib-section" data-suit="${suit.key}">
      <div class="lib-section-hd">${escapeHtml(suit.label)}</div>
      ${suit.cards.map(c => `
        <a class="lib-row" href="/cards/${c.slug}.html" data-name="${escapeAttr(c.name.toLowerCase())}" data-kw="${escapeAttr((c.up + ' ' + c.rev).toLowerCase())}">
          <div class="lib-row-num">${escapeHtml(c.num)}</div>
          <div class="lib-row-name">${escapeHtml(c.name)}</div>
          <div class="lib-row-kw">${escapeHtml(c.up.split(',')[0].trim())}</div>
        </a>`).join('')}
    </div>`).join('');

  const body = `
    <div class="lib-crumbs"><a href="/">Liminal Veil</a> &nbsp;›&nbsp; The 78 Cards</div>
    <div class="lib-eyebrow">✦ Card Library</div>
    <h1 class="lib-h1">The 78 Cards</h1>
    <p class="lib-intro">Every card in the tarot, with upright and reversed meanings, narrative interpretations, and practical guidance.</p>

    <div class="lib-search">
      <input id="card-search" type="text" placeholder="Search cards, keywords, suits…" autocomplete="off" />
      <span class="icon">◎</span>
    </div>
    <div id="empty" class="lib-empty" style="display:none;">No cards found.</div>

    <div id="card-sections">${sections}</div>

    <script>
      (function() {
        var input = document.getElementById('card-search');
        var sections = document.querySelectorAll('#card-sections .lib-section');
        var empty = document.getElementById('empty');
        input.addEventListener('input', function() {
          var q = input.value.toLowerCase().trim();
          var any = false;
          sections.forEach(function(sec) {
            var rows = sec.querySelectorAll('.lib-row');
            var sectionAny = false;
            rows.forEach(function(r) {
              var match = !q || r.dataset.name.indexOf(q) !== -1 || r.dataset.kw.indexOf(q) !== -1;
              r.style.display = match ? '' : 'none';
              if (match) sectionAny = true;
            });
            sec.style.display = sectionAny ? '' : 'none';
            if (sectionAny) any = true;
          });
          empty.style.display = any ? 'none' : 'block';
        });
      })();
    </script>
  `;

  return pageShell({
    title: 'The 78 Tarot Cards — Meanings & Interpretations | Liminal Veil',
    description: 'Every tarot card explained: Major Arcana plus Wands, Cups, Swords, and Pentacles. Upright and reversed meanings, narrative interpretations, and practical guidance.',
    canonical: `${SITE}/cards/`,
    jsonLd: collectionLd({
      title: 'The 78 Tarot Cards',
      description: 'Complete guide to all 78 tarot cards with upright, reversed, and narrative meanings.',
      url: `${SITE}/cards/`,
      count: ALL_CARDS.length,
    }),
    header, footer, body,
  });
}

function renderCardDetail(c, { header, footer }) {
  const suitLabel = c.suit === 'major' ? 'Major Arcana' :
                    c.suit ? c.suit.charAt(0).toUpperCase() + c.suit.slice(1) : '';
  const numLabel = c.suit && c.suit !== 'major' ? `${c.num} of ${suitLabel}` : `${suitLabel} · ${c.num}`;

  const title = `${c.name} — Tarot Card Meaning (Upright & Reversed) | Liminal Veil`;
  const description = `${c.name}: ${c.up}. Reversed: ${c.rev}. Narrative meaning and practical guidance.`;
  const canonical = `${SITE}/cards/${c.slug}.html`;

  const body = `
    <div class="lib-crumbs"><a href="/">Liminal Veil</a> &nbsp;›&nbsp; <a href="/cards/">The 78 Cards</a> &nbsp;›&nbsp; ${escapeHtml(c.name)}</div>

    <div class="cd-hero">
      <div class="cd-num">${escapeHtml(numLabel)}</div>
      <div class="cd-frame"><span class="cd-sym">${escapeHtml(c.sym)}</span></div>
      <h1 class="cd-name">${escapeHtml(c.name)}</h1>
    </div>

    <div class="kw-box">
      <div class="kw-row"><span class="kw-label">Upright</span><span class="kw-val">${escapeHtml(c.up)}</span></div>
      <div class="kw-row"><span class="kw-label">Reversed</span><span class="kw-val">${escapeHtml(c.rev)}</span></div>
    </div>

    <div class="meaning-block">
      <h2 class="mb-label">Narrative Meaning</h2>
      <div class="mb-text">${escapeHtml(c.meaning).replace(/\n/g, '<br /><br />')}</div>
    </div>

    <div class="practical-box">
      <h2 class="pb-label">Practical Note</h2>
      <div class="pb-text">${escapeHtml(c.practical)}</div>
    </div>

    <div class="cd-interp">${escapeHtml(c.interp)}</div>

    <div class="lib-cta-wrap">
      <a class="lib-cta" href="${APP}/spreads">✦ &nbsp; Do a Reading in the App</a>
    </div>
  `;

  return pageShell({
    title, description, canonical,
    jsonLd: articleLd({ title, description, url: canonical, section: 'Tarot Cards' }),
    header, footer, body,
  });
}

function renderSpreadIndex({ header, footer }) {
  const sectionsHtml = SPREAD_SECTIONS.map(sec => {
    const spreads = sec.ids
      .map(id => SPREADS.find(s => s.id === id))
      .filter(Boolean);
    if (!spreads.length) return '';
    return `
    <div class="lib-acc">
      <button class="lib-acc-hd" type="button" onclick="this.parentElement.classList.toggle('open')">
        <span class="icon">${escapeHtml(sec.icon)}</span>
        <span class="lib-acc-label">${escapeHtml(sec.label)}</span>
        <span class="lib-acc-count">${spreads.length}</span>
        <span class="lib-acc-chev">›</span>
      </button>
      <div class="lib-acc-body">
        ${spreads.map(s => `
          <a class="lib-srow" href="/spreads/${s.slug}.html">
            <span class="lib-srow-sym">${escapeHtml(s.sym || '✦')}</span>
            <div class="lib-srow-body">
              <div class="lib-srow-name">${escapeHtml(s.name)}</div>
              <div class="lib-srow-desc">${escapeHtml(s.desc.length > 110 ? s.desc.slice(0, 110) + '…' : s.desc)}</div>
            </div>
            <div class="lib-srow-right">
              <span class="${s.tier === 'free' ? 'tier-free' : 'tier-premium'}">${s.tier === 'free' ? 'FREE' : 'PREMIUM'}</span>
              <span class="srow-count">${s.count}C</span>
            </div>
          </a>`).join('')}
      </div>
    </div>`;
  }).join('');

  const body = `
    <div class="lib-crumbs"><a href="/">Liminal Veil</a> &nbsp;›&nbsp; Spread Library</div>
    <div class="lib-eyebrow">✦ Spread Library</div>
    <h1 class="lib-h1">Choose Your Spread</h1>
    <p class="lib-intro">Every question has a layout waiting for it. ${SPREADS.length} spreads across daily, love, decision-making, career, inner work, and the lunar cycle.</p>

    ${sectionsHtml}
  `;

  return pageShell({
    title: 'Tarot Spreads — Layouts & Meanings | Liminal Veil',
    description: `Tarot spread library: Celtic Cross, Past · Present · Future, Three-Card Love, Career, Shadow Work, Chakra, full lunar cycle, and more. ${SPREADS.length} spreads with position-by-position meanings.`,
    canonical: `${SITE}/spreads/`,
    jsonLd: collectionLd({
      title: 'Tarot Spread Library',
      description: 'Complete guide to tarot spreads with position meanings and use cases.',
      url: `${SITE}/spreads/`,
      count: SPREADS.length,
    }),
    header, footer, body,
  });
}

function renderSpreadDetail(s, { header, footer }) {
  const title = `${s.name} — Tarot Spread (${s.count}-Card Layout) | Liminal Veil`;
  const description = `${s.name}: ${s.desc.length > 150 ? s.desc.slice(0, 150) + '…' : s.desc}`;
  const canonical = `${SITE}/spreads/${s.slug}.html`;

  const positionsHtml = s.positions.map((p, i) => `
    <div class="sd-pos">
      <div class="sd-pos-num">${i + 1}</div>
      <div class="sd-pos-body">
        <div class="sd-pos-name">${escapeHtml(p.name)}</div>
        ${p.desc ? `<div class="sd-pos-desc">${escapeHtml(p.desc)}</div>` : ''}
      </div>
    </div>`).join('');

  const ctaHref = s.tier === 'premium' ? `${APP}/paywall` : `${APP}/spreads/${s.id}`;
  const ctaLabel = s.tier === 'premium' ? '✦ &nbsp; Unlock in the App' : '✦ &nbsp; Do This Reading in the App';

  const body = `
    <div class="lib-crumbs"><a href="/">Liminal Veil</a> &nbsp;›&nbsp; <a href="/spreads/">Spreads</a> &nbsp;›&nbsp; ${escapeHtml(s.name)}</div>

    <div class="sd-hero">
      <div class="sd-sym">${escapeHtml(s.sym || '✦')}</div>
      <h1 class="lib-h1" style="margin-bottom:8px;">${escapeHtml(s.name)}</h1>
      <div class="sd-meta">
        <span>${escapeHtml(s.count)} cards</span>
        <span>${escapeHtml(s.level)}</span>
        <span>${escapeHtml(s.cat)}</span>
        <span class="${s.tier === 'free' ? 'tier-free' : 'tier-premium'}">${s.tier === 'free' ? 'FREE' : 'PREMIUM'}</span>
      </div>
    </div>

    <p class="sd-desc">${escapeHtml(s.desc)}</p>

    <div class="sl-layout-wrap">
      <div>
        <div class="sl-layout-title">◈ &nbsp; Spread Layout</div>
        ${buildSpreadLayout(s)}
      </div>
    </div>

    <div class="sd-positions-hd">◇ Position Meanings</div>
    ${positionsHtml}

    <div class="lib-cta-wrap">
      <a class="lib-cta" href="${ctaHref}">${ctaLabel}</a>
    </div>

    <div style="text-align:center; margin-top:24px;">
      <a href="/cards/" style="font-family:var(--font-display); font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-mid);">Browse the 78 Cards →</a>
    </div>
  `;

  return pageShell({
    title, description, canonical,
    jsonLd: articleLd({ title, description, url: canonical, section: 'Tarot Spreads' }),
    header, footer, body,
  });
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  let indexHtml = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  indexHtml = indexHtml.replace(/\r\n/g, '\n');

  const navBlock = between(indexHtml, /<nav id="nav">/, '</nav>');
  const mobileMenu = between(indexHtml, /<div id="mobile-menu"/, '</ul>\n</div>');
  const footerBlock = between(indexHtml, /<footer id="footer">/, '</footer>');

  const header = rewriteAnchors(navBlock + '\n' + mobileMenu);
  const footer = rewriteAnchors(footerBlock);

  await mkdir(path.join(ROOT, 'cards'), { recursive: true });
  await mkdir(path.join(ROOT, 'spreads'), { recursive: true });

  // Card pages
  await writeFile(path.join(ROOT, 'cards', 'index.html'), renderCardIndex({ header, footer }));
  for (const c of ALL_CARDS) {
    await writeFile(path.join(ROOT, 'cards', `${c.slug}.html`), renderCardDetail(c, { header, footer }));
  }

  // Spread pages
  await writeFile(path.join(ROOT, 'spreads', 'index.html'), renderSpreadIndex({ header, footer }));
  for (const s of SPREADS) {
    await writeFile(path.join(ROOT, 'spreads', `${s.slug}.html`), renderSpreadDetail(s, { header, footer }));
  }

  // Sitemap
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `${SITE}/`,
    `${SITE}/cards/`,
    ...ALL_CARDS.map(c => `${SITE}/cards/${c.slug}.html`),
    `${SITE}/spreads/`,
    ...SPREADS.map(s => `${SITE}/spreads/${s.slug}.html`),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  await writeFile(path.join(ROOT, 'sitemap.xml'), sitemap);

  console.log(`✓ Built ${ALL_CARDS.length} cards, ${SPREADS.length} spreads, 2 index pages, sitemap.xml`);
}

main().catch(err => { console.error(err); process.exit(1); });
