"use client";

import { useState } from "react";
import { useTripData } from "@/hooks/use-trip-data";
import { useLanguage } from "@/hooks/use-language";
import { T, TINTS, CSS } from "@/lib/design-tokens";
import { INFO_STRINGS, INFO_DATA, PACKING_DATA, BUDGET_DATA, SECTION, STATUS, ACTION } from "@/lib/strings";
import type { BilingualText } from "@/lib/types";

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

/* ─── Hotel Data (non-translatable specifics) ─── */
const HOTEL = { name: "Daiwik Hotels", addr: "1/28A, Sethupathi St, Rameshwaram, TN 623526", phone: "+91 4573 221 777", cin: "2:00 PM", cout: "12:00 PM", dist: { en: "2.5 km from temple", hi: "मंदिर से 2.5 किमी" } as BilingualText, parking: { en: "Free parking at hotel", hi: "होटल में मुफ़्त पार्किंग" } as BilingualText };

/* ─── Budget Totals ─── */
const BUDGET_TOTALS = {
  temple: BUDGET_DATA.temple.reduce((s, i) => s + i.total, 0),
  transport: BUDGET_DATA.transport.reduce((s, i) => s + i.total, 0),
  food: BUDGET_DATA.food.reduce((s, i) => s + i.total, 0),
  misc: BUDGET_DATA.misc.reduce((s, i) => s + i.total, 0),
};
const BUDGET_GRAND = Object.values(BUDGET_TOTALS).reduce((s, v) => s + v, 0);
const CASH_CARRY = 5000;

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

function PackingChecklist({ items, storageKey, packing, packedLabel }: { items: BilingualText[]; storageKey: string; packing: { isChecked: (k: string, i: number) => boolean; toggle: (k: string, i: number) => void }; packedLabel: string }) {
  const { t } = useLanguage();
  const done = items.filter((_, i) => packing.isChecked(storageKey, i)).length;
  return (
    <div style={{ background: T.wash, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.secondary }}>{packedLabel}</span>
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
            <span style={{ fontSize: 13, lineHeight: 1.5, color: checked ? T.tertiary : T.text, textDecoration: checked ? "line-through" : "none", transition: `all .15s ${T.ease}` }}>{t(item)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Page ─── */
export default function InfoPage() {
  const { packing, loading } = useTripData();
  const { t } = useLanguage();
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <span style={{ fontSize: 13, color: T.tertiary }}>{t(STATUS.loading)}</span>
      </div>
    );
  }

  const tBi = (bi: BilingualText | string) => typeof bi === "string" ? bi : t(bi);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <style>{CSS}</style>
      <p className="s1" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.02em", color: T.tertiary, marginBottom: 16 }}>{t(SECTION.reference)}</p>

      {/* ─── CASH BUDGET ─── */}
      <div className="s2">
        <InfoSection icon={Icon.rupee} label={t(INFO_STRINGS.cashBudget)} badge={fmt(BUDGET_GRAND)} defaultOpen>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, background: T.accentSoft, borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: T.accent, marginBottom: 4 }}>{t(INFO_STRINGS.totalTrip)}</p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: T.accent }}>{fmt(BUDGET_GRAND)}</p>
            </div>
            <div style={{ flex: 1, background: T.doneSoft, borderRadius: 12, padding: "14px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: T.done, marginBottom: 4 }}>{t(INFO_STRINGS.cashToCarry)}</p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: T.done }}>{fmt(CASH_CARRY)}</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: T.secondary, marginBottom: 16, lineHeight: 1.6 }}>
            {t(INFO_STRINGS.budgetNote)}
          </p>

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>{t(INFO_STRINGS.templeEntry)}</p>
          {BUDGET_DATA.temple.map((b, i) => <Row key={i} label={t(b.item)} value={fmt(b.total)} note={(b as { note?: BilingualText }).note ? tBi((b as { note: BilingualText }).note) : undefined} last={i === BUDGET_DATA.temple.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.temple)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>{t(INFO_STRINGS.transport)}</p>
          {BUDGET_DATA.transport.map((b, i) => <Row key={i} label={t(b.item)} value={fmt(b.total)} note={b.note ? tBi(b.note) : undefined} last={i === BUDGET_DATA.transport.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.transport)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>{t(INFO_STRINGS.food)}</p>
          {BUDGET_DATA.food.map((b, i) => <Row key={i} label={t(b.item)} value={fmt(b.total)} last={i === BUDGET_DATA.food.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.food)} bold last />
          <div style={{ height: 1, background: T.border, margin: "8px 0 12px" }} />

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.tertiary, marginBottom: 6 }}>{t(INFO_STRINGS.miscellaneous)}</p>
          {BUDGET_DATA.misc.map((b, i) => <Row key={i} label={t(b.item)} value={fmt(b.total)} last={i === BUDGET_DATA.misc.length - 1} />)}
          <Row label="" value={fmt(BUDGET_TOTALS.misc)} bold last />
        </InfoSection>
      </div>

      {/* ─── PACKING LISTS ─── */}
      <div className="s3">
        <InfoSection icon={Icon.suitcase} label={t(INFO_STRINGS.packingLists)} badge={t(INFO_STRINGS.listsCount)}>
          {Object.entries(PACKING_DATA).map(([key, person], pi) => {
            const packedLabel = t(INFO_STRINGS.packed(
              person.items.filter((_, i) => packing.isChecked(key, i)).length,
              person.items.length
            ));
            return (
              <div key={key} style={{ marginBottom: pi < Object.keys(PACKING_DATA).length - 1 ? 20 : 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t(person.label)}</span>
                  {person.sub && <span style={{ fontSize: 11, color: T.tertiary }}>{t(person.sub)}</span>}
                </div>
                <PackingChecklist items={person.items} storageKey={key} packing={packing} packedLabel={packedLabel} />
              </div>
            );
          })}
        </InfoSection>
      </div>

      {/* ─── HOTEL ─── */}
      <div className="s5">
        <InfoSection icon={Icon.hotel} label={t(INFO_STRINGS.hotel)}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>{HOTEL.name}</p>
          <p style={{ fontSize: 13, color: T.secondary, marginBottom: 14 }}>{HOTEL.addr}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`tel:${HOTEL.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: T.rFull, background: T.accentSoft, color: T.accent, textDecoration: "none", fontSize: 14, fontWeight: 600, border: `1px solid ${T.accentMid}` }}>{Icon.phone} {HOTEL.phone}</a>
            <a href={TINTS["check-in"].maps} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: T.rFull, background: T.accentSoft, color: T.accent, textDecoration: "none", fontSize: 14, fontWeight: 600, border: `1px solid ${T.accentMid}` }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
              {t(ACTION.openInMaps)}
            </a>
          </div>
          <div style={{ fontSize: 13, color: T.secondary, display: "flex", gap: 20, marginTop: 14 }}>
            <span>{t(INFO_DATA.hotel.checkIn)}: <b style={{ color: T.text, fontWeight: 600 }}>{HOTEL.cin}</b></span>
            <span>{t(INFO_DATA.hotel.checkOut)}: <b style={{ color: T.text, fontWeight: 600 }}>{HOTEL.cout}</b></span>
          </div>
          <p style={{ fontSize: 13, color: T.secondary, marginTop: 6 }}>{t(HOTEL.dist)} · {t(HOTEL.parking)}</p>
        </InfoSection>
      </div>

      {/* ─── TIMINGS ─── */}
      <div className="s6">
        <InfoSection icon={Icon.clock} label={t(INFO_STRINGS.templeTimings)}>
          {INFO_DATA.timings.map((timing, i) => <Row key={i} label={t(timing.k)} value={timing.v} last={i === INFO_DATA.timings.length - 1} />)}
        </InfoSection>
      </div>

      {/* ─── DRESS CODE ─── */}
      <div className="s7">
        <InfoSection icon={Icon.bag} label={t(INFO_STRINGS.dressCode)}>
          {INFO_DATA.dress.map((d, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 2, color: d.em ? T.accent : T.text, fontWeight: d.em ? 600 : 400 }}>{t(d.t)}</p>
          ))}
        </InfoSection>
      </div>

      {/* ─── EMERGENCY ─── */}
      <div className="s8">
        <InfoSection icon={Icon.phone} label={t(INFO_STRINGS.emergency)}>
          {INFO_DATA.sos.map((s, i) => <Row key={i} label={t(s.k)} value={s.v} link last={i === INFO_DATA.sos.length - 1} />)}
        </InfoSection>
      </div>
    </div>
  );
}
