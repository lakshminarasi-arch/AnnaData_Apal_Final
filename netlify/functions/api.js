/**
 * AnnaData – Netlify Serverless Function
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoints (query param: endpoint=<name>):
 *   GET /api?endpoint=branches
 *   GET /api?endpoint=menu
 *   GET /api?endpoint=forecast&branch=kor&dishes=11,12&days=7&startDate=2025-04-12
 *   GET /api?endpoint=bom&branch=kor&dishes=11,12&days=7&startDate=2025-04-12
 *   GET /api?endpoint=insights&branch=kor&dishes=11,12
 *
 * Deploy: put this file in netlify/functions/api.js
 * Add to netlify.toml:  [[redirects]] from="/api" to="/.netlify/functions/api" status=200
 */

// ── STATIC DATA ────────────────────────────────────────────────────────────────

const BRANCHES = [
  { id:'kor', name:'Koramangala', emoji:'🍽️',
    addr:'80 Feet Road, Koramangala, Bengaluru – 560034',
    covers:180, rating:4.5, since:2018, tables:48, staff:22 },
  { id:'ind', name:'Indiranagar', emoji:'🏮',
    addr:'12th Main Road, Indiranagar, Bengaluru – 560038',
    covers:145, rating:4.3, since:2020, tables:38, staff:18 },
  { id:'whi', name:'Whitefield', emoji:'🥘',
    addr:'ITPL Main Road, Whitefield, Bengaluru – 560066',
    covers:160, rating:4.4, since:2021, tables:42, staff:20 },
];

const MENU = [
  // Starters
  {id:1,  name:'Chicken Tikka',        cat:'Starters',        em:'🍗', veg:false, price:320, base:42},
  {id:2,  name:'Paneer Tikka',         cat:'Starters',        em:'🧀', veg:true,  price:280, base:38},
  {id:3,  name:'Seekh Kebab',          cat:'Starters',        em:'🍢', veg:false, price:340, base:28},
  {id:4,  name:'Tandoori Chicken',     cat:'Starters',        em:'🍗', veg:false, price:360, base:22},
  {id:5,  name:'Hara Bhara Kabab',     cat:'Starters',        em:'🥗', veg:true,  price:240, base:18},
  {id:6,  name:'Samosa (2 pcs)',       cat:'Starters',        em:'🔶', veg:true,  price:90,  base:35},
  {id:7,  name:'Aloo Tikki Chaat',     cat:'Starters',        em:'🥔', veg:true,  price:120, base:25},
  {id:8,  name:'Fish Tikka',           cat:'Starters',        em:'🐟', veg:false, price:350, base:15},
  {id:9,  name:'Dahi Kebab',           cat:'Starters',        em:'🥛', veg:true,  price:260, base:12},
  {id:10, name:'Reshmi Kebab',         cat:'Starters',        em:'🍢', veg:false, price:310, base:20},
  // Main Non-Veg
  {id:11, name:'Butter Chicken',       cat:'Main - Non Veg',  em:'🍛', veg:false, price:380, base:72},
  {id:12, name:'Chicken Biryani',      cat:'Main - Non Veg',  em:'🍚', veg:false, price:320, base:85},
  {id:13, name:'Mutton Biryani',       cat:'Main - Non Veg',  em:'🍚', veg:false, price:420, base:45},
  {id:14, name:'Lamb Rogan Josh',      cat:'Main - Non Veg',  em:'🐑', veg:false, price:440, base:28},
  {id:15, name:'Chicken Korma',        cat:'Main - Non Veg',  em:'🍛', veg:false, price:360, base:32},
  {id:16, name:'Fish Curry',           cat:'Main - Non Veg',  em:'🐟', veg:false, price:380, base:20},
  {id:17, name:'Prawn Masala',         cat:'Main - Non Veg',  em:'🦐', veg:false, price:420, base:22},
  {id:18, name:'Chicken Vindaloo',     cat:'Main - Non Veg',  em:'🌶️', veg:false, price:360, base:18},
  {id:19, name:'Mutton Curry',         cat:'Main - Non Veg',  em:'🥩', veg:false, price:400, base:25},
  {id:20, name:'Egg Curry',            cat:'Main - Non Veg',  em:'🥚', veg:false, price:200, base:30},
  {id:21, name:'Chicken Chettinad',    cat:'Main - Non Veg',  em:'🌶️', veg:false, price:370, base:24},
  {id:22, name:'Prawn Biryani',        cat:'Main - Non Veg',  em:'🦐', veg:false, price:460, base:35},
  // Main Veg
  {id:23, name:'Dal Makhani',          cat:'Main - Veg',      em:'🫘', veg:true,  price:220, base:65},
  {id:24, name:'Palak Paneer',         cat:'Main - Veg',      em:'🥬', veg:true,  price:260, base:48},
  {id:25, name:'Paneer Butter Masala', cat:'Main - Veg',      em:'🧀', veg:true,  price:280, base:55},
  {id:26, name:'Shahi Paneer',         cat:'Main - Veg',      em:'👑', veg:true,  price:300, base:38},
  {id:27, name:'Chole Bhature',        cat:'Main - Veg',      em:'🌰', veg:true,  price:180, base:42},
  {id:28, name:'Rajma Chawal',         cat:'Main - Veg',      em:'🫘', veg:true,  price:160, base:32},
  {id:29, name:'Aloo Gobhi',           cat:'Main - Veg',      em:'🥦', veg:true,  price:200, base:28},
  {id:30, name:'Mix Veg Curry',        cat:'Main - Veg',      em:'🥕', veg:true,  price:220, base:22},
  {id:31, name:'Kadai Paneer',         cat:'Main - Veg',      em:'🧀', veg:true,  price:280, base:45},
  {id:32, name:'Veg Biryani',          cat:'Main - Veg',      em:'🍚', veg:true,  price:260, base:40},
  {id:33, name:'Navratan Korma',       cat:'Main - Veg',      em:'🌸', veg:true,  price:300, base:18},
  {id:34, name:'Dal Tadka',            cat:'Main - Veg',      em:'🫘', veg:true,  price:190, base:52},
  // Breads
  {id:35, name:'Garlic Naan',          cat:'Breads',          em:'🫓', veg:true,  price:55,  base:120},
  {id:36, name:'Tandoori Roti',        cat:'Breads',          em:'🫓', veg:true,  price:40,  base:85},
  {id:37, name:'Paratha',              cat:'Breads',          em:'🫓', veg:true,  price:65,  base:55},
  {id:38, name:'Puri (2 pcs)',         cat:'Breads',          em:'🫓', veg:true,  price:50,  base:40},
  {id:39, name:'Laccha Paratha',       cat:'Breads',          em:'🫓', veg:true,  price:70,  base:45},
  {id:40, name:'Missi Roti',           cat:'Breads',          em:'🫓', veg:true,  price:50,  base:25},
  // Rice
  {id:41, name:'Jeera Rice',           cat:'Rice',            em:'🍚', veg:true,  price:140, base:70},
  {id:42, name:'Steamed Basmati',      cat:'Rice',            em:'🍚', veg:true,  price:120, base:45},
  {id:43, name:'Veg Pulao',            cat:'Rice',            em:'🍚', veg:true,  price:170, base:35},
  {id:44, name:'Egg Fried Rice',       cat:'Rice',            em:'🍳', veg:false, price:190, base:28},
  // Desserts
  {id:45, name:'Gulab Jamun',          cat:'Desserts',        em:'🍮', veg:true,  price:90,  base:95},
  {id:46, name:'Kheer',                cat:'Desserts',        em:'🥛', veg:true,  price:100, base:42},
  {id:47, name:'Rasmalai',             cat:'Desserts',        em:'🍮', veg:true,  price:120, base:55},
  {id:48, name:'Gajar Halwa',          cat:'Desserts',        em:'🥕', veg:true,  price:110, base:35},
  {id:49, name:'Kulfi (2 pcs)',        cat:'Desserts',        em:'🍦', veg:true,  price:130, base:48},
  {id:50, name:'Mango Lassi',          cat:'Desserts',        em:'🥭', veg:true,  price:110, base:62},
];

// Day-of-week demand multipliers: 0=Sun, 1=Mon … 6=Sat
// Global fallback (used when a category is not found in CATEGORY_DOW)
const DOW_MULT = [1.00, 0.72, 0.68, 1.55, 1.40, 0.88, 1.15];

/**
 * Per-category DOW multipliers.
 * Starters / Desserts skew toward Fri–Sun (social outings, group events).
 * Main - Veg skews more Mon–Thu (office crowd choosing vegetarian midweek).
 * Main - Non Veg and Rice track the overall footfall curve.
 * All arrays: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
 */
const CATEGORY_DOW = {
  //                  Sun    Mon    Tue    Wed    Thu    Fri    Sat
  // Starters: group-social ordering → SATURDAY is the peak, Friday > Wednesday
  'Starters':       [1.12,  0.62,  0.58,  1.30,  1.15,  1.35,  1.68],
  // Main - Non Veg: biryani & occasion dishes → WEDNESDAY peak, moderate Saturday
  'Main - Non Veg': [1.05,  0.73,  0.70,  1.58,  1.42,  0.88,  1.25],
  // Main - Veg: office/corporate crowd → WEDNESDAY peak, weekend barely stands out
  'Main - Veg':     [0.88,  0.85,  0.82,  1.60,  1.50,  0.90,  0.98],
  // Breads: tracks footfall → WEDNESDAY peak, visible Friday dip
  'Breads':         [0.98,  0.73,  0.70,  1.60,  1.42,  0.85,  1.18],
  // Rice: tracks biryani/mains → WEDNESDAY peak, deepest Friday dip of any category
  'Rice':           [1.00,  0.72,  0.68,  1.62,  1.44,  0.82,  1.15],
  // Desserts: celebratory/social item → SATURDAY is the peak, Friday also strong
  'Desserts':       [1.35,  0.55,  0.52,  1.20,  1.05,  1.28,  1.70],
};

/**
 * Per-category scaling applied to the FIFA uplift (fifa.mult - 1).
 * Starters and Desserts surge most during group match viewings (sharing plates,
 * celebratory sweets, Mango Lassi). Mains - Veg are least event-driven.
 * Formula applied: effective_mult = 1 + (fifa.mult - 1) * CATEGORY_FIFA_SCALE[cat]
 */
const CATEGORY_FIFA_SCALE = {
  'Starters':       1.60,  // groups pile on sharing plates & starters during matches
  'Desserts':       1.35,  // sweets, Mango Lassi, celebratory treats
  'Main - Non Veg': 1.10,  // biryani (NV) is the FIFA meal; also gets biryaniBoost
  'Main - Veg':     0.80,  // veg mains down — tables pivot to sharing/biryani
  'Breads':         0.75,  // plain naan/roti down — people order biryani not bread on match nights
  'Rice':           0.70,  // plain rice (jeera, fried) down — biryani (NV) handles the rice demand
};

/**
 * Per-category scaling for FESTIVAL events (evt.type === 'festival').
 * At festivals like Eid, guests go straight to Biryani & NV mains —
 * starters and breads are often skipped; rice/NV peak sharply.
 * Formula applied: effective_mult = 1 + (evt.overallMult - 1) * CATEGORY_EVENT_SCALE[cat]
 */
const CATEGORY_EVENT_SCALE = {
  'Main - Non Veg': 1.25,  // Biryani & NV dishes are the festival centrepiece
  'Rice':           1.20,  // Rice-based dishes peak at festival gatherings
  'Desserts':       1.12,  // Sweets are part of every celebration
  'Main - Veg':     0.95,  // Slightly down as NV takes the spotlight
  'Breads':         0.88,  // Guests skip naan when eating biryani
  'Starters':       0.85,  // Diners go straight to mains at large gatherings
};

const BIRYANI_IDS = new Set([12, 13, 22, 32]);

// Named event overrides  { 'YYYY-MM-DD': { label, biryaniBoost, overallMult, type } }
const EVENT_MAP = {
  '2025-03-30': { label:'Ugadi',               biryaniBoost:1.00, overallMult:1.22, type:'festival' },
  '2025-03-31': { label:'Eid al-Fitr',         biryaniBoost:1.42, overallMult:1.18, type:'festival' },
  '2025-04-01': { label:'Eid Holiday',         biryaniBoost:1.35, overallMult:1.12, type:'festival' },
  '2025-04-12': { label:'IPL Weekend',         biryaniBoost:1.00, overallMult:1.08, type:'sports'   },
  '2025-04-13': { label:'IPL Weekend',         biryaniBoost:1.00, overallMult:1.10, type:'sports'   },
  '2025-04-14': { label:'Rain Forecast',       biryaniBoost:1.00, overallMult:0.85, type:'weather'  },
  '2025-04-15': { label:'Eid al-Fitr + IPL',  biryaniBoost:1.42, overallMult:1.25, type:'festival' },
  '2025-04-16': { label:'Eid Holiday',         biryaniBoost:1.38, overallMult:1.15, type:'festival' },
  '2025-06-06': { label:'Eid al-Adha',        biryaniBoost:1.40, overallMult:1.18, type:'festival' },
  '2025-06-07': { label:'Eid al-Adha Holiday',biryaniBoost:1.32, overallMult:1.10, type:'festival' },
  '2025-08-15': { label:'Independence Day',    biryaniBoost:1.00, overallMult:1.15, type:'holiday'  },
  '2025-10-02': { label:'Dussehra',            biryaniBoost:1.00, overallMult:1.20, type:'festival' },
  '2025-10-20': { label:'Diwali',              biryaniBoost:1.00, overallMult:1.35, type:'festival' },
  '2025-10-21': { label:'Diwali Holiday',      biryaniBoost:1.00, overallMult:1.25, type:'festival' },
  '2025-12-24': { label:'Christmas Eve',       biryaniBoost:1.00, overallMult:1.22, type:'holiday'  },
  '2025-12-25': { label:'Christmas',           biryaniBoost:1.00, overallMult:1.28, type:'holiday'  },
  '2025-12-31': { label:"New Year's Eve",      biryaniBoost:1.00, overallMult:1.40, type:'holiday'  },
  '2026-01-01': { label:"New Year's Day",      biryaniBoost:1.00, overallMult:1.30, type:'holiday'  },
  '2026-01-14': { label:'Pongal / Sankranti',  biryaniBoost:1.00, overallMult:1.18, type:'festival' },
  '2026-01-26': { label:'Republic Day',        biryaniBoost:1.00, overallMult:1.15, type:'holiday'  },
  '2026-03-19': { label:'Ugadi',               biryaniBoost:1.00, overallMult:1.22, type:'festival' },
  '2026-03-20': { label:'Holi',                biryaniBoost:1.00, overallMult:1.20, type:'festival' },
  '2026-04-05': { label:'Eid al-Fitr',         biryaniBoost:1.42, overallMult:1.18, type:'festival' },
  '2026-04-06': { label:'Eid Holiday',         biryaniBoost:1.35, overallMult:1.12, type:'festival' },
  '2026-05-27': { label:'Eid al-Adha',         biryaniBoost:1.40, overallMult:1.18, type:'festival' },
  '2026-05-28': { label:'Eid al-Adha Holiday', biryaniBoost:1.32, overallMult:1.10, type:'festival' },
};

// ── FIFA 2026 DEMAND SIGNAL ────────────────────────────────────────────────────
// Teams and dates verified against CBS Sports/FIFA.com actual June 2026 schedule.
// istFactor: fraction of peak uplift based on ACTUAL kickoff time vs IST prime dinner.
//   1.00 = noon EDT/CDT  → 9:30–10:30 PM IST  ← prime; full restaurant impact
//   0.25–0.35 = 3 PM EDT → 12:30–1:30 AM IST  ← partial; late-night fans only
//   0.00 = 6 PM+ EDT     → 3:30 AM IST+        ← restaurant closed; zero impact
// confidence = probability the listed popular team(s) are actually playing that date.
//
// tier 0 = Super (T1 vs T1, knockouts)  tier 1 = Argentina / Brazil
// tier 2 = France / Portugal / Spain / England   tier 3 = Germany / Mexico
const FIFA_EVENTS = {
  // ── GROUP STAGE (all times Eastern) ─────────────────────────────────────────
  '2026-06-11': { teams:['Mexico'],             tier:3, stage:'group', confidence:0.85, istFactor:0.25 }, // 3 PM ET → 12:30 AM IST
  '2026-06-13': { teams:['Brazil'],             tier:1, stage:'group', confidence:1.00, istFactor:0.00 }, // 6 PM ET → 3:30 AM IST ❌
  '2026-06-14': { teams:['Germany'],            tier:3, stage:'group', confidence:0.80, istFactor:0.90 }, // 1 PM ET → 10:30 PM IST ✓
  '2026-06-15': { teams:['Spain'],              tier:2, stage:'group', confidence:0.85, istFactor:1.00 }, // 12 PM ET → 9:30 PM IST ✓
  '2026-06-16': { teams:['Argentina','France'], tier:1, stage:'group', confidence:1.00, istFactor:0.90 }, // Argentina noon CDT=1PM ET → 10:30 PM IST ✓ (est.)
  '2026-06-17': { teams:['England','Portugal'], tier:2, stage:'group', confidence:1.00, istFactor:0.30 }, // 5-match day; mix of 3–6 PM ET slots (est.)
  '2026-06-18': { teams:['Mexico'],             tier:3, stage:'group', confidence:0.85, istFactor:0.00 }, // evening slot → 6:30 AM IST ❌
  '2026-06-19': { teams:['Brazil'],             tier:1, stage:'group', confidence:1.00, istFactor:0.25 }, // Brazil vs Haiti; ~3 PM ET est.
  '2026-06-20': { teams:['Germany'],            tier:3, stage:'group', confidence:0.80, istFactor:0.20 }, // 4 PM ET → 1:30 AM IST
  '2026-06-21': { teams:['Spain'],              tier:2, stage:'group', confidence:1.00, istFactor:1.00 }, // 12 PM ET → 9:30 PM IST ✓
  '2026-06-22': { teams:['Argentina'],          tier:1, stage:'group', confidence:1.00, istFactor:0.90 }, // 1 PM ET → 10:30 PM IST ✓ PRIME
  '2026-06-23': { teams:['Portugal','England'], tier:2, stage:'group', confidence:1.00, istFactor:0.90 }, // Portugal 1 PM ET → 10:30 PM IST ✓
  '2026-06-24': { teams:['Brazil','Mexico'],    tier:1, stage:'group', confidence:1.00, istFactor:0.00 }, // Brazil 6PM ET + Mexico 9PM ET → both overnight ❌
  '2026-06-25': { teams:['Germany'],            tier:3, stage:'group', confidence:0.80, istFactor:0.20 }, // 4 PM ET → 1:30 AM IST
  '2026-06-26': { teams:['France','Spain'],     tier:2, stage:'group', confidence:0.93, istFactor:0.30 }, // France 3PM ET=12:30 AM IST; Spain 8PM ET=dead ❌
  '2026-06-27': { teams:['England','Argentina','Portugal'], tier:2, stage:'group', confidence:0.80, istFactor:0.08 }, // best: England 5PM ET=2:30 AM; rest worse
  // ── ROUND OF 16 ──────────────────────────────────────────────────────────────
  // CBS-confirmed slots: Jul 4(1PM/5PM), Jul 5(4PM/8PM), Jul 6(3PM/8PM), Jul 7(12PM/4PM)
  '2026-07-04': { teams:['TBD'], tier:2, stage:'r16', confidence:0.60, istFactor:0.65 }, // 1PM=prime ✓; 5PM=2:30 AM IST
  '2026-07-05': { teams:['TBD'], tier:1, stage:'r16', confidence:0.65, istFactor:0.20 }, // 4PM & 8PM ET → both bad
  '2026-07-06': { teams:['TBD'], tier:2, stage:'r16', confidence:0.60, istFactor:0.20 }, // 3PM & 8PM ET
  '2026-07-07': { teams:['TBD'], tier:1, stage:'r16', confidence:0.65, istFactor:0.55 }, // 12PM=prime ✓; 4PM=1:30 AM IST
  // ── QUARTER-FINALS ───────────────────────────────────────────────────────────
  // CBS-confirmed: Jul 9(4PM), Jul 10(3PM), Jul 11(5PM/9PM)
  '2026-07-09': { teams:['TBD'], tier:1, stage:'qf', confidence:0.70, istFactor:0.20 }, // 4PM ET → 1:30 AM IST
  '2026-07-10': { teams:['TBD'], tier:2, stage:'qf', confidence:0.65, istFactor:0.30 }, // 3PM ET → 12:30 AM IST
  '2026-07-11': { teams:['TBD'], tier:1, stage:'qf', confidence:0.70, istFactor:0.08 }, // 5PM/9PM ET → 2:30/6:30 AM IST ❌
  // ── SEMI-FINALS ──────────────────────────────────────────────────────────────
  '2026-07-14': { teams:['TBD'], tier:1, stage:'sf', confidence:0.80, istFactor:0.35 }, // 3PM ET → 12:30 AM IST (fans stay up)
  '2026-07-15': { teams:['TBD'], tier:1, stage:'sf', confidence:0.80, istFactor:0.35 }, // 3PM ET → 12:30 AM IST
  // ── FINAL ────────────────────────────────────────────────────────────────────
  '2026-07-19': { teams:['TBD'], tier:0, stage:'final', confidence:0.90, istFactor:0.50 }, // 3PM ET → 12:30 AM IST (fans WILL stay up)
};

// Demand multipliers by [tier][stage]. All values > 1.0: restaurant has screens,
// customers prefer group viewing. Confidence-weighted inside getFifaMultiplier().
const FIFA_MULT = {
  0: { group:1.60, r16:1.75, qf:1.75, sf:1.90, final:2.00 }, // Super  (T1 vs T1)
  1: { group:1.25, r16:1.40, qf:1.40, sf:1.55, final:1.70 }, // Tier 1 – Argentina / Brazil
  2: { group:1.12, r16:1.20, qf:1.20, sf:1.28, final:1.35 }, // Tier 2 – France / Portugal / Spain / England
  3: { group:1.06, r16:1.10, qf:1.10, sf:1.00, final:1.00 }, // Tier 3 – Germany / Mexico
};

const FIFA_STAGE_LABEL = {
  group:'Group Stage', r16:'Round of 16', qf:'Quarter-final', sf:'Semi-final', final:'Final',
};

const INGREDIENTS_MAP = {
  12:[ // Chicken Biryani
    {ing:'Basmati Rice',      unit:'kg', qps:200, cost:120, vendor:'Royal Traders'},
    {ing:'Chicken (whole)',   unit:'kg', qps:250, cost:240, vendor:'Ganesh Poultry & Meats'},
    {ing:'Onion',             unit:'kg', qps:80,  cost:40,  vendor:'Fresh Farm Vendors'},
    {ing:'Yogurt',            unit:'kg', qps:50,  cost:90,  vendor:'Mother Dairy Dist.'},
    {ing:'Biryani Masala',    unit:'kg', qps:15,  cost:600, vendor:'Everest Spices Wholesale'},
    {ing:'Ghee',              unit:'kg', qps:20,  cost:580, vendor:'Mother Dairy Dist.'},
    {ing:'Fresh Mint',        unit:'kg', qps:10,  cost:180, vendor:'Fresh Farm Vendors'},
  ],
  11:[ // Butter Chicken
    {ing:'Chicken (boneless)',unit:'kg', qps:220, cost:280, vendor:'Ganesh Poultry & Meats'},
    {ing:'Butter',            unit:'kg', qps:30,  cost:520, vendor:'Mother Dairy Dist.'},
    {ing:'Cream',             unit:'kg', qps:40,  cost:320, vendor:'Mother Dairy Dist.'},
    {ing:'Tomato',            unit:'kg', qps:80,  cost:50,  vendor:'Fresh Farm Vendors'},
    {ing:'Cashews',           unit:'kg', qps:20,  cost:900, vendor:'Everest Spices Wholesale'},
    {ing:'Butter Chk Masala', unit:'kg', qps:15,  cost:550, vendor:'Everest Spices Wholesale'},
    {ing:'Ginger-Garlic Paste',unit:'kg',qps:20,  cost:160, vendor:'Royal Traders'},
  ],
  23:[ // Dal Makhani
    {ing:'Urad Dal (black)',  unit:'kg', qps:80,  cost:140, vendor:'Royal Traders'},
    {ing:'Rajma',             unit:'kg', qps:20,  cost:130, vendor:'Royal Traders'},
    {ing:'Butter',            unit:'kg', qps:25,  cost:520, vendor:'Mother Dairy Dist.'},
    {ing:'Cream',             unit:'kg', qps:30,  cost:320, vendor:'Mother Dairy Dist.'},
    {ing:'Tomato',            unit:'kg', qps:60,  cost:50,  vendor:'Fresh Farm Vendors'},
    {ing:'Spice Mix',         unit:'kg', qps:10,  cost:400, vendor:'Everest Spices Wholesale'},
  ],
  2:[ // Paneer Tikka
    {ing:'Paneer',            unit:'kg', qps:180, cost:360, vendor:'Mother Dairy Dist.'},
    {ing:'Bell Pepper',       unit:'kg', qps:40,  cost:80,  vendor:'Fresh Farm Vendors'},
    {ing:'Onion',             unit:'kg', qps:30,  cost:40,  vendor:'Fresh Farm Vendors'},
    {ing:'Yogurt',            unit:'kg', qps:40,  cost:90,  vendor:'Mother Dairy Dist.'},
    {ing:'Tikka Masala',      unit:'kg', qps:12,  cost:550, vendor:'Everest Spices Wholesale'},
    {ing:'Cooking Oil',       unit:'L',  qps:10,  cost:180, vendor:'Royal Traders'},
  ],
  45:[ // Gulab Jamun
    {ing:'Milk Powder',       unit:'kg', qps:60,  cost:480, vendor:'Mother Dairy Dist.'},
    {ing:'Maida (Flour)',     unit:'kg', qps:10,  cost:55,  vendor:'Royal Traders'},
    {ing:'Sugar',             unit:'kg', qps:80,  cost:70,  vendor:'Royal Traders'},
    {ing:'Ghee',              unit:'kg', qps:20,  cost:580, vendor:'Mother Dairy Dist.'},
    {ing:'Rose Water',        unit:'L',  qps:5,   cost:600, vendor:'Everest Spices Wholesale'},
  ],
  13:[ // Mutton Biryani
    {ing:'Basmati Rice',      unit:'kg', qps:200, cost:120, vendor:'Royal Traders'},
    {ing:'Mutton',            unit:'kg', qps:280, cost:640, vendor:'Ganesh Poultry & Meats'},
    {ing:'Onion',             unit:'kg', qps:90,  cost:40,  vendor:'Fresh Farm Vendors'},
    {ing:'Yogurt',            unit:'kg', qps:60,  cost:90,  vendor:'Mother Dairy Dist.'},
    {ing:'Biryani Masala',    unit:'kg', qps:18,  cost:600, vendor:'Everest Spices Wholesale'},
    {ing:'Ghee',              unit:'kg', qps:25,  cost:580, vendor:'Mother Dairy Dist.'},
  ],
  25:[ // Paneer Butter Masala
    {ing:'Paneer',            unit:'kg', qps:180, cost:360, vendor:'Mother Dairy Dist.'},
    {ing:'Butter',            unit:'kg', qps:30,  cost:520, vendor:'Mother Dairy Dist.'},
    {ing:'Cream',             unit:'kg', qps:35,  cost:320, vendor:'Mother Dairy Dist.'},
    {ing:'Tomato',            unit:'kg', qps:70,  cost:50,  vendor:'Fresh Farm Vendors'},
    {ing:'PBM Masala',        unit:'kg', qps:12,  cost:500, vendor:'Everest Spices Wholesale'},
  ],
  _default:[ // Fallback for all other dishes
    {ing:'Mixed Vegetables',  unit:'kg', qps:150, cost:60,  vendor:'Fresh Farm Vendors'},
    {ing:'Cooking Oil',       unit:'L',  qps:15,  cost:180, vendor:'Royal Traders'},
    {ing:'Spice Mix',         unit:'kg', qps:12,  cost:400, vendor:'Everest Spices Wholesale'},
    {ing:'Onion',             unit:'kg', qps:50,  cost:40,  vendor:'Fresh Farm Vendors'},
    {ing:'Tomato',            unit:'kg', qps:40,  cost:50,  vendor:'Fresh Farm Vendors'},
  ]
};

const VENDORS = {
  'Ganesh Poultry & Meats':   {icon:'🥩', cat:'Proteins & Seafood'},
  'Mother Dairy Dist.':       {icon:'🥛', cat:'Dairy Products'},
  'Fresh Farm Vendors':       {icon:'🥦', cat:'Fresh Vegetables & Herbs'},
  'Everest Spices Wholesale': {icon:'🌶️', cat:'Spices & Condiments'},
  'Royal Traders':            {icon:'🌾', cat:'Staples, Grains & Oils'},
};

const DOW_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ── HELPERS ────────────────────────────────────────────────────────────────────

/** Format a Date as 'Mon D' (e.g. 'Apr 15') */
function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

/** Zero-padded YYYY-MM-DD string */
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/** Simple seeded pseudo-random (mulberry32) – keeps responses deterministic per date */
function seededRand(seed) {
  let s = seed >>> 0;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Return the FIFA 2026 demand multiplier and label for a given date.
 * The raw tier/stage multiplier is confidence-weighted so a Tier-1 group match
 * with 80 % confidence delivers 80 % of the full 1.25× uplift.
 * @param  {string} dateStr  'YYYY-MM-DD'
 * @returns {{ mult:number, label:string, flag:number }}
 */
function getFifaMultiplier(dateStr) {
  const evt = FIFA_EVENTS[dateStr];
  if (!evt) return { mult:1.0, label:'', flag:0 };

  const stageMults = FIFA_MULT[evt.tier];
  if (!stageMults) return { mult:1.0, label:'', flag:0 };

  const rawMult = stageMults[evt.stage] || 1.0;
  // Confidence × IST-timing weighted: no uplift when match is at 3AM+ IST (istFactor≈0)
  const mult    = parseFloat((1.0 + (rawMult - 1.0) * evt.confidence * (evt.istFactor ?? 1.0)).toFixed(3));

  const stageStr = FIFA_STAGE_LABEL[evt.stage] || evt.stage;
  const teamStr  = evt.teams.filter(t => t !== 'TBD').join(' / ') || 'Top teams';
  const label    = `FIFA 2026 ${stageStr} – ${teamStr}`;

  return { mult, label, flag:1 };
}

/**
 * Compute demand predictions.
 * @param {string}   branchId   – 'kor'|'ind'|'whi'
 * @param {number[]} dishIds    – array of dish IDs
 * @param {number}   days       – 1–7
 * @param {string}   startDate  – 'YYYY-MM-DD' (default 2025-04-12)
 * @returns {{ forecast, dates, daysOfWeek, eventFlags, eventLabels }}
 */
function computeForecast(branchId, dishIds, days, startDate) {
  const start = new Date(startDate || tomorrowISO());
  const branch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
  const branchFactor = branch.covers / 180;

  const forecast     = {};
  const dates        = [];
  const daysOfWeek   = [];
  const eventFlags   = [];
  const eventLabels  = [];
  const fifaFlags    = [];
  const fifaLabels   = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds  = isoDate(d);
    const dow = d.getDay(); // 0=Sun

    dates.push(fmtDate(d));
    daysOfWeek.push(DOW_NAMES[dow]);

    const evt  = EVENT_MAP[ds] || {};
    const fifa = getFifaMultiplier(ds);

    eventFlags.push(evt.label ? 1 : 0);
    eventLabels.push(evt.label || '');
    fifaFlags.push(fifa.flag);
    fifaLabels.push(fifa.label);

    // Use a seeded RNG so forecasts are stable for the same date
    const rng = seededRand(d.getTime() / 86400000 | 0);

    dishIds.forEach(dishId => {
      const dish = MENU.find(m => m.id === dishId);
      if (!dish) return;
      if (!forecast[dishId]) forecast[dishId] = [];

      // Per-category DOW multiplier (falls back to global DOW_MULT if category unknown)
      const catDOW = (CATEGORY_DOW[dish.cat] ?? DOW_MULT)[dow];
      let mult = catDOW * branchFactor;

      if (evt.overallMult) {
        if (evt.type === 'festival') {
          // Festival events: scale the uplift/dip by category sensitivity
          const evtScale = CATEGORY_EVENT_SCALE[dish.cat] ?? 1.0;
          mult *= 1 + (evt.overallMult - 1) * evtScale;
        } else {
          // Weather / sports / other events: flat multiplier applies to all
          mult *= evt.overallMult;
        }
      }
      if (BIRYANI_IDS.has(dishId) && evt.biryaniBoost) mult *= evt.biryaniBoost;

      if (fifa.flag) {
        // FIFA: scale the uplift by category — starters/desserts surge during match viewings
        const fifaScale = CATEGORY_FIFA_SCALE[dish.cat] ?? 1.0;
        mult *= 1 + (fifa.mult - 1) * fifaScale;
      }

      const noise = 0.95 + rng() * 0.10;   // ±5% noise
      forecast[dishId].push(Math.round(dish.base * mult * noise));
    });
  }

  return { forecast, dates, daysOfWeek, eventFlags, eventLabels, fifaFlags, fifaLabels };
}

/** Build Bill of Materials from forecast data */
function buildBOM(dishIds, forecast) {
  const vendorMap = {};
  dishIds.forEach(dishId => {
    const recipe = INGREDIENTS_MAP[dishId] || INGREDIENTS_MAP['_default'];
    const totalServings = (forecast[dishId] || []).reduce((a, b) => a + b, 0);
    recipe.forEach(r => {
      if (!vendorMap[r.vendor]) vendorMap[r.vendor] = {};
      if (!vendorMap[r.vendor][r.ing])
        vendorMap[r.vendor][r.ing] = { unit: r.unit, totalGrams: 0, cost: r.cost };
      vendorMap[r.vendor][r.ing].totalGrams += r.qps * totalServings;
    });
  });
  return vendorMap;
}

/**
 * Call Claude Haiku to generate 3 dynamic demand insights (income cycle, trend, risk).
 * Returns null on any failure so the caller can serve static fallback cards instead.
 */
async function generateLLMInsights(dishIds, startDate, forecastData, branch) {
  const apiKey = process.env.ANTHROPIC_API_KEY_ANNADATA;
  if (!apiKey) return null;

  // Compact per-dish 7-day total (keeps prompt tokens low)
  const dishSummary = dishIds.map(id => {
    const dish = MENU.find(m => m.id === id);
    if (!dish) return null;
    const weekTotal = (forecastData.forecast[id] || []).reduce((a, b) => a + b, 0);
    return `${dish.name} (${dish.cat}): ${weekTotal} servings`;
  }).filter(Boolean).join('\n');

  // Week-of-month context
  const dateObj     = new Date(startDate);
  const weekOfMonth = Math.ceil(dateObj.getDate() / 7);
  const monthName   = dateObj.toLocaleDateString('en-US', { month:'long' });

  // Day-by-day schedule with events
  const daySummary = forecastData.dates.map((date, i) => {
    const evtLabel  = forecastData.eventLabels[i];
    const fifaLabel = (forecastData.fifaLabels || [])[i];
    const tags = [evtLabel, fifaLabel].filter(Boolean).join(' + ');
    return `${forecastData.daysOfWeek[i]} ${date}${tags ? ` [${tags}]` : ''}`;
  }).join(', ');

  // Category mix in selection
  const catCounts = {};
  dishIds.forEach(id => {
    const cat = MENU.find(m => m.id === id)?.cat;
    if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const catMix = Object.entries(catCounts).map(([k, v]) => `${k}:${v}`).join(', ');

  const prompt =
`You are a demand analyst for AnnaData, an Indian restaurant chain in Bengaluru. Generate 3 focused, actionable insights for the restaurant manager.

CONTEXT:
Branch: ${branch.name} (${branch.covers} covers)
Forecast period: ${forecastData.dates[0]} to ${forecastData.dates[forecastData.dates.length - 1]} (${monthName}, week ${weekOfMonth} of month)
Schedule: ${daySummary}
Category mix: ${catMix}
7-day demand by dish:
${dishSummary}

Return ONLY a raw JSON array — no markdown, no explanation, nothing else. Exactly 3 items:
[
  {"cls":"ic-pay","icon":"💰","title":"...","sub":"Income Cycle Signal · Medium Confidence","body":"... <strong>key stat</strong> ...","impacts":[{"label":"...","up":true},{"label":"...","up":true}],"recc":"<strong>Action:</strong> ..."},
  {"cls":"ic-trend","icon":"📈","title":"...","sub":"Trend Signal · High Confidence","body":"...","impacts":[{"label":"...","up":true},{"label":"...","up":true}],"recc":"..."},
  {"cls":"ic-alert","icon":"⚠️","title":"...","sub":"Risk Signal · Medium Confidence","body":"...","impacts":[{"label":"...","up":false},{"label":"...","up":false}],"recc":"..."}
]

Rules:
1. ic-pay (💰): Salary cycle for ${monthName} week ${weekOfMonth}. Weeks 1–2 → premium upsell opportunity. Weeks 3–4 → warn about demand softening on premium dishes.
2. ic-trend (📈): Pick the single highest-demand dish from the forecast above. Give a specific stocking or prep tip naming that dish.
3. ic-alert (⚠️): Identify the weakest demand day from the schedule (Mon/Tue are usually low). Suggest a concrete mitigation — combo offer, reduced batch prep, or adjusted staffing.
Keep each "body" to 2 sentences. Use <strong> for 1–2 numbers per insight. Name the actual dishes from the selection in recommendations.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages:   [{ role:'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Anthropic API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = (data.content[0]?.text || '').trim();

  // Extract JSON array — tolerate any accidental wrapper text
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in Haiku response');

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length < 1) throw new Error('Empty or malformed insight array');
  return parsed;
}

/** Generate contextual AI insights */
async function buildInsights(dishIds, startDate, forecastData, branch) {
  const start = new Date(startDate || tomorrowISO());
  const end   = new Date(start); end.setDate(end.getDate() + 6);

  const hasBiryani = dishIds.some(id => BIRYANI_IDS.has(id));
  const hasButterChicken = dishIds.includes(11);
  const hasGulabJamun    = dishIds.includes(45);

  // Collect events in the forecast window
  const windowEvents = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const evt = EVENT_MAP[isoDate(d)];
    if (evt && !windowEvents.find(e => e.label === evt.label))
      windowEvents.push({ ...evt, date: fmtDate(d) });
  }

  const hasFestival = windowEvents.some(e => e.type === 'festival');
  const hasWeather  = windowEvents.some(e => e.type === 'weather');
  const hasSports   = windowEvents.some(e => e.type === 'sports');
  const festEvt     = windowEvents.find(e => e.type === 'festival') || {};
  const weatherEvt  = windowEvents.find(e => e.type === 'weather')  || {};
  const sportsEvt   = windowEvents.find(e => e.type === 'sports')   || {};

  // Collect FIFA 2026 events in the forecast window (sort by tier: 0 = most important)
  const fifaWindow = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds = isoDate(d);
    if (FIFA_EVENTS[ds] && !fifaWindow.find(e => e.ds === ds)) {
      fifaWindow.push({ ...FIFA_EVENTS[ds], date: fmtDate(d), ds });
    }
  }
  // Sort by effective IST impact (desc): a prime-time tier-2 Spain match beats a 3AM tier-1 Brazil match
  fifaWindow.sort((a, b) => getFifaMultiplier(b.ds).mult - getFifaMultiplier(a.ds).mult);
  const hasFifa = fifaWindow.length > 0;
  const topFifa = fifaWindow[0] || {};

  const insights = [];

  if (hasFestival) {
    insights.push({
      cls:'ic-fest', icon:'🕌',
      title: `${festEvt.label || 'Festival'} is in the forecast window – expect a surge in Biryani demand`,
      sub: 'Festival Signal · High Confidence',
      body: `${festEvt.label || 'Festival'} is one of the biggest demand drivers for biryanis across Bengaluru. Historical data shows a <strong>42–55% spike</strong> in Biryani orders on ${festEvt.date || 'festival day'} and a 38% uplift the day after.`,
      impacts: hasBiryani
        ? [{label:'Chicken Biryani ↑55%', up:true}, {label:'Mutton Biryani ↑52%', up:true}]
        : [{label:'High impact on Biryani dishes', up:true}],
      recc: '<strong>Action:</strong> Stock up on Basmati Rice and Chicken 2 days ahead. Consider preparing base gravy in advance. Schedule extra kitchen staff for the morning shift.',
    });
  }

  if (hasSports) {
    insights.push({
      cls:'ic-sport', icon:'🏏',
      title: `IPL Match on ${sportsEvt.date || 'upcoming date'} – delivery orders will spike`,
      sub: 'Sports Event Signal · High Confidence',
      body: 'IPL evening matches (6:30 PM start) drive a <strong>30–40% increase in delivery orders</strong> between 6–10 PM. Dine-in may drop slightly as customers prefer watching at home.',
      impacts: [{label:'Delivery orders ↑38%', up:true}, {label:'Dine-in ↓12%', up:false}],
      recc: '<strong>Action:</strong> Increase delivery-ready packaging stock. Ensure top Swiggy/Zomato dishes are fully prepped by 5:30 PM. Consider running a "Match Day Combo" promotion.',
    });
  }

  if (hasFifa) {
    const { mult }   = getFifaMultiplier(topFifa.ds);
    const pct        = Math.round((mult - 1) * 100);
    const stageStr   = FIFA_STAGE_LABEL[topFifa.stage] || topFifa.stage;
    const teamStr    = (topFifa.teams || []).filter(t => t !== 'TBD').join(', ') || 'Popular teams';
    const confPct    = Math.round((topFifa.confidence || 0) * 100);
    const istFactor  = topFifa.istFactor ?? 1.0;

    // Human-readable IST kickoff window based on istFactor
    const istTimeLabel = istFactor >= 0.80 ? '9:30–10:30 PM IST'
                       : istFactor >= 0.20 ? '12:30–1:30 AM IST'
                       : istFactor >= 0.05 ? '2:30–4:00 AM IST'
                       :                     '3:30 AM IST or later';

    const matchDow    = new Date(topFifa.ds).getDay();
    const isWeakDow   = matchDow === 1 || matchDow === 2;
    const isStrongDow = matchDow === 3 || matchDow === 4 || matchDow === 6;
    const dowName     = DOW_NAMES[matchDow];

    let fifaTitle, fifaBody, fifaImpacts, fifaRecc;

    if (istFactor < 0.10) {
      // Kickoff at very poor IST time — minimal/no restaurant impact
      fifaTitle = `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — kickoff at ${istTimeLabel}, minimal India impact`;
      fifaBody  = `${teamStr} play on ${topFifa.date}, but the kickoff falls at <strong>${istTimeLabel}</strong> — ` +
                  `well past Bengaluru dining hours. No significant walk-in viewing demand is expected. ` +
                  `Plan staffing and prep quantities normally for this day.`;
      fifaImpacts = [{ label:'Kickoff past India dining hours', up:false }];
      fifaRecc  = `<strong>Note:</strong> This match is at ${istTimeLabel}. No screen-event prep needed — it won't drive walk-in traffic during dinner service.`;

    } else if (istFactor < 0.45) {
      // Late-night kickoff — partial uplift from hardcore fans and late-night orders
      fifaTitle = `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — late kickoff (${istTimeLabel}), limited uplift`;
      fifaBody  = `${teamStr} play on ${topFifa.date} with a kickoff at <strong>${istTimeLabel}</strong>. ` +
                  `Hardcore fans may extend their evening, but group walk-in demand will be significantly lower than a prime-time match. ` +
                  `Expect a modest <strong>+${pct}% uplift</strong> above normal ${dowName} levels — primarily late-night delivery and bar traffic.`;
      fifaImpacts = [
        { label:`+${pct}% (late-night, reduced)`, up:true },
        { label:'Late-night delivery uptick',      up:true },
      ];
      fifaRecc  = `<strong>Action:</strong> No need to rearrange seating for group viewing. Ensure delivery packaging is stocked for late orders on ${topFifa.date}. ` +
                  `Don't cut kitchen staff too early — some late-night walk-ins possible.`;

    } else {
      // Prime or near-prime IST time — full screen-viewing surge expected
      if (isWeakDow) {
        fifaTitle = `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — ${dowName} demand elevated above normal`;
        fifaBody  = `${teamStr} ${topFifa.stage === 'group' ? 'play' : 'compete'} on ${topFifa.date} (${dowName}). ` +
                    `${dowName} is typically a quieter day, but the <strong>${istTimeLabel}</strong> kickoff will drive a ` +
                    `<strong>+${pct}% uplift above normal ${dowName} levels</strong> — particularly for starters, biryani, and group tables.`;
      } else if (isStrongDow) {
        fifaTitle = `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — amplifies an already-strong ${dowName}`;
        fifaBody  = `${teamStr} ${topFifa.stage === 'group' ? 'play' : 'compete'} on ${topFifa.date} (${dowName}), ` +
                    `which is already a high-footfall day. The <strong>${istTimeLabel}</strong> kickoff will push demand ` +
                    `<strong>+${pct}% above what ${dowName} would normally deliver</strong> — expect an unusually busy evening.`;
      } else {
        fifaTitle = `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — expect a group-viewing surge`;
        fifaBody  = `${teamStr} ${topFifa.stage === 'group' ? 'play' : 'compete'} on ${topFifa.date}. ` +
                    `Kickoff at <strong>${istTimeLabel}</strong> is peak dinner and group-viewing time. ` +
                    `Comparable screen-venue events show a <strong>+${pct}% demand uplift</strong> above the normal level for this day.`;
      }
      fifaImpacts = [
        { label:`+${pct}% vs normal ${dowName}`, up:true },
        { label:'Starters & biryani ↑',          up:true },
        { label:'Group table bookings ↑',         up:true },
      ];
      fifaRecc = `<strong>Action:</strong> Switch all screens to FIFA coverage from 9 PM IST on ${topFifa.date}. ` +
                 'Promote a "Match Day Platter" (starter combo + biryani). Pre-assign large tables for group bookings. ' +
                 'Stock extra starters and beverages for sharing orders.';
    }

    insights.push({
      cls:'ic-sport', icon:'⚽',
      title: fifaTitle,
      sub: `FIFA 2026 World Cup Signal · ${confPct}% Confidence`,
      body: fifaBody,
      impacts: fifaImpacts,
      recc: fifaRecc,
    });
  }

  if (hasWeather) {
    insights.push({
      cls:'ic-weather', icon:'🌧️',
      title: `Rain forecast on ${weatherEvt.date || 'upcoming date'} – dine-in demand will soften`,
      sub: 'Weather Signal · Medium Confidence',
      body: 'Moderate rain is forecast for Bengaluru. Historical weather data shows dine-in orders <strong>drop 30–35%</strong> on rainy evenings, while delivery sees a 15–20% uptick.',
      impacts: [{label:'Dine-in ↓32%', up:false}, {label:'Delivery ↑18%', up:true}],
      recc: '<strong>Action:</strong> Reduce prep quantities for dine-in dishes by 25%. Boost delivery packaging. Consider a "Rainy Day Special" combo for delivery platforms.',
    });
  }

  // ── LLM-POWERED INSIGHTS (Claude Haiku) ─────────────────────────────────────
  // Generates context-aware income/trend/risk cards using the actual forecast data.
  // Falls back to static cards silently if the API key is absent or the call fails.
  let llmCards = null;
  try {
    llmCards = await generateLLMInsights(dishIds, startDate, forecastData, branch);
  } catch (e) {
    console.error('[AnnaData] Haiku insight generation failed – using static fallback:', e.message);
  }

  if (llmCards && Array.isArray(llmCards) && llmCards.length >= 3) {
    insights.push(...llmCards.slice(0, 3));
  } else {
    // ── Static fallback (no API key, or Haiku call failed) ───────────────────
    insights.push({
      cls:'ic-pay', icon:'💰',
      title: 'Payday weekend effect – premium dishes will see uplift',
      sub: 'Income Cycle Signal · Medium Confidence',
      body: 'Customers tend to order <strong>25–30% more premium dishes</strong> in the first two weeks of the month after salary credit.',
      impacts: hasButterChicken
        ? [{label:'Butter Chicken ↑25%', up:true}, {label:'Premium dishes ↑20%', up:true}]
        : [{label:'Premium dishes ↑20%', up:true}, {label:'Avg ticket size ↑18%', up:true}],
      recc: '<strong>Action:</strong> Ensure premium ingredients (cashews, cream, high-quality paneer) are fully stocked. A good time to trial new premium dish adds.',
    });

    insights.push({
      cls:'ic-trend', icon:'📈',
      title: 'Dessert demand trending up – 3-week high expected',
      sub: 'Historical Trend Signal · High Confidence',
      body: hasGulabJamun
        ? 'Gulab Jamun has seen a steady 3-week demand increase at this branch, currently running <strong>18% above its 60-day average</strong>. Festival week is likely to sustain this.'
        : 'Dessert orders have been on a 3-week upward trend at this branch, running <strong>18% above the 60-day average</strong>. Festival week is likely to sustain this.',
      impacts: [{label:'Desserts ↑18%', up:true}, {label:'Seasonal trend', up:true}],
      recc: '<strong>Action:</strong> Pre-prepare dessert bases (milk reduction for Kheer, dough for Gulab Jamun) to avoid kitchen bottlenecks during peak service.',
    });

    insights.push({
      cls:'ic-alert', icon:'⚠️',
      title: 'Mid-period lull expected from Day 6 onwards',
      sub: 'Income Cycle Signal · Medium Confidence',
      body: 'Demand typically softens toward the end of the forecast window as the monthly salary cycle hits its mid-month low. Expect a <strong>15–20% dip</strong> in premium dish ordering relative to any festival peaks.',
      impacts: [{label:'Overall demand ↓17%', up:false}, {label:'Premium dishes ↓22%', up:false}],
      recc: '<strong>Action:</strong> Avoid over-ordering perishable ingredients for the final forecast days. Plan for smaller batch preparation and consider a "Happy Hours" offer to sustain traffic.',
    });
  }

  return insights;
}

/** Tomorrow's date as YYYY-MM-DD — used as default startDate when none is supplied */
function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
}

// ── NETLIFY HANDLER ───────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const params   = event.queryStringParameters || {};
  const endpoint = (params.endpoint || '').toLowerCase();

  const ok  = (data)    => ({ statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) });
  const err = (msg, st) => ({ statusCode: st || 400, headers: CORS_HEADERS, body: JSON.stringify({ error: msg }) });

  try {
    switch (endpoint) {

      // ── GET /api?endpoint=branches ─────────────────────────────────────────
      case 'branches':
        return ok({ branches: BRANCHES });

      // ── GET /api?endpoint=menu ─────────────────────────────────────────────
      case 'menu':
        return ok({ menu: MENU, categories: ['All','Starters','Main - Non Veg','Main - Veg','Breads','Rice','Desserts'] });

      // ── GET /api?endpoint=forecast&branch=kor&dishes=11,12&days=7&startDate=... ──
      case 'forecast': {
        const branchId  = params.branch || 'kor';
        const dishIds   = params.dishes
          ? params.dishes.split(',').map(Number).filter(Boolean)
          : MENU.map(m => m.id);
        const days      = Math.min(7, Math.max(1, parseInt(params.days) || 7));
        const startDate = params.startDate || tomorrowISO();

        const data = computeForecast(branchId, dishIds, days, startDate);
        return ok({ ...data, generatedAt: new Date().toISOString() });
      }

      // ── GET /api?endpoint=bom&branch=kor&dishes=11,12&days=7&startDate=... ──
      case 'bom': {
        const branchId  = params.branch || 'kor';
        const dishIds   = params.dishes
          ? params.dishes.split(',').map(Number).filter(Boolean)
          : MENU.map(m => m.id);
        const days      = Math.min(7, Math.max(1, parseInt(params.days) || 7));
        const startDate = params.startDate || tomorrowISO();

        const { forecast } = computeForecast(branchId, dishIds, days, startDate);
        const vendorMap    = buildBOM(dishIds, forecast);
        return ok({ bom: vendorMap, vendors: VENDORS, generatedAt: new Date().toISOString() });
      }

      // ── GET /api?endpoint=insights&branch=kor&dishes=11,12&startDate=... ──
      case 'insights': {
        const branchId  = params.branch || 'kor';
        const dishIds   = params.dishes
          ? params.dishes.split(',').map(Number).filter(Boolean)
          : MENU.map(m => m.id);
        const startDate = params.startDate || tomorrowISO();
        const branch       = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
        const forecastData = computeForecast(branchId, dishIds, 7, startDate);
        const insights     = await buildInsights(dishIds, startDate, forecastData, branch);
        return ok({ insights, generatedAt: new Date().toISOString() });
      }

      default:
        return err(`Unknown endpoint "${endpoint}". Valid: branches, menu, forecast, bom, insights`);
    }
  } catch (e) {
    console.error('[AnnaData API]', e);
    return err(e.message, 500);
  }
};
