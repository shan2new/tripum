"use client";

import { useState } from "react";
import { useTripData } from "@/hooks/use-trip-data";
import { T, TINTS, CSS } from "@/lib/design-tokens";

/* ─── Icons ─── */
const Icon = {
  chevDown: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>,
  clock: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>,
  phone: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>,
  bag: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>,
  rupee: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 0a3 3 0 0 1-3 3m3-3V6H9v2.25m0 0a3 3 0 0 0 3 3m-3-3h6m-3 3v5.25m0 0-3 3m3-3 3 3"/></svg>,
  suitcase: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>,
  hotel: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M15.75 21H8.25m6.75-18.545c-.75-.11-1.51-.17-2.25-.195m-2.25.195c-.75.025-1.5.085-2.25.195M15.75 3.545v3.06a3.75 3.75 0 0 1-7.5 0v-3.06"/></svg>,
};

/* ─── Info Data ─── */
const INFO = {
  hotel:{ name:"Daiwik Hotels", addr:"1/28A, Sethupathi St, Rameshwaram, TN 623526", phone:"+91 4573 221 777", cin:"2:00 PM", cout:"12:00 PM", dist:"2.5 km from temple", parking:"Free parking at hotel" },
  timings:[{k:"Morning Darshan",v:"4:00 AM – 1:00 PM"},{k:"Temple Closed",v:"1:00 – 3:00 PM"},{k:"Evening Darshan",v:"3:00 – 8:00 PM"},{k:"Spatika Lingam",v:"5:00 – 6:00 AM only"}],
  dress:[{t:"Men — Dhoti/pyjama + kurta",em:false},{t:"Women — Saree/churidar + dupatta",em:false},{t:"No western wear or leather inside temple",em:true},{t:"Wet clothes not allowed in main sanctum",em:true}],
  sos:[{k:"Hotel Front Desk",v:"+91 4573 221 777"},{k:"Rameshwaram Police",v:"04573-221 210"},{k:"Govt Hospital",v:"04573-221 223"}],
};

/* ─── Budget Data ─── */
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
const CASH_CARRY = 5000;

/* ─── Packing Lists ─── */
const PACKING = {
  shantanu: {
    label: "Shantanu", sub: "Driver + CPAP",
    items: ["CPAP machine + power adapter + extension cord","Driving license, RC, insurance printout","FASTag — check balance (₹2,000+)","Phone mount + car charger (USB-C)","2 sets dhoti/kurta (temple)","1 set clothes for sea bath (will get soaked)","1 spare casual set","Towel","Waterproof pouch (phone + keys)","Wallet — ₹5,000 cash + cards","Sunglasses","Medications (if any)","Slip-on footwear (temple)"],
  },
  parents: {
    label: "Parents", sub: "Comfort priority",
    items: ["Comfortable walking shoes (long temple corridors)","2 sets traditional clothes (temple — dhoti/saree)","1 set clothes for sea bath","1 spare comfortable set","Towels","All regular medications","Reading glasses","Light shawl / jacket (5 AM temple visit)","Slip-on footwear (temple)","Small pillow / neck rest (10 hr drive)","Water bottle each"],
  },
  shruti: {
    label: "Shruti", sub: "",
    items: ["2 sets churidar / saree (temple)","1 set clothes for sea bath","1 spare casual set","Dupatta (temple requirement for women)","Towel","Sunscreen","Slip-on footwear (temple)","Medications (if any)"],
  },
  car: {
    label: "Car & Shared", sub: "MG Hector",
    items: ["Water bottles × 8","Snack box (drive + temple breaks)","First aid kit","Umbrella × 2 (sun protection)","Plastic bags × 6 (for wet clothes)","Car documents folder (RC, insurance)","Tissue / wet wipes","Garbage bags","Phone charging cables × 2","Torch / phone flashlight (5 AM temple)"],
  },
  petcare: {
    label: "Pre-departure", sub: "Chiku & Oreo",
    items: ["Confirm pet boarding / sitter","Drop off pets before departure","Share vet contact with sitter","Print feeding schedule + medication (if any)","Pack enough pet food for 3 days","Share your contact + Surabhi as backup"],
  },
};

/* ─── Components ─── */
function InfoSection({ icon, label, defaultOpen = false, children, badge }: { icon: React.ReactNode; label: string; defaultOpen?: boolean; children: React.ReactNode; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: T.surface, borderRadius: T.r, border: `0.5px solid ${T.border}`, marginBottom: 12, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(120,120,128,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: T.secondary, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em", flex: 1 }}>{label}</span>
        {badge && <span style={{ fontSize: 12, fontWeight: 500, color: T.accent, background: T.accentSoft, padding: "3px 10px", borderRadius: T.rFull }}>{badge}</span>}
        <div style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: `transform .2s ${T.ease}`, color: T.tertiary }}>{Icon.chevDown}</div>
      </div>
      {open && (
        <div style={{ padding: "0 18px 18px", animation: "slideIn .2s ease both" }}>
          <div style={{ borderTop: `0.5px solid ${T.border}`, paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

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
        <span style={{ fontWeight: bold ? 700 : 500, fontVariantNumeric: "tabular-nums", flexShrink: 0, color: T.text }}>{value}</span>
      )}
    </div>
  );
}

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

/* ─── Page ─── */
export default function InfoPage() {
  const { packing, loading } = useTripData();
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <span style={{ fontSize: 13, color: T.tertiary }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <style>{CSS}</style>
      <p className="s1" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: T.tertiary, marginBottom: 16 }}>Reference</p>

      {/* ─── CASH BUDGET ─── */}
      <div className="s2">
        <InfoSection icon={Icon.rupee} label="Cash Budget" badge={fmt(BUDGET_GRAND)} defaultOpen>
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

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>Temple & Entry</p>
          {BUDGET.temple.map((b, i) => <Row key={i} label={b.item} value={fmt(b.total)} note={(b as Record<string, unknown>).note as string | undefined} last={i === BUDGET.temple.length - 1} />)}
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
