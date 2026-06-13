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
const DOW_MULT = [1.00, 0.72, 0.68, 1.55, 1.40, 0.88, 1.15];

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
// Only matches whose noon kickoff in North America (EDT/CDT) falls during IST
// prime dinner (9:30–10:30 PM IST).  Group G (all PDT venues) is excluded.
// confidence = probability that a popular-team match actually hits IST dinner.
//
// tier 0 = Super (T1 vs T1, knockouts only)     stage = group|r16|qf|sf|final
// tier 1 = Argentina, Brazil
// tier 2 = France, Portugal, Spain, England
// tier 3 = Germany, Mexico
// On dates with multiple popular teams, highest tier (lowest number) is pre-resolved.
const FIFA_EVENTS = {
  // ── GROUP STAGE ──────────────────────────────────────────────────────────────
  '2026-06-11': { teams:['Mexico'],                         tier:3, stage:'group', confidence:0.85 },
  '2026-06-13': { teams:['Brazil'],                         tier:1, stage:'group', confidence:1.00 },
  '2026-06-14': { teams:['Germany'],                        tier:3, stage:'group', confidence:0.80 },
  '2026-06-15': { teams:['Spain'],                          tier:2, stage:'group', confidence:0.85 },
  '2026-06-16': { teams:['Argentina','France'],             tier:1, stage:'group', confidence:0.80 },
  '2026-06-17': { teams:['Brazil','England'],               tier:1, stage:'group', confidence:1.00 },
  '2026-06-18': { teams:['Mexico'],                         tier:3, stage:'group', confidence:0.85 },
  '2026-06-19': { teams:['Germany'],                        tier:3, stage:'group', confidence:0.80 },
  '2026-06-20': { teams:['Spain'],                          tier:2, stage:'group', confidence:0.85 },
  '2026-06-21': { teams:['France'],                         tier:2, stage:'group', confidence:1.00 },
  '2026-06-22': { teams:['Argentina','England'],            tier:1, stage:'group', confidence:0.80 },
  '2026-06-24': { teams:['Brazil'],                         tier:1, stage:'group', confidence:1.00 },
  '2026-06-25': { teams:['Mexico','Germany'],               tier:3, stage:'group', confidence:0.83 },
  '2026-06-26': { teams:['Spain','France'],                 tier:2, stage:'group', confidence:0.93 },
  '2026-06-27': { teams:['Argentina','England','Portugal'], tier:1, stage:'group', confidence:0.80 },
  // ── ROUND OF 16 (placeholder dates — popular teams projected) ────────────────
  '2026-07-04': { teams:['TBD'], tier:2, stage:'r16',   confidence:0.60 },
  '2026-07-05': { teams:['TBD'], tier:1, stage:'r16',   confidence:0.65 },
  '2026-07-06': { teams:['TBD'], tier:2, stage:'r16',   confidence:0.60 },
  '2026-07-07': { teams:['TBD'], tier:1, stage:'r16',   confidence:0.65 },
  // ── QUARTER-FINALS ────────────────────────────────────────────────────────────
  '2026-07-09': { teams:['TBD'], tier:1, stage:'qf',    confidence:0.70 },
  '2026-07-10': { teams:['TBD'], tier:2, stage:'qf',    confidence:0.65 },
  '2026-07-11': { teams:['TBD'], tier:1, stage:'qf',    confidence:0.70 },
  // ── SEMI-FINALS ───────────────────────────────────────────────────────────────
  '2026-07-14': { teams:['TBD'], tier:1, stage:'sf',    confidence:0.80 },
  '2026-07-15': { teams:['TBD'], tier:1, stage:'sf',    confidence:0.80 },
  // ── FINAL ─────────────────────────────────────────────────────────────────────
  '2026-07-19': { teams:['TBD'], tier:0, stage:'final', confidence:0.90 },
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
  // Confidence-weighted blend: 1.0 at confidence=0, rawMult at confidence=1.0
  const mult    = parseFloat((1.0 + (rawMult - 1.0) * evt.confidence).toFixed(3));

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

      let mult = DOW_MULT[dow] * branchFactor;
      if (evt.overallMult)  mult *= evt.overallMult;
      if (BIRYANI_IDS.has(dishId) && evt.biryaniBoost) mult *= evt.biryaniBoost;
      if (fifa.flag) mult *= fifa.mult;                // FIFA 2026 group-viewing boost

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

/** Generate contextual AI insights */
function buildInsights(dishIds, startDate) {
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
  fifaWindow.sort((a, b) => a.tier - b.tier); // tier 0 = super = most important first
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
    const { mult }  = getFifaMultiplier(topFifa.ds);
    const pct       = Math.round((mult - 1) * 100);
    const stageStr  = FIFA_STAGE_LABEL[topFifa.stage] || topFifa.stage;
    const teamStr   = (topFifa.teams || []).filter(t => t !== 'TBD').join(', ') || 'Popular teams';
    const confPct   = Math.round((topFifa.confidence || 0) * 100);
    insights.push({
      cls:'ic-sport', icon:'⚽',
      title: `FIFA 2026 ${stageStr} (${teamStr}) on ${topFifa.date} — expect a group-viewing surge`,
      sub: `FIFA 2026 World Cup Signal · ${confPct}% Confidence`,
      body: `${teamStr} ${topFifa.stage === 'group' ? 'play' : 'compete'} on ${topFifa.date}. ` +
            'Matches kicking off at noon EDT/CDT fall at <strong>9:30–10:30 PM IST</strong> — peak dinner and group-viewing time. ' +
            `Comparable screen-venue events show a <strong>+${pct}% demand uplift</strong> during broadcast windows.`,
      impacts: [
        { label:`Overall demand +${pct}%`,       up:true },
        { label:'Group table bookings ↑',         up:true },
        { label:'Starters & sharing plates ↑',    up:true },
      ],
      recc: `<strong>Action:</strong> Switch all screens to FIFA coverage from 9 PM IST on ${topFifa.date}. ` +
            'Promote a "Match Day Platter" (starter combo + biryani). Pre-assign large tables for group bookings. ' +
            'Stock extra starters and beverages for sharing orders.',
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
        const dishIds   = params.dishes
          ? params.dishes.split(',').map(Number).filter(Boolean)
          : MENU.map(m => m.id);
        const startDate = params.startDate || tomorrowISO();
        const insights  = buildInsights(dishIds, startDate);
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
