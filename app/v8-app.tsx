"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSteps } from "@/hooks/use-steps";
import { CARDS as LIB_CARDS } from "@/lib/cards";
import { useLanguage } from "@/hooks/use-language";
import { usePacking } from "@/hooks/use-packing";
import CarRoutePage from "./car-route";
import type { StepCard, BilingualText } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// RAMESHWARAM YATRA v8 — "Ive Edition"
// Added: Cash Budget, Per-Person Packing, Car & Route
// 4 pax: Shantanu + Parents + Shruti | MG Hector CVT
// ═══════════════════════════════════════════════════════════════

/* ─── Design Tokens ─── */
const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F3F2EF",
  sunken:    "#E8E6E1",
  text:      "#181511",
  secondary: "#5C574F",
  tertiary:  "#8E8A82",
  accent:    "#9B6B2C",
  accentHover:"#7D5522",
  accentSoft:"rgba(155,107,44,0.09)",
  accentMid: "rgba(155,107,44,0.16)",
  done:      "#28784A",
  doneSoft:  "rgba(40,120,74,0.1)",
  blue:      "#2B6BBF",
  blueSoft:  "rgba(43,107,191,0.08)",
  border:    "rgba(24,21,17,0.06)",
  shadow:    "0 2px 8px rgba(24,21,17,0.04)",
  shadowMd:  "0 4px 20px rgba(24,21,17,0.06)",
  shadowLg:  "0 8px 40px rgba(24,21,17,0.08)",
  sans:      "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  mono:      "'DM Mono', 'SF Mono', monospace",
  r:         "12px",
  rLg:       "16px",
  rFull:     "999px",
  ease:      "cubic-bezier(0.22, 1, 0.36, 1)",
  easeOut:   "cubic-bezier(0.16, 1, 0.3, 1)",
};

/* ─── Per-card tints ─── */
const TINTS = {
  "check-in":       { tint: "#C8B291", img: "/images/daiwik_hotel.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Daiwik+Hotels+Rameswaram&query_place_id=ChIJPfcl8_njATsRD6uT28qgVWg" },
  "evening-recon":  { tint: "#D4944A", img: "/images/temple.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Sri+Arulmigu+Ramanathaswamy+Temple&query_place_id=ChIJbaxJSdzjATsRuqRKzHCr_Z8" },
  "spatika-lingam": { tint: "#8FA5BD", img: "/images/spatika_lingam.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=Sri+Arulmigu+Ramanathaswamy+Temple&query_place_id=ChIJbaxJSdzjATsRuqRKzHCr_Z8" },
  "agni-theertham": { tint: "#5A9EAD", img: "/images/agnee_teertham.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Agni+Teertham&query_place_id=ChIJ0VJTyNvjATsRoXeSFjBbPnc" },
  "22-theerthams":  { tint: "#B89B5E", img: "/images/22_teertham.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=22+Kodi+(well+snanam+Theertham.&query_place_id=ChIJfSyJKOrjATsRrMpjhRptV0E" },
  "main-darshan":   { tint: "#C69A2E", img: "/images/main_jyotirlinga.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=Sri+Arulmigu+Ramanathaswamy+Temple&query_place_id=ChIJbaxJSdzjATsRuqRKzHCr_Z8" },
  "rest-hotel":     { tint: "#A89E88", img: "/images/daiwik_hotel.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Daiwik+Hotels+Rameswaram&query_place_id=ChIJPfcl8_njATsRD6uT28qgVWg" },
  "dhanushkodi":    { tint: "#5FA3B8", img: "/images/dhanushkodi.jpeg", maps: "https://www.google.com/maps/search/?api=1&query=Dhanushkodi&query_place_id=ChIJL5bJau8C_joRuqpBdARGIkE" },
  "gandhamadana":   { tint: "#6E9E6E", img: "/images/Gandhamana-Parvatham-Rameshwaram.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Gandhamadhana+Parvatham&query_place_id=ChIJ2SCRBybhATsRmgMH9dFMS5A" },
  "panchamukhi-hanuman": { tint: "#C47040", img: "/images/panchmukhi_hanuman_temple.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Sri+Panchmukhi+Hanuman+temple+and+Floating+Stones&query_place_id=ChIJhQSJ0-XjATsRAb8O4p9XF8U" },
  "buffer-morning": { tint: "#C8BA94", img: "/images/temple.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Sri+Arulmigu+Ramanathaswamy+Temple&query_place_id=ChIJbaxJSdzjATsRuqRKzHCr_Z8" },
  "abdul-kalam":    { tint: "#7B8FA4", img: "/images/abdul_kalam_memorial.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Dr.+A.P.J.+Abdul+Kalam+Memorial&query_place_id=ChIJB0Wj3-njATsReoUUQNG6zoQ" },
  "checkout-drive": { tint: "#6B9E6B", img: "/images/home.jpg", maps: "https://www.google.com/maps/search/?api=1&query=Daiwik+Hotels+Rameswaram&query_place_id=ChIJPfcl8_njATsRD6uT28qgVWg" },
};

/* ─── V8 Card adapter ─── */
type V8Card = {
  slug: string; day: number; dayLabel: string; dayTitle: string; sort: number;
  title: string; sub: string; time: string; dur: number; tip: string;
  carry: string[]; skip: boolean; phase: number | null;
  next: string | null; nextTime: string | null; nextSlug: string | null;
};

const DAY_META: Record<number, [string, string]> = {
  0: ["Feb 28", "Arrival Day"], 1: ["Mar 1", "Core Darshan"], 2: ["Mar 2", "Return Day"],
};

function toV8Card(card: StepCard, t: (bi: BilingualText) => string): V8Card {
  const nextCard = card.nextSlug ? LIB_CARDS.find(c => c.slug === card.nextSlug) ?? null : null;
  const [dayLabel, dayTitle] = DAY_META[card.dayNumber] ?? ["", ""];
  const phaseNum = card.phase ? parseInt(card.phase.match(/\d/)?.[0] ?? "0") : null;
  return {
    slug: card.slug, day: card.dayNumber, dayLabel, dayTitle, sort: card.sortOrder,
    title: t(card.title), sub: t(card.subtitle), time: card.timeWindow, dur: card.durationMin,
    tip: t(card.tip), carry: card.carry.map(c => t(c)), skip: card.skipAllowed,
    phase: phaseNum, next: nextCard ? t(nextCard.title) : null,
    nextTime: nextCard ? nextCard.timeWindow : null, nextSlug: card.nextSlug,
  };
}

const PHASE_STEPS = ["Sea Bath","22 Wells","Jyotirlinga"];
const DAY_MILESTONES = [0, 2, 10];

/* ─── Info Data ─── */
const INFO = {
  hotel:{ name:"Daiwik Hotels", addr:"1/28A, Sethupathi St, Rameshwaram, TN 623526", phone:"+91 4573 221 777", cin:"2:00 PM", cout:"12:00 PM", dist:"2.5 km from temple", parking:"Free parking at hotel" },
  timings:[{k:"Morning Darshan",v:"4:00 AM – 1:00 PM"},{k:"Temple Closed",v:"1:00 – 3:00 PM"},{k:"Evening Darshan",v:"3:00 – 8:00 PM"},{k:"Spatika Lingam",v:"5:00 – 6:00 AM only"}],
  dress:[{t:"Men — Dhoti/pyjama + kurta",em:false},{t:"Women — Saree/churidar + dupatta",em:false},{t:"No western wear or leather inside temple",em:true},{t:"Wet clothes not allowed in main sanctum",em:true}],
  sos:[{k:"Hotel Front Desk",v:"+91 4573 221 777"},{k:"Rameshwaram Police",v:"04573-221 210"},{k:"Govt Hospital",v:"04573-221 223"}],
};

/* ─── Cash Budget Data ─── */
const BUDGET = {
  temple: [
    { item: "Spatika Lingam", unit: "₹50 × 4", total: 200 },
    { item: "22 Theerthams", unit: "₹25 × 4", total: 100 },
    { item: "Main Darshan VIP", unit: "₹200 × 4", total: 800, note: "if queue > 30 min" },
    { item: "Abdul Kalam Memorial", unit: "₹15 × 4", total: 60 },
  ],
  transport: [
    { item: "Fuel (round trip)", unit: "~104L × ₹102", total: 10600, note: "Hector CVT @ ~11 km/l" },
    { item: "Tolls (FASTag)", unit: "~₹900 × 2", total: 1800, note: "via Salem–Trichy" },
    { item: "Dhanushkodi Jeep", unit: "₹150 × 4", total: 600, note: "shared jeep, last 8 km" },
  ],
  food: [
    { item: "Day 0 dinner", unit: "4 pax", total: 1000 },
    { item: "Day 1 lunch + dinner", unit: "4 pax", total: 1500 },
    { item: "Day 2 road lunch", unit: "4 pax", total: 800 },
    { item: "Snacks / water / chai", unit: "3 days", total: 500 },
  ],
  misc: [
    { item: "Prasad / offerings", unit: "", total: 500 },
    { item: "Temple parking", unit: "2 days", total: 200 },
    { item: "Emergency buffer", unit: "", total: 500 },
  ],
};

const BUDGET_TOTALS = {
  temple: BUDGET.temple.reduce((s,i)=>s+i.total,0),
  transport: BUDGET.transport.reduce((s,i)=>s+i.total,0),
  food: BUDGET.food.reduce((s,i)=>s+i.total,0),
  misc: BUDGET.misc.reduce((s,i)=>s+i.total,0),
};
const BUDGET_GRAND = Object.values(BUDGET_TOTALS).reduce((s,v)=>s+v,0);
const CASH_CARRY = 5000; // temples + jeep + small vendors are cash-only

/* ─── Packing Lists ─── */
const PACKING = {
  shantanu: {
    label: "Shantanu", sub: "Driver + CPAP",
    items: [
      "CPAP machine + power adapter + extension cord",
      "Driving license, RC, insurance printout",
      "FASTag — check balance (₹2,000+)",
      "Phone mount + car charger (USB-C)",
      "2 sets dhoti/kurta (temple)",
      "1 set clothes for sea bath (will get soaked)",
      "1 spare casual set",
      "Towel",
      "Waterproof pouch (phone + keys)",
      "Wallet — ₹5,000 cash + cards",
      "Sunglasses",
      "Medications (if any)",
      "Slip-on footwear (temple)",
    ],
  },
  parents: {
    label: "Parents", sub: "Comfort priority",
    items: [
      "Comfortable walking shoes (long temple corridors)",
      "2 sets traditional clothes (temple — dhoti/saree)",
      "1 set clothes for sea bath",
      "1 spare comfortable set",
      "Towels",
      "All regular medications",
      "Reading glasses",
      "Light shawl / jacket (5 AM temple visit)",
      "Slip-on footwear (temple)",
      "Small pillow / neck rest (10 hr drive)",
      "Water bottle each",
    ],
  },
  shruti: {
    label: "Shruti", sub: "",
    items: [
      "2 sets churidar / saree (temple)",
      "1 set clothes for sea bath",
      "1 spare casual set",
      "Dupatta (temple requirement for women)",
      "Towel",
      "Sunscreen",
      "Slip-on footwear (temple)",
      "Medications (if any)",
    ],
  },
  car: {
    label: "Car & Shared", sub: "MG Hector",
    items: [
      "Water bottles × 8",
      "Snack box (drive + temple breaks)",
      "First aid kit",
      "Umbrella × 2 (sun protection)",
      "Plastic bags × 6 (for wet clothes)",
      "Car documents folder (RC, insurance)",
      "Tissue / wet wipes",
      "Garbage bags",
      "Phone charging cables × 2",
      "Torch / phone flashlight (5 AM temple)",
    ],
  },
  petcare: {
    label: "Pre-departure", sub: "Chiku & Oreo",
    items: [
      "Confirm pet boarding / sitter",
      "Drop off pets before departure",
      "Share vet contact with sitter",
      "Print feeding schedule + medication (if any)",
      "Pack enough pet food for 3 days",
      "Share your contact + Surabhi as backup",
    ],
  },
};

/* ─── Route Data ─── */
/* ─── Styles ─── */
const CSS = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{font-family:${T.sans};background:${T.bg};color:${T.text};-webkit-font-smoothing:antialiased;overflow-x:hidden}

@keyframes enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes checkIn{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes softPulse{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes lbFadeIn{from{opacity:0}to{opacity:1}}
@keyframes lbScaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}

.s1{animation:enter .5s ${T.ease} both;animation-delay:0s}
.s2{animation:enter .5s ${T.ease} both;animation-delay:.06s}
.s3{animation:enter .5s ${T.ease} both;animation-delay:.12s}
.s4{animation:enter .5s ${T.ease} both;animation-delay:.18s}
.s5{animation:enter .5s ${T.ease} both;animation-delay:.24s}
.s6{animation:enter .5s ${T.ease} both;animation-delay:.30s}
.s7{animation:enter .5s ${T.ease} both;animation-delay:.36s}
.s8{animation:enter .5s ${T.ease} both;animation-delay:.42s}

.press{transition:transform .15s ${T.ease},opacity .15s}
.press:active{transform:scale(0.975)!important;opacity:0.85}

::-webkit-scrollbar{width:0;height:0}
`;


/* ─── Icon System ─── */
const Icon = {
  check: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  skip: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"/></svg>,
  bulb: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>,
  chevDown: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>,
  clock: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>,
  phone: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>,
  bag: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>,
  pin: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>,
  list: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg>,
  info: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>,
  car: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>,
  rupee: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 0a3 3 0 0 1-3 3m3-3V6H9v2.25m0 0a3 3 0 0 0 3 3m-3-3h6m-3 3v5.25m0 0-3 3m3-3 3 3"/></svg>,
  suitcase: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>,
  map: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a1.5 1.5 0 0 1 3 0V15m0 0-3 3m3-3 3 3m-6-15h.008v.008H9V3.75Z"/></svg>,
  hotel: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M15.75 21H8.25m6.75-18.545c-.75-.11-1.51-.17-2.25-.195m-2.25.195c-.75.025-1.5.085-2.25.195M15.75 3.545v3.06a3.75 3.75 0 0 1-7.5 0v-3.06"/></svg>,
};


/* ═══════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════ */

function Swatch({ slug, size = 44, radius = 14, onTap }: { slug: string; size?: number; radius?: number; onTap?: (src: string, label: string) => void }) {
  const t = TINTS[slug as keyof typeof TINTS] || TINTS["check-in"];
  return (
    <div
      onClick={onTap ? (e) => { e.stopPropagation(); onTap(t.img, slug); } : undefined}
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${t.tint}, ${t.tint}cc)`,
        cursor: onTap ? "pointer" : undefined,
      }}
    >
      <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function HeroCard({ slug, phase, title, sub, onTap }: { slug: string; phase: number | null; title: string; sub: string; onTap?: (src: string, label: string) => void }) {
  const t = TINTS[slug as keyof typeof TINTS] || TINTS["check-in"];
  return (
    <div
      onClick={onTap ? () => onTap(t.img, title) : undefined}
      style={{
        position: "relative", borderRadius: T.rLg, overflow: "hidden",
        aspectRatio: "16/9", boxShadow: T.shadowLg,
        background: t.tint,
        cursor: onTap ? "pointer" : undefined,
      }}
    >
      <img src={t.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)" }} />
      {phase && (
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "5px 14px", borderRadius: T.rFull }}>Phase {phase} of 3</div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 24px" }}>
        <h2 style={{ fontSize: 25, fontWeight: 600, color: "white", lineHeight: 1.18, letterSpacing: "-0.025em", marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 400, lineHeight: 1.4 }}>{sub}</p>
      </div>
    </div>
  );
}

function PhaseBar({ currentPhase }: { currentPhase: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "18px 20px", borderRadius: T.r, background: T.surface, border: `1px solid ${T.border}` }}>
      {PHASE_STEPS.map((step, i) => {
        const n = i + 1, done = currentPhase > n, active = currentPhase === n;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? T.done : active ? T.accent : T.wash, border: done || active ? "none" : `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: `all .35s ${T.ease}` }}>
                {done && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.02em", color: done ? T.done : active ? T.accent : T.tertiary }}>{step}</span>
            </div>
            {i < PHASE_STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, margin: "0 8px", marginBottom: 20, background: done ? T.done : T.sunken, borderRadius: 1, transition: `background .4s ${T.ease}` }} />}
          </div>
        );
      })}
    </div>
  );
}

function TimeDisplay({ time, dur }: { time: string; dur: number }) {
  const durStr = dur >= 60 ? `${Math.floor(dur / 60)}h${dur % 60 ? ` ${dur % 60}m` : ''}` : `${dur}m`;
  const parts = time.split("–");
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ color: T.tertiary, display: "flex", alignItems: "center", marginRight: 2 }}>{Icon.clock}</span>
        <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{parts[0]?.trim().split(" ")[0]}</span>
        <span style={{ fontSize: 14, fontWeight: 400, color: T.secondary, letterSpacing: "-0.01em" }}>{time.includes("–") ? `– ${parts[1]?.trim()}` : time.split(" ").slice(1).join(" ")}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: T.secondary, background: T.wash, padding: "5px 12px", borderRadius: T.rFull }}>{durStr}</span>
    </div>
  );
}

function CarryList({ items }: { items: string[] }) {
  const [ck, setCk] = useState<Record<number, boolean>>({});
  if (!items.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ color: T.tertiary }}>{Icon.bag}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary }}>Carry</span>
      </div>
      {items.map((item, i) => (
        <div key={i} onClick={() => setCk(p => ({ ...p, [i]: !p[i] }))} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", cursor: "pointer", userSelect: "none" }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: ck[i] ? "none" : `1.5px solid ${T.tertiary}`, background: ck[i] ? T.done : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: `all .2s ${T.ease}`, animation: ck[i] ? "checkIn .3s ease" : "none" }}>
            {ck[i] && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 400, color: ck[i] ? T.tertiary : T.text, textDecoration: ck[i] ? "line-through" : "none", transition: `all .2s ${T.ease}` }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function NextPeek({ title, time, slug }: { title: string | null; time: string | null; slug: string | null }) {
  if (!title) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: T.r, background: T.surface, border: `1px solid ${T.border}` }}>
      <Swatch slug={slug || "check-in"} size={44} radius={12} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 2 }}>Up next</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
      </div>
      <span style={{ fontSize: 13, color: T.secondary, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{time}</span>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ position: "relative", height: 2, borderRadius: T.rFull, background: T.sunken }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: T.rFull, background: T.accent, transition: `width .6s ${T.ease}` }} />
      {DAY_MILESTONES.map((mi, i) => (
        <div key={i} style={{ position: "absolute", top: "50%", left: `${(mi / total) * 100}%`, transform: "translate(-50%,-50%)", width: 6, height: 6, borderRadius: "50%", background: current > mi ? T.accent : T.bg, border: current > mi ? "none" : `1.5px solid ${T.sunken}`, transition: `all .35s ${T.ease}` }} />
      ))}
    </div>
  );
}

/* Collapsible Section for Info */
function InfoSection({ icon, label, defaultOpen = false, children, badge }: { icon: React.ReactNode; label: string; defaultOpen?: boolean; children: React.ReactNode; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: T.surface, borderRadius: T.r, border: `1px solid ${T.border}`, marginBottom: 12, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: T.wash, display: "flex", alignItems: "center", justifyContent: "center", color: T.secondary, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", flex: 1 }}>{label}</span>
        {badge && <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, background: T.accentSoft, padding: "3px 10px", borderRadius: T.rFull }}>{badge}</span>}
        <div style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .25s ${T.ease}`, color: T.tertiary }}>{Icon.chevDown}</div>
      </div>
      {open && (
        <div style={{ padding: "0 18px 18px", animation: "slideIn .2s ease both" }}>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* Simple table row */
function Row({ label, value, link, last, note, bold }: { label: string; value: string; link?: boolean; last?: boolean; note?: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: last ? "none" : `1px solid ${T.border}`, fontSize: 14, gap: 12 }}>
      <div style={{ color: T.secondary, flex: 1 }}>
        {label}
        {note && <span style={{ display: "block", fontSize: 11, color: T.tertiary, marginTop: 1 }}>{note}</span>}
      </div>
      {link ? (
        <a href={`tel:${value}`} style={{ color: T.accent, textDecoration: "none", fontWeight: 600, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{value}</a>
      ) : (
        <span style={{ fontWeight: bold ? 700 : 500, fontVariantNumeric: "tabular-nums", flexShrink: 0, color: bold ? T.text : T.text }}>{value}</span>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════
   SCREENS
   ═══════════════════════════════════════ */

function ScreenNow({ card, onDone, onSkip, onImageTap }: { card: V8Card; onDone: () => void; onSkip: () => void; onImageTap: (src: string, label: string) => void }) {
  const [done, setDone] = useState(false);
  const nextSlug = card.nextSlug;

  const handleDone = () => { setDone(true); setTimeout(() => { setDone(false); onDone(); }, 500); };

  return (
    <div key={card.slug} style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="s1" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.accent }}>Day {card.day}</span>
        <span style={{ fontSize: 11, color: T.tertiary, fontWeight: 500 }}>{card.dayLabel}</span>
        <span style={{ fontSize: 11, color: T.tertiary }}>·</span>
        <span style={{ fontSize: 11, color: T.secondary }}>{card.dayTitle}</span>
      </div>
      <div className="s2"><HeroCard slug={card.slug} phase={card.phase} title={card.title} sub={card.sub} onTap={onImageTap} /></div>
      {card.phase && <div className="s3"><PhaseBar currentPhase={card.phase} /></div>}
      <div className={card.phase ? "s4" : "s3"}><TimeDisplay time={card.time} dur={card.dur} /></div>
      {(() => { const ti = TINTS[card.slug as keyof typeof TINTS]; return ti?.maps ? (
        <div className={card.phase ? "s5b" : "s4b"}>
          <a href={ti.maps} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: T.rFull, background: T.accentSoft, border: `1px solid ${T.accentMid}`, color: T.accent, fontSize: 13, fontWeight: 600, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            Open in Maps
          </a>
        </div>
      ) : null; })()}
      {card.carry.length > 0 && <div className={card.phase ? "s6" : "s5"}><CarryList items={card.carry} /></div>}
      <div className={card.phase ? "s6" : "s5"} style={{ display: "flex", gap: 10, marginTop: 2 }}>
        {card.skip && (
          <button className="press" onClick={onSkip} style={{ flex: "0 0 auto", padding: "16px 22px", borderRadius: T.r, border: `1.5px solid ${T.border}`, background: "transparent", color: T.secondary, fontSize: 14, fontWeight: 500, fontFamily: T.sans, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{Icon.skip} Skip</button>
        )}
        <button className="press" onClick={handleDone} style={{ flex: 1, padding: "16px 24px", borderRadius: T.r, border: "none", background: done ? T.done : T.text, color: "white", fontSize: 15, fontWeight: 600, fontFamily: T.sans, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: `background .3s ${T.ease}` }}>
          {done ? <><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Done</> : <>{Icon.check} Mark Complete</>}
        </button>
      </div>
      <div className={card.phase ? "s7" : "s6"}><NextPeek title={card.next} time={card.nextTime} slug={nextSlug} /></div>
    </div>
  );
}


function ScreenPlan({ cards, currentIdx, onImageTap }: { cards: V8Card[]; currentIdx: number; onImageTap: (src: string, label: string) => void }) {
  const [exp, setExp] = useState<string | null>(null);
  const days: [number, string, string][] = [[0, "Feb 28", "Arrival"], [1, "Mar 1", "Core Darshan"], [2, "Mar 2", "Return"]];
  return (
    <div style={{ padding: "0 20px 24px" }}>
      {days.map(([dn, dt, lb]) => {
        const dc = cards.filter(c => c.day === dn);
        const doneCount = dc.filter(c => cards.indexOf(c) < currentIdx).length;
        const total = dc.length;
        return (
          <div key={dn} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.accent }}>Day {dn}</span>
              <span style={{ fontSize: 11, color: T.tertiary, fontWeight: 500 }}>{dt}</span>
              <span style={{ fontSize: 11, color: T.tertiary }}>·</span>
              <span style={{ fontSize: 11, color: T.secondary }}>{lb}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: doneCount === total && doneCount > 0 ? T.done : T.tertiary }}>{doneCount}/{total}</span>
            </div>
            <div style={{ height: 2, borderRadius: T.rFull, background: T.sunken, marginBottom: 20 }}>
              <div style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%`, height: "100%", borderRadius: T.rFull, background: doneCount === total && doneCount > 0 ? T.done : T.accent, transition: `width .4s ${T.ease}` }} />
            </div>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 11, top: 12, bottom: 12, width: 1, background: T.sunken }} />
              {dc.map(card => {
                const gi = cards.indexOf(card), isCurr = gi === currentIdx, isDone = gi < currentIdx, isExp = exp === card.slug;
                return (
                  <div key={card.slug} style={{ position: "relative", marginBottom: 2 }}>
                    <div style={{ position: "absolute", left: -27, top: 20, width: 14, height: 14, borderRadius: "50%", zIndex: 2, background: isDone ? T.done : isCurr ? T.accent : T.bg, border: isDone || isCurr ? "none" : `1.5px solid ${T.sunken}`, display: "flex", alignItems: "center", justifyContent: "center", transition: `all .2s ${T.ease}` }}>
                      {isDone && <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                      {isCurr && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                    </div>
                    {isCurr && <div style={{ position: "absolute", left: -27, top: 20, width: 14, height: 14, borderRadius: "50%", border: `2px solid ${T.accent}`, animation: "softPulse 2s ease-in-out infinite", zIndex: 1 }} />}
                    <div onClick={() => setExp(isExp ? null : card.slug)} style={{ padding: "14px 16px", borderRadius: T.r, cursor: "pointer", background: isCurr ? T.surface : "transparent", border: isCurr ? `1px solid ${T.border}` : "1px solid transparent", boxShadow: isCurr ? T.shadow : "none", transition: `all .25s ${T.ease}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Swatch slug={card.slug} size={40} radius={11} onTap={onImageTap} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: isDone ? 400 : 500, color: isDone ? T.tertiary : T.text, textDecoration: isDone ? "line-through" : "none", marginBottom: 2, lineHeight: 1.3 }}>{card.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, color: T.secondary, fontVariantNumeric: "tabular-nums" }}>{card.time}</span>
                            {card.phase && <span style={{ fontSize: 10, fontWeight: 600, color: T.accent, background: T.accentSoft, padding: "2px 8px", borderRadius: T.rFull }}>Phase {card.phase}/3</span>}
                          </div>
                        </div>
                        <div style={{ transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: `transform .25s ${T.ease}`, color: T.tertiary, flexShrink: 0 }}>{Icon.chevDown}</div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}`, animation: "slideIn .2s ease both" }}>
                          <p style={{ fontSize: 13, color: T.secondary, lineHeight: 1.65, marginBottom: 12 }}>{card.sub}</p>
                          {card.carry.length > 0 && <p style={{ marginTop: 10, fontSize: 13, color: T.secondary }}><b style={{ fontWeight: 600 }}>Carry:</b> {card.carry.join(" · ")}</p>}
                          {(() => { const ti = TINTS[card.slug as keyof typeof TINTS]; return ti?.maps ? (
                            <a href={ti.maps} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "7px 14px", borderRadius: T.rFull, background: T.accentSoft, border: `1px solid ${T.accentMid}`, color: T.accent, fontSize: 12, fontWeight: 600, textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
                              Open in Maps
                            </a>
                          ) : null; })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function ScreenInfo({ packing }: { packing: { isChecked: (k: string, i: number) => boolean; toggle: (k: string, i: number) => void } }) {
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <p className="s1" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 16 }}>Reference</p>

      {/* ─── CASH BUDGET ─── */}
      <div className="s2">
        <InfoSection icon={Icon.rupee} label="Cash Budget" badge={fmt(BUDGET_GRAND)} defaultOpen>
          {/* Summary card */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, background: T.accentSoft, borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: T.accent, marginBottom: 4 }}>Total Trip</p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: T.accent }}>{fmt(BUDGET_GRAND)}</p>
            </div>
            <div style={{ flex: 1, background: T.doneSoft, borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: T.done, marginBottom: 4 }}>Cash to Carry</p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: T.done }}>{fmt(CASH_CARRY)}</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: T.secondary, marginBottom: 16, lineHeight: 1.6 }}>
            Fuel & tolls via FASTag + UPI. Cash needed for temple counters, Dhanushkodi jeep & small vendors.
          </p>

          {/* Category: Temple & Entry */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>Temple & Entry</p>
          {BUDGET.temple.map((b, i) => <Row key={i} label={b.item} value={fmt(b.total)} note={(b as any).note} last={i === BUDGET.temple.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.temple)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>Transport</p>
          {BUDGET.transport.map((b, i) => <Row key={i} label={b.item} value={fmt(b.total)} note={b.note} last={i === BUDGET.transport.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.transport)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>Food</p>
          {BUDGET.food.map((b, i) => <Row key={i} label={b.item} value={fmt(b.total)} last={i === BUDGET.food.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.food)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>Miscellaneous</p>
          {BUDGET.misc.map((b, i) => <Row key={i} label={b.item} value={fmt(b.total)} last={i === BUDGET.misc.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.misc)} bold last />
        </InfoSection>
      </div>

      {/* ─── PACKING LISTS ─── */}
      <div className="s3">
        <InfoSection icon={Icon.suitcase} label="Packing Lists" badge="5 lists">
          {Object.entries(PACKING).map(([key, person], pi) => (
            <div key={key} style={{ marginBottom: pi < Object.keys(PACKING).length - 1 ? 20 : 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{person.label}</span>
                {person.sub && <span style={{ fontSize: 11, color: T.tertiary }}>{person.sub}</span>}
              </div>
              <PackingChecklist items={person.items} storageKey={key} packing={packing} />
            </div>
          ))}
        </InfoSection>
      </div>

      {/* ─── HOTEL ─── */}
      <div className="s5">
        <InfoSection icon={Icon.hotel} label="Hotel">
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>{INFO.hotel.name}</p>
          <p style={{ fontSize: 13, color: T.secondary, marginBottom: 14 }}>{INFO.hotel.addr}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`tel:${INFO.hotel.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: T.rFull, background: T.accentSoft, color: T.accent, textDecoration: "none", fontSize: 14, fontWeight: 600, border: `1px solid ${T.accentMid}` }}>{Icon.phone} {INFO.hotel.phone}</a>
            <a href={TINTS["check-in"].maps} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: T.rFull, background: T.accentSoft, color: T.accent, textDecoration: "none", fontSize: 14, fontWeight: 600, border: `1px solid ${T.accentMid}` }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              Maps
            </a>
          </div>
          <div style={{ fontSize: 13, color: T.secondary, display: "flex", gap: 20, marginTop: 14 }}>
            <span>In: <b style={{ color: T.text, fontWeight: 600 }}>{INFO.hotel.cin}</b></span>
            <span>Out: <b style={{ color: T.text, fontWeight: 600 }}>{INFO.hotel.cout}</b></span>
          </div>
          <p style={{ fontSize: 13, color: T.secondary, marginTop: 6 }}>{INFO.hotel.dist} · {INFO.hotel.parking}</p>
        </InfoSection>
      </div>

      {/* ─── TIMINGS ─── */}
      <div className="s6">
        <InfoSection icon={Icon.clock} label="Temple Timings">
          {INFO.timings.map((t, i) => <Row key={i} label={t.k} value={t.v} last={i === INFO.timings.length - 1} />)}
        </InfoSection>
      </div>

      {/* ─── DRESS CODE ─── */}
      <div className="s7">
        <InfoSection icon={Icon.bag} label="Dress Code">
          {INFO.dress.map((d, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 2, color: d.em ? T.accent : T.text, fontWeight: d.em ? 600 : 400 }}>{d.t}</p>
          ))}
        </InfoSection>
      </div>

      {/* ─── EMERGENCY ─── */}
      <div className="s8">
        <InfoSection icon={Icon.phone} label="Emergency">
          {INFO.sos.map((s, i) => <Row key={i} label={s.k} value={s.v} link last={i === INFO.sos.length - 1} />)}
        </InfoSection>
      </div>
    </div>
  );
}

/* Interactive packing checklist — persisted via Supabase */
function PackingChecklist({ items, storageKey, packing }: { items: string[]; storageKey: string; packing: { isChecked: (k: string, i: number) => boolean; toggle: (k: string, i: number) => void } }) {
  const done = items.filter((_, i) => packing.isChecked(storageKey, i)).length;
  return (
    <div style={{ background: T.wash, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.secondary }}>{done}/{items.length} packed</span>
        <div style={{ height: 3, flex: 1, marginLeft: 12, marginTop: 5, borderRadius: T.rFull, background: T.sunken }}>
          <div style={{ width: `${items.length > 0 ? (done / items.length) * 100 : 0}%`, height: "100%", borderRadius: T.rFull, background: done === items.length ? T.done : T.accent, transition: `width .3s ${T.ease}` }} />
        </div>
      </div>
      {items.map((item, i) => {
        const checked = packing.isChecked(storageKey, i);
        return (
          <div key={i} onClick={() => packing.toggle(storageKey, i)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, border: checked ? "none" : `1.5px solid ${T.tertiary}`, background: checked ? T.done : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: `all .15s ${T.ease}` }}>
              {checked && <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
            </div>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: checked ? T.tertiary : T.text, textDecoration: checked ? "line-through" : "none", transition: `all .15s ${T.ease}` }}>{item}</span>
          </div>
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════
   APP
   ═══════════════════════════════════════ */

export default function App() {
  const { steps, loading, refresh } = useSteps();
  const { t, lang, toggleLang } = useLanguage();
  const packing = usePacking();
  const [tab, setTab] = useState("now");
  const [morphKey, setMorphKey] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => { refresh(); packing.refresh(); }, [refresh, packing.refresh]);

  const cards = useMemo(() => LIB_CARDS.map(c => toV8Card(c, t)), [t]);

  const idx = useMemo(() => {
    if (!steps.length) return 0;
    const active = steps.find(s => s.state.status === "active");
    if (active) {
      const i = LIB_CARDS.findIndex(c => c.slug === active.state.slug);
      return i >= 0 ? i : 0;
    }
    const upcoming = steps.find(s => s.state.status === "upcoming");
    if (upcoming) {
      const i = LIB_CARDS.findIndex(c => c.slug === upcoming.state.slug);
      return i >= 0 ? i : 0;
    }
    return LIB_CARDS.length;
  }, [steps]);

  const allDone = idx >= cards.length;
  const card = allDone ? cards[cards.length - 1] : cards[idx];

  const advance = useCallback(async (status: "done" | "skipped") => {
    const activeStep = steps.find(s => s.state.status === "active");
    if (!activeStep) return;
    try {
      await fetch(`/api/steps/${activeStep.state.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setMorphKey(k => k + 1);
      await refresh();
    } catch (err) {
      console.error("Failed to advance step:", err);
    }
  }, [steps, refresh]);

  const tabs = [
    { id: "now", label: "Now", icon: Icon.pin },
    { id: "plan", label: "Plan", icon: Icon.list },
    { id: "info", label: "Info", icon: Icon.info },
    { id: "route", label: "Route", icon: Icon.car },
  ];
  const activeIdx = tabs.findIndex(t => t.id === tab);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: T.sans }}>
      <style>{CSS}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: T.bg,
        padding: "20px 24px 24px",
      }}>
        {/* Top row: brand + utilities */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              overflow: "hidden", flexShrink: 0,
              background: T.wash,
            }}>
              <img src="/icon-192.png" alt="" width={36} height={36} style={{ objectFit: "cover" }} />
            </div>
            <span style={{
              fontSize: 15, fontWeight: 600, color: T.text,
              letterSpacing: "-0.01em", fontFamily: T.sans,
            }}>
              Rameshwaram Yatra
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: "none", background: T.wash,
                color: T.secondary, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: T.sans,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {lang === "en" ? "हि" : "EN"}
            </button>
            {tab === "route" ? (
              <div style={{
                fontSize: 11, fontWeight: 600, color: T.accent,
                fontFamily: T.mono, fontVariantNumeric: "tabular-nums",
                padding: "8px 12px", borderRadius: 10,
                background: T.accentSoft,
              }}>
                552 km · ~10 hrs
              </div>
            ) : (
              <div style={{
                fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                color: allDone ? T.done : T.tertiary,
                padding: "8px 12px", borderRadius: 10,
                background: allDone ? T.doneSoft : T.wash,
              }}>
                {allDone ? "Done" : `${idx + 1}/${cards.length}`}
              </div>
            )}
          </div>
        </div>
        {/* Section title — hero */}
        <h1 style={{
          fontSize: 32, fontWeight: 700, color: T.text,
          letterSpacing: "-0.04em", lineHeight: 1.1,
          margin: 0, fontFamily: T.sans,
        }}>
          {tab === "now" ? "Now" : tab === "plan" ? "Plan" : tab === "info" ? "Info" : "Car & Route"}
        </h1>
      </header>

      {loading && !steps.length ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
          <span style={{ fontSize: 13, color: T.tertiary }}>Loading...</span>
        </div>
      ) : (
        <div key={`${tab}-${morphKey}`} style={{ paddingBottom: 100 }}>
          {tab === "now" && !allDone && <ScreenNow card={card} onDone={() => advance("done")} onSkip={() => advance("skipped")} onImageTap={(src, label) => setLightbox({ src, label })} />}
          {tab === "now" && allDone && (
            <div style={{ padding: "60px 20px", textAlign: "center" as const }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Yatra Complete</h2>
              <p style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6 }}>All steps done. Har Har Mahadev!</p>
            </div>
          )}
          {tab === "plan" && <ScreenPlan cards={cards} currentIdx={idx} onImageTap={(src, label) => setLightbox({ src, label })} />}
          {tab === "info" && <ScreenInfo packing={packing} />}
          {tab === "route" && <CarRoutePage />}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && <ImageLightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />}

      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, zIndex: 20,
        background: T.bg,
        borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 max(14px, env(safe-area-inset-bottom))",
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "8px 4px", border: "none", background: "transparent",
                cursor: "pointer", minWidth: 0,
                color: active ? T.accent : T.tertiary,
                transition: `color .2s ${T.ease}`,
              }}
            >
              <div style={{ opacity: active ? 1 : 0.6 }}>{t.icon}</div>
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 500 }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ─── ImageLightbox ─── */
function ImageLightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        animation: "lbFadeIn 0.2s ease both",
        cursor: "pointer", padding: 24,
      }}
    >
      <div style={{
        position: "absolute", top: 16, right: 20,
        width: 32, height: 32, borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 380, width: "100%", borderRadius: 16, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          animation: "lbScaleIn 0.25s ease both",
        }}
      >
        <img src={src} alt={label} style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "cover" }} />
      </div>
      <div style={{
        marginTop: 16, fontSize: 14, fontWeight: 600,
        color: "rgba(255,255,255,0.8)", fontFamily: T.sans,
        letterSpacing: "-0.01em", textAlign: "center",
        animation: "lbScaleIn 0.25s ease 0.05s both",
      }}>{label}</div>
    </div>
  );
}
