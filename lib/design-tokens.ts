/* ─── Shared Design Tokens ─── */
export const T = {
  bg:        "#FAF9F6",
  surface:   "#FFFFFF",
  wash:      "#F5F5F3",
  sunken:    "#E8E6E1",
  text:      "#1D1D1F",
  secondary: "#6E6E73",
  tertiary:  "#AEAEB2",
  accent:    "#9B6B2C",
  accentHover:"#7D5522",
  accentSoft:"rgba(155,107,44,0.07)",
  accentMid: "rgba(155,107,44,0.14)",
  done:      "#34C759",
  doneSoft:  "rgba(52,199,89,0.08)",
  blue:      "#007AFF",
  blueSoft:  "rgba(0,122,255,0.08)",
  border:    "rgba(60,60,67,0.06)",
  shadow:    "0 0.5px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)",
  shadowMd:  "0 2px 12px rgba(0,0,0,0.06)",
  shadowLg:  "0 4px 24px rgba(0,0,0,0.08)",
  sans:      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Instrument Sans', system-ui, sans-serif",
  mono:      "'SF Mono', 'DM Mono', ui-monospace, monospace",
  r:         "12px",
  rLg:       "16px",
  rFull:     "999px",
  ease:      "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeOut:   "cubic-bezier(0.16, 1, 0.3, 1)",
};

/* ─── Per-card tints ─── */
export const TINTS = {
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

export const PHASE_STEPS = [
  { en: "Sea Bath", hi: "समुद्र स्नान" },
  { en: "22 Wells", hi: "22 कुंड" },
  { en: "Ramalingum & Vishwalingum", hi: "रामलिंगम और विश्वलिंगम" },
];
export const DAY_MILESTONES = [0, 2, 10];

/* ─── Global CSS ─── */
export const CSS = `
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
