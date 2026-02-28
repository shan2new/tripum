import { BilingualText } from "./types";

/**
 * Centralized UI strings for the app.
 * All user-facing text should be bilingual (English + Hindi).
 */

/* ─── Navigation ─── */
export const NAV = {
  now: { en: "Now", hi: "अभी" } as BilingualText,
  plan: { en: "Plan", hi: "योजना" } as BilingualText,
  info: { en: "Info", hi: "जानकारी" } as BilingualText,
};

/* ─── Day Titles (contextual for a pilgrimage trip) ─── */
export const DAY_TITLES: Record<number, BilingualText> = {
  0: { en: "Arrival Day", hi: "पहुँचने का दिन" },
  1: { en: "Core Darshan Day", hi: "मुख्य दर्शन दिवस" },
  2: { en: "Buffer & Return", hi: "अतिरिक्त समय व वापसी" },
};

/* ─── Section Headers ─── */
export const SECTION = {
  carry: { en: "Carry", hi: "साथ ले जाएँ" } as BilingualText,
  insiderTip: { en: "Insider Tip", hi: "ख़ास सुझाव" } as BilingualText,
  upNext: { en: "Up next", hi: "अगला पड़ाव" } as BilingualText,
  reference: { en: "Reference", hi: "संदर्भ" } as BilingualText,
};

/* ─── Action Buttons ─── */
export const ACTION = {
  markDone: { en: "Mark Done", hi: "पूरा हुआ" } as BilingualText,
  markComplete: { en: "Mark Complete", hi: "पूरा हुआ" } as BilingualText,
  done: { en: "Done!", hi: "हो गया!" } as BilingualText,
  updating: { en: "Updating...", hi: "अपडेट हो रहा..." } as BilingualText,
  skip: { en: "Skip", hi: "छोड़ें" } as BilingualText,
  skipSubtext: { en: "Not this time", hi: "अभी नहीं" } as BilingualText,
  cancel: { en: "Cancel", hi: "रहने दें" } as BilingualText,
  skipping: { en: "Skipping...", hi: "छोड़ रहे हैं..." } as BilingualText,
  openInMaps: { en: "Open in Maps", hi: "नक़्शे में खोलें" } as BilingualText,
};

/* ─── Skip Dialog ─── */
export const SKIP_DIALOG = {
  title: (stepName: string) => ({
    en: `Skip ${stepName}?`,
    hi: `${stepName} छोड़ें?`,
  }) as BilingualText,
};

/* ─── Loading & Status ─── */
export const STATUS = {
  loading: { en: "Loading...", hi: "लोड हो रहा..." } as BilingualText,
  yatraComplete: { en: "Yatra Complete", hi: "यात्रा पूर्ण" } as BilingualText,
  yatraCompleteMsg: { en: "All steps done. Har Har Mahadev!", hi: "सभी पड़ाव पूरे हुए। हर हर महादेव!" } as BilingualText,
};

/* ─── Phase Steps (Darshan sequence) ─── */
export const PHASE_LABELS: BilingualText[] = [
  { en: "Sea Bath", hi: "समुद्र स्नान" },
  { en: "22 Wells", hi: "22 कुंड" },
  { en: "Jyotirlinga", hi: "ज्योतिर्लिंग" },
];

/* ─── Plan Page ─── */
export const PLAN = {
  dayLabels: [
    { date: "Feb 28", label: { en: "Arrival", hi: "आगमन" } },
    { date: "Mar 1", label: { en: "Core Darshan", hi: "मुख्य दर्शन" } },
    { date: "Mar 2", label: { en: "Return", hi: "वापसी" } },
  ] as { date: string; label: BilingualText }[],
};

/* ─── Info Page ─── */
export const INFO_STRINGS = {
  cashBudget: { en: "Cash Budget", hi: "नक़द बजट" } as BilingualText,
  totalTrip: { en: "Total Trip", hi: "कुल यात्रा ख़र्च" } as BilingualText,
  cashToCarry: { en: "Cash to Carry", hi: "साथ रखें नक़द" } as BilingualText,
  budgetNote: {
    en: "Fuel & tolls via FASTag + UPI. Cash needed for temple counters, Dhanushkodi jeep & small vendors.",
    hi: "ईंधन व टोल FASTag + UPI से। नक़दी मंदिर काउंटर, धनुषकोडी जीप व छोटे दुकानदारों के लिए।",
  } as BilingualText,
  templeEntry: { en: "Temple & Entry", hi: "मंदिर व प्रवेश" } as BilingualText,
  transport: { en: "Transport", hi: "यातायात" } as BilingualText,
  food: { en: "Food", hi: "खाना" } as BilingualText,
  miscellaneous: { en: "Miscellaneous", hi: "विविध" } as BilingualText,
  packingLists: { en: "Packing Lists", hi: "सामान की सूची" } as BilingualText,
  listsCount: { en: "5 lists", hi: "5 सूचियाँ" } as BilingualText,
  hotel: { en: "Hotel", hi: "होटल" } as BilingualText,
  templeTimings: { en: "Temple Timings", hi: "मंदिर का समय" } as BilingualText,
  dressCode: { en: "Dress Code", hi: "पहनावा नियम" } as BilingualText,
  emergency: { en: "Emergency", hi: "आपातकाल" } as BilingualText,
  packed: (done: number, total: number) => ({
    en: `${done}/${total} packed`,
    hi: `${done}/${total} पैक`,
  }) as BilingualText,
};

/* ─── Info Page Data ─── */
export const INFO_DATA = {
  timings: [
    { k: { en: "Morning Darshan", hi: "सुबह दर्शन" } as BilingualText, v: "4:00 AM – 1:00 PM" },
    { k: { en: "Temple Closed", hi: "मंदिर बंद" } as BilingualText, v: "1:00 – 3:00 PM" },
    { k: { en: "Evening Darshan", hi: "शाम दर्शन" } as BilingualText, v: "3:00 – 8:00 PM" },
    { k: { en: "Spatika Lingam", hi: "स्फटिक लिंगम" } as BilingualText, v: "5:00 – 6:00 AM only" },
  ],
  dress: [
    { t: { en: "Men — Dhoti/pyjama + kurta", hi: "पुरुष — धोती/पजामा + कुर्ता" } as BilingualText, em: false },
    { t: { en: "Women — Saree/churidar + dupatta", hi: "महिलाएँ — साड़ी/चूड़ीदार + दुपट्टा" } as BilingualText, em: false },
    { t: { en: "No western wear or leather inside temple", hi: "मंदिर में पश्चिमी कपड़े या चमड़ा वर्जित" } as BilingualText, em: true },
    { t: { en: "Wet clothes not allowed in main sanctum", hi: "गर्भगृह में गीले कपड़ों में प्रवेश वर्जित" } as BilingualText, em: true },
  ],
  sos: [
    { k: { en: "Hotel Front Desk", hi: "होटल फ्रंट डेस्क" } as BilingualText, v: "+91 4573 221 777" },
    { k: { en: "Rameshwaram Police", hi: "रामेश्वरम पुलिस" } as BilingualText, v: "04573-221 210" },
    { k: { en: "Govt Hospital", hi: "सरकारी अस्पताल" } as BilingualText, v: "04573-221 223" },
  ],
  hotel: {
    checkIn: { en: "In", hi: "चेक-इन" } as BilingualText,
    checkOut: { en: "Out", hi: "चेक-आउट" } as BilingualText,
  },
};

/* ─── Packing Lists ─── */
export const PACKING_DATA = {
  shantanu: {
    label: { en: "Shantanu", hi: "शांतनु" } as BilingualText,
    sub: { en: "Driver + CPAP", hi: "ड्राइवर + CPAP" } as BilingualText,
    items: [
      { en: "CPAP machine + power adapter + extension cord", hi: "CPAP मशीन + पावर एडाप्टर + एक्सटेंशन कॉर्ड" },
      { en: "Driving license, RC, insurance printout", hi: "ड्राइविंग लाइसेंस, RC, बीमा प्रिंटआउट" },
      { en: "FASTag — check balance (₹2,000+)", hi: "FASTag — बैलेंस चेक करें (₹2,000+)" },
      { en: "Phone mount + car charger (USB-C)", hi: "फ़ोन माउंट + कार चार्जर (USB-C)" },
      { en: "2 sets dhoti/kurta (temple)", hi: "2 जोड़ी धोती/कुर्ता (मंदिर के लिए)" },
      { en: "1 set clothes for sea bath (will get soaked)", hi: "1 जोड़ी समुद्र स्नान के कपड़े (पूरे भीगेंगे)" },
      { en: "1 spare casual set", hi: "1 अतिरिक्त जोड़ी आरामदायक कपड़े" },
      { en: "Towel", hi: "तौलिया" },
      { en: "Waterproof pouch (phone + keys)", hi: "वॉटरप्रूफ़ पाउच (फ़ोन + चाबी)" },
      { en: "Wallet — ₹5,000 cash + cards", hi: "बटुआ — ₹5,000 नक़द + कार्ड" },
      { en: "Sunglasses", hi: "धूप का चश्मा" },
      { en: "Medications (if any)", hi: "दवाइयाँ (अगर कोई हों)" },
      { en: "Slip-on footwear (temple)", hi: "स्लिप-ऑन चप्पल (मंदिर के लिए)" },
    ] as BilingualText[],
  },
  parents: {
    label: { en: "Parents", hi: "माता-पिता" } as BilingualText,
    sub: { en: "Comfort priority", hi: "आराम ज़रूरी" } as BilingualText,
    items: [
      { en: "Comfortable walking shoes (long temple corridors)", hi: "आरामदायक जूते (लंबे मंदिर गलियारे)" },
      { en: "2 sets traditional clothes (temple — dhoti/saree)", hi: "2 जोड़ी पारंपरिक कपड़े (मंदिर — धोती/साड़ी)" },
      { en: "1 set clothes for sea bath", hi: "1 जोड़ी समुद्र स्नान के कपड़े" },
      { en: "1 spare comfortable set", hi: "1 अतिरिक्त आरामदायक जोड़ी" },
      { en: "Towels", hi: "तौलिए" },
      { en: "All regular medications", hi: "रोज़ की सभी दवाइयाँ" },
      { en: "Reading glasses", hi: "पढ़ने का चश्मा" },
      { en: "Light shawl / jacket (5 AM temple visit)", hi: "हल्का शॉल / जैकेट (सुबह 5 बजे मंदिर के लिए)" },
      { en: "Slip-on footwear (temple)", hi: "स्लिप-ऑन चप्पल (मंदिर के लिए)" },
      { en: "Small pillow / neck rest (10 hr drive)", hi: "छोटा तकिया / गर्दन आराम (10 घंटे की ड्राइव)" },
      { en: "Water bottle each", hi: "हर किसी के लिए पानी की बोतल" },
    ] as BilingualText[],
  },
  shruti: {
    label: { en: "Shruti", hi: "श्रुति" } as BilingualText,
    sub: null,
    items: [
      { en: "2 sets churidar / saree (temple)", hi: "2 जोड़ी चूड़ीदार / साड़ी (मंदिर के लिए)" },
      { en: "1 set clothes for sea bath", hi: "1 जोड़ी समुद्र स्नान के कपड़े" },
      { en: "1 spare casual set", hi: "1 अतिरिक्त जोड़ी आरामदायक कपड़े" },
      { en: "Dupatta (temple requirement for women)", hi: "दुपट्टा (मंदिर में महिलाओं के लिए ज़रूरी)" },
      { en: "Towel", hi: "तौलिया" },
      { en: "Sunscreen", hi: "सनस्क्रीन" },
      { en: "Slip-on footwear (temple)", hi: "स्लिप-ऑन चप्पल (मंदिर के लिए)" },
      { en: "Medications (if any)", hi: "दवाइयाँ (अगर कोई हों)" },
    ] as BilingualText[],
  },
  car: {
    label: { en: "Car & Shared", hi: "गाड़ी व साझा सामान" } as BilingualText,
    sub: { en: "MG Hector", hi: "MG Hector" } as BilingualText,
    items: [
      { en: "Water bottles × 8", hi: "पानी की बोतलें × 8" },
      { en: "Snack box (drive + temple breaks)", hi: "नाश्ता डिब्बा (ड्राइव + मंदिर ब्रेक)" },
      { en: "First aid kit", hi: "प्राथमिक चिकित्सा किट" },
      { en: "Umbrella × 2 (sun protection)", hi: "छाता × 2 (धूप से बचाव)" },
      { en: "Plastic bags × 6 (for wet clothes)", hi: "प्लास्टिक थैलियाँ × 6 (गीले कपड़ों के लिए)" },
      { en: "Car documents folder (RC, insurance)", hi: "गाड़ी के काग़ज़ात (RC, बीमा)" },
      { en: "Tissue / wet wipes", hi: "टिश्यू / वेट वाइप्स" },
      { en: "Garbage bags", hi: "कूड़े की थैलियाँ" },
      { en: "Phone charging cables × 2", hi: "फ़ोन चार्जिंग केबल × 2" },
      { en: "Torch / phone flashlight (5 AM temple)", hi: "टॉर्च / फ़ोन फ़्लैशलाइट (सुबह 5 बजे मंदिर)" },
    ] as BilingualText[],
  },
  petcare: {
    label: { en: "Pre-departure", hi: "निकलने से पहले" } as BilingualText,
    sub: { en: "Chiku & Oreo", hi: "चीकू व ओरियो" } as BilingualText,
    items: [
      { en: "Confirm pet boarding / sitter", hi: "पालतू जानवरों की देखभाल पक्की करें" },
      { en: "Drop off pets before departure", hi: "निकलने से पहले पालतू जानवर छोड़ दें" },
      { en: "Share vet contact with sitter", hi: "पशु चिकित्सक का नंबर देखभालकर्ता को दें" },
      { en: "Print feeding schedule + medication (if any)", hi: "खाने का शेड्यूल + दवाई (अगर हो) प्रिंट करें" },
      { en: "Pack enough pet food for 3 days", hi: "3 दिन का पालतू जानवर का खाना पैक करें" },
      { en: "Share your contact + Surabhi as backup", hi: "अपना नंबर + सुरभि बैकअप के तौर पर दें" },
    ] as BilingualText[],
  },
};

/* ─── Budget Data (bilingual item names) ─── */
export const BUDGET_DATA = {
  temple: [
    { item: { en: "Spatika Lingam", hi: "स्फटिक लिंगम" } as BilingualText, unit: "₹50 × 4", total: 200 },
    { item: { en: "22 Theerthams", hi: "22 तीर्थम्" } as BilingualText, unit: "₹25 × 4", total: 100 },
    { item: { en: "Main Darshan VIP", hi: "मुख्य दर्शन VIP" } as BilingualText, unit: "₹200 × 4", total: 800, note: { en: "if queue > 30 min", hi: "अगर लाइन 30 मिनट से ज़्यादा" } as BilingualText },
    { item: { en: "Abdul Kalam Memorial", hi: "अब्दुल कलाम स्मारक" } as BilingualText, unit: "₹15 × 4", total: 60 },
  ],
  transport: [
    { item: { en: "Fuel (round trip)", hi: "ईंधन (आना-जाना)" } as BilingualText, unit: "~104L × ₹102", total: 10600, note: { en: "Hector CVT @ ~11 km/l", hi: "Hector CVT @ ~11 km/l" } as BilingualText },
    { item: { en: "Tolls (FASTag)", hi: "टोल (FASTag)" } as BilingualText, unit: "~₹900 × 2", total: 1800, note: { en: "via Salem–Trichy", hi: "सलेम–तिरुचि होकर" } as BilingualText },
    { item: { en: "Dhanushkodi Jeep", hi: "धनुषकोडी जीप" } as BilingualText, unit: "₹150 × 4", total: 600, note: { en: "shared jeep, last 8 km", hi: "साझा जीप, आख़िरी 8 किमी" } as BilingualText },
  ],
  food: [
    { item: { en: "Day 0 dinner", hi: "पहले दिन का रात का खाना" } as BilingualText, unit: "4 pax", total: 1000 },
    { item: { en: "Day 1 lunch + dinner", hi: "दूसरे दिन दोपहर + रात का खाना" } as BilingualText, unit: "4 pax", total: 1500 },
    { item: { en: "Day 2 road lunch", hi: "तीसरे दिन रास्ते का खाना" } as BilingualText, unit: "4 pax", total: 800 },
    { item: { en: "Snacks / water / chai", hi: "नाश्ता / पानी / चाय" } as BilingualText, unit: { en: "3 days", hi: "3 दिन" } as BilingualText, total: 500 },
  ],
  misc: [
    { item: { en: "Prasad / offerings", hi: "प्रसाद / चढ़ावा" } as BilingualText, unit: "", total: 500 },
    { item: { en: "Temple parking", hi: "मंदिर पार्किंग" } as BilingualText, unit: { en: "2 days", hi: "2 दिन" } as BilingualText, total: 200 },
    { item: { en: "Emergency buffer", hi: "आपातकालीन राशि" } as BilingualText, unit: "", total: 500 },
  ],
};
