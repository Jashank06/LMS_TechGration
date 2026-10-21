import { db } from "@/server/db"
import { getCourseLeaderboard } from "@/server/services/leaderboard"
import { RewardClaimStatus } from "@prisma/client"

export interface SwagRewardItem {
  id: string
  title: string
  subtitle: string
  tagline: string
  category:
    | "Apparel & Wearables"
    | "Apparel & Headwear"
    | "Tech Gear & Accessories"
    | "Audio & Electronics"
    | "Lifestyle & Desk"
  retailValue: string
  badgeText: string
  image: string
  alternativeImage?: string
  accentColor: string
  highlights: string[]
  specs: { label: string; value: string }[]
  options: {
    name: string
    key: string
    choices: string[]
    defaultChoice: string
  }[]
}

export const SWAG_CATALOG: SwagRewardItem[] = [
  {
    id: "techgration-tshirt",
    title: "TechGration Developer Signature T-Shirt",
    subtitle: "Heavyweight 240 GSM French Terry Cotton",
    tagline: "Custom-tailored developer apparel featuring minimalist silicone chest crest and high-density typographic back art.",
    category: "Apparel & Wearables",
    retailValue: "₹1,999",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/Techgration Front and Back T-Shirt Mockup.png",
    alternativeImage: "/rewards/techgration-tshirt.png",
    accentColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-500",
    highlights: [
      "240 GSM 100% Super-combed French Terry Cotton",
      "Tactile 3D Silicon TechGration Monogram Crest on Chest",
      "Engineered for Tech & Growth high-density back artwork",
      "Bio-washed, pre-shrunk fabric with reinforced dual stitching",
    ],
    specs: [
      { label: "Fabric", value: "240 GSM French Terry Cotton" },
      { label: "Fit", value: "Modern Relaxed Unisex Fit" },
      { label: "Crest", value: "Micro-injected Silicone" },
      { label: "Wash Care", value: "Machine Wash Cold, Inside Out" },
    ],
    options: [
      {
        name: "Size",
        key: "size",
        choices: ["S (38\")", "M (40\")", "L (42\")", "XL (44\")", "XXL (46\")"],
        defaultChoice: "L (42\")",
      },
      {
        name: "Color",
        key: "color",
        choices: ["Midnight Obsidian Black", "Deep Tech Navy"],
        defaultChoice: "Midnight Obsidian Black",
      },
    ],
  },
  {
    id: "techgration-hoodie",
    title: "TechGration Founder Edition Heavyweight Hoodie",
    subtitle: "380 GSM Brushed Fleece · Metallic Aglets · Cyan Accent Interior",
    tagline: "Ultra-premium heavyweight cotton fleece hoodie featuring embroidered TechGration crest, custom laser-etched metal aglets, and contrast cyan-lined hood.",
    category: "Apparel & Wearables",
    retailValue: "₹3,499",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/techgration-hoodie.png",
    alternativeImage: "/rewards/Techgration Founder Edition Hoodie Showcase.png",
    accentColor: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    highlights: [
      "380 GSM Ultra-Dense 100% Combed Cotton Brushed Fleece",
      "Dual-Tone Lined Hood with Vibrant TechGration Cyan Interior",
      "High-Definition 3D Tactile Chest Monogram & Sleeve Art",
      "Custom Anodized Metal Drawstring Aglets with Laser TG Branding",
      "Deep Kangaroo Pocket with Reinforced Bar-Tack Stitching",
    ],
    specs: [
      { label: "Fabric", value: "380 GSM Heavyweight Cotton Fleece" },
      { label: "Fit", value: "Tailored Relaxed Drop-Shoulder Fit" },
      { label: "Hood", value: "Double-Layer Contoured with Cyan Lining" },
      { label: "Hardware", value: "Anodized Aluminum Tips & Eyelets" },
      { label: "Care", value: "Cold Gentle Wash, Tumble Dry Low" },
    ],
    options: [
      {
        name: "Size",
        key: "size",
        choices: ["S (38\")", "M (40\")", "L (42\")", "XL (44\")", "XXL (46\")"],
        defaultChoice: "L (42\")",
      },
      {
        name: "Colorway",
        key: "color",
        choices: ["Obsidian Stealth Black with Cyan Lining"],
        defaultChoice: "Obsidian Stealth Black with Cyan Lining",
      },
    ],
  },
  {
    id: "techgration-backpack",
    title: "TechGration Impact Armor Developer Backpack",
    subtitle: "1680D Ballistic Cordura · 16\" Suspended Laptop Cradle · Water Resistant",
    tagline: "Engineered for modern engineers & creators. Features 3-zone smart tech organization, TSA-friendly lay-flat laptop bay, and ergonomic air-mesh lumbar support.",
    category: "Tech Gear & Accessories",
    retailValue: "₹4,499",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/techgration-backpack.png",
    alternativeImage: "/rewards/TechGration Backpack_ Built for Impact.png",
    accentColor: "from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-400",
    highlights: [
      "Heavy-Duty 1680D Water-Repellent Ballistic Nylon Exterior",
      "Shock-Suspended Cradle Fits Up to 16\" MacBook Pro & Laptops",
      "Ergonomic Honeycomb Air-Mesh Back Ventilation & S-Curve Straps",
      "Custom Molded TG Pullers with Smooth Reversed Weatherproof Zips",
      "Dedicated Quick-Access Tech Hub for Chargers, Cables, & Phone",
      "Expandable Reinforced Elastic Side Water Bottle / Flask Pocket",
    ],
    specs: [
      { label: "Capacity", value: "28 Liters Multi-Compartment" },
      { label: "Laptop Fit", value: "Up to 16\" Dedicated Suspended Sleeve" },
      { label: "Material", value: "1680D Water-Repellent Ballistic Nylon" },
      { label: "Zippers", value: "Weatherproof Reversed YKK Silent Pulls" },
      { label: "Ergonomics", value: "Breathable Honeycomb Air-Flow Channels" },
    ],
    options: [
      {
        name: "Compartment Size",
        key: "size",
        choices: ["Standard 28L Edition (Fits up to 16\" Laptop)"],
        defaultChoice: "Standard 28L Edition (Fits up to 16\" Laptop)",
      },
      {
        name: "Colorway",
        key: "color",
        choices: ["Matte Stealth Black with Cyan Accents"],
        defaultChoice: "Matte Stealth Black with Cyan Accents",
      },
    ],
  },
  {
    id: "techgration-cap",
    title: "TechGration Signature Athletic Cap",
    subtitle: "Structured 6-Panel Studio Showcase",
    tagline: "Classic low-profile baseball cap with high-density 3D embossed embroidery, custom brass buckle, and sweat-wicking band.",
    category: "Apparel & Headwear",
    retailValue: "₹1,299",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/Techgration Cap Studio Showcase.png",
    alternativeImage: "/rewards/techgration-cap.png",
    accentColor: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-500",
    highlights: [
      "Premium 6-Panel Structured Crown with fused buckram",
      "3D Tactile High-Definition Monogram Embroidery",
      "Custom Laser-Engraved Antique Brass Buckle Closure",
      "Internal Moisture-Wicking Performance Sweatband",
    ],
    specs: [
      { label: "Material", value: "100% Heavy Brushed Cotton Twill" },
      { label: "Panels", value: "6 Structured Panels with Eyelets" },
      { label: "Closure", value: "Antique Brass Tuck-in Buckle" },
      { label: "Sizing", value: "Universal Adjustable (54-62 cm)" },
    ],
    options: [
      {
        name: "Fit & Size",
        key: "size",
        choices: ["Universal Adjustable One-Size"],
        defaultChoice: "Universal Adjustable One-Size",
      },
      {
        name: "Colorway",
        key: "color",
        choices: ["Stealth Pitch Black", "Carbon Heather"],
        defaultChoice: "Stealth Pitch Black",
      },
    ],
  },
  {
    id: "techgration-sleeve",
    title: "TechGration Armor Pro Laptop Sleeve",
    subtitle: "Military-Grade 900D Ballistic Nylon",
    tagline: "Rugged protection with 360-degree corner shock absorption, plush velvet interior, and waterproof YKK reverse zippers.",
    category: "Tech Gear & Accessories",
    retailValue: "₹2,499",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/TechGration Laptop Sleeve Showcase.png",
    alternativeImage: "/rewards/techgration-sleeve.png",
    accentColor: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-500",
    highlights: [
      "Military-Grade 900D Water-Repellent Ballistic Nylon",
      "360-Degree CornerAir Shock Absorbing Perimeter Bumper",
      "Ultra-Soft Velvet Scratch-Proof Interior Lining",
      "Dual Front Expansion Zipper Pockets for Charger & Cables",
    ],
    specs: [
      { label: "Exterior", value: "900D Ballistic Cordura Nylon" },
      { label: "Interior", value: "Velvet Fleece + High-Density Foam" },
      { label: "Zippers", value: "Waterproof YKK Smooth Glide" },
      { label: "Water Resistance", value: "IPX3 Splash & Spill Proof" },
    ],
    options: [
      {
        name: "Laptop Dimension",
        key: "size",
        choices: ["13-14\" MacBook / Slim Ultrabook", "15-16\" MacBook Pro / Large Laptop"],
        defaultChoice: "13-14\" MacBook / Slim Ultrabook",
      },
      {
        name: "Finish",
        key: "color",
        choices: ["Matte Graphite Slate"],
        defaultChoice: "Matte Graphite Slate",
      },
    ],
  },
  {
    id: "techgration-bottle",
    title: "TechGration Insulated Pro Hydration Bottle",
    subtitle: "18/8 Pro-Grade Stainless Steel · 24H Cold / 12H Hot · 750ml",
    tagline: "Double-wall vacuum insulated flask designed to keep your focus fueled through long coding sprints. 100% leak-proof with custom carry loop.",
    category: "Lifestyle & Desk",
    retailValue: "₹1,499",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/techgration-bottle.png",
    alternativeImage: "/rewards/TechGration Hydration Bottle Showcase.png",
    accentColor: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400",
    highlights: [
      "Pro-Grade 18/8 Double-Wall Vacuum Insulated Stainless Steel",
      "Temperature Retention: Keeps Cold for 24 Hours / Hot for 12 Hours",
      "100% Leak-Proof Sports Spout Lid with Ergonomic Carry Handle",
      "Pure Taste: Non-Toxic, BPA-Free, No Metallic Aftertaste",
      "Laser-Engraved 'Fueling Brighter Minds' Base Typography",
      "Powder-Coated Sweat-Proof Matte Grip Exterior",
    ],
    specs: [
      { label: "Volume", value: "750 ml (25.4 oz)" },
      { label: "Insulation", value: "Dual-Wall Vacuum TempShield" },
      { label: "Material", value: "Food-Grade 18/8 Stainless Steel" },
      { label: "Lid", value: "Leak-Proof Loop Cap with Quick Sip Mouth" },
      { label: "Safety", value: "100% BPA, BPS, & Phthalate Free" },
    ],
    options: [
      {
        name: "Capacity",
        key: "size",
        choices: ["750 ml Insulated Flask"],
        defaultChoice: "750 ml Insulated Flask",
      },
      {
        name: "Finish",
        key: "color",
        choices: ["Matte Obsidian with TechGration Cyan Graphics"],
        defaultChoice: "Matte Obsidian with TechGration Cyan Graphics",
      },
    ],
  },
  {
    id: "techgration-mug",
    title: "TechGration 'Good Code, Better Coffee' Ceramic Mug",
    subtitle: "350ml Matte Black Ceramic · High-Gloss Cyan Glaze Interior",
    tagline: "Premium weighted ceramic barista mug crafted for early morning builds and late-night debugging. Features vivid contrast interior and laser-etched motto.",
    category: "Lifestyle & Desk",
    retailValue: "₹899",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/techgration-mug.png",
    alternativeImage: "/rewards/Techgration Mug_ Good Code, Better Coffee.png",
    accentColor: "from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400",
    highlights: [
      "High-Density Kiln-Fired Ceramic with Matte Black Outer Shell",
      "Lustrous Electric Cyan Glazed Interior Rim & Handle Accent",
      "'Good Code, Better Coffee' Inspiring Developer Studio Artwork",
      "Subtle Laser-Engraved 'Fueling Brighter Minds' Base Detail",
      "Microwave & Dishwasher Safe Durable Lead-Free Construction",
    ],
    specs: [
      { label: "Volume", value: "350 ml (11.8 oz)" },
      { label: "Material", value: "Grade-A High-Fired Ceramic" },
      { label: "Finish", value: "Matte Exterior / Gloss Glaze Interior" },
      { label: "Ergonomics", value: "Comfort-Grip 3-Finger Balanced Handle" },
      { label: "Care", value: "Microwave & Dishwasher Safe" },
    ],
    options: [
      {
        name: "Size",
        key: "size",
        choices: ["Standard Barista 350ml"],
        defaultChoice: "Standard Barista 350ml",
      },
      {
        name: "Colorway",
        key: "color",
        choices: ["Matte Black with Radiant Cyan Interior"],
        defaultChoice: "Matte Black with Radiant Cyan Interior",
      },
    ],
  },
  {
    id: "boat-rockerz-headphones",
    title: "boAt Rockerz 550 Over-Ear Wireless Headphones",
    subtitle: "50mm Dynamic Drivers · 20H Playback · Physical Noise Isolation",
    tagline: "Immersive deep bass over-ear wireless headphones with custom 50mm dynamic drivers, plush memory-foam earcups, and dual wireless/AUX connectivity.",
    category: "Audio & Electronics",
    retailValue: "₹4,990",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/boat-rockerz-headphones.png",
    accentColor: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400",
    highlights: [
      "Massive 50mm Dynamic Bionic Drivers delivering signature boAt sound",
      "Up to 20 Hours of Continuous Non-Stop Wireless Playback",
      "Plush Ergonomic Memory-Foam Earcups for immersive passive noise cancellation",
      "Dual Mode Connectivity: Bluetooth v5.0 with Instant AUX 3.5mm fallback",
      "Integrated HD Microphone & Smooth Multifunction Ear-Cup Controls",
      "Ultra-Flexible Foldable Swivel Design with Padded Cushion Headband",
    ],
    specs: [
      { label: "Driver Size", value: "50 mm Dynamic Drivers" },
      { label: "Battery Playback", value: "Up to 20 Hours (500 mAh battery)" },
      { label: "Connectivity", value: "Bluetooth v5.0 + 3.5mm AUX Wired Mode" },
      { label: "Charging", value: "Type-C Fast Charging (100% in 90 mins)" },
      { label: "Ear Cushions", value: "Breathable Ergonomic Memory Foam" },
    ],
    options: [
      {
        name: "Colorway",
        key: "color",
        choices: ["Matte Obsidian Black", "Army Green", "Raging Red"],
        defaultChoice: "Matte Obsidian Black",
      },
    ],
  },
  {
    id: "boat-earbuds",
    title: "boAt Airdopes Pro True Wireless Earbuds",
    subtitle: "13mm Dynamic Drivers · ENx Quad Mics · 42H Battery",
    tagline: "Studio acoustic tuning with Beast Mode low latency for live sessions, ENx crystal clear mics, and ASAP lightning fast charge.",
    category: "Audio & Electronics",
    retailValue: "₹3,990",
    badgeText: "🏆 #1 Champion Exclusive",
    image: "/rewards/boat-airdopes.png",
    accentColor: "from-red-500/20 to-rose-500/20 border-red-500/30 text-rose-500",
    highlights: [
      "13mm Bionic Drivers tuned for high-fidelity bass and vocal clarity",
      "Quad ENx AI Environmental Noise Cancellation Technology",
      "ASAP Fast Charge: 5 Minutes Charge = 60 Minutes Playback",
      "Beast Mode Low Latency (50ms) for smooth video playback & viva",
    ],
    specs: [
      { label: "Battery Playback", value: "Up to 42 Hours (Earbuds + Case)" },
      { label: "Fast Charging", value: "Type-C ASAP Charge (5 min = 60 min)" },
      { label: "Bluetooth", value: "Bluetooth v5.3 with IWP Instant Pair" },
      { label: "Water Resistance", value: "IPX4 Sweat & Splash Resistance" },
    ],
    options: [
      {
        name: "Colorway",
        key: "color",
        choices: ["Active Carbon Black", "Royal Cobalt Blue", "Frost White"],
        defaultChoice: "Active Carbon Black",
      },
    ],
  },
]

export interface StudentRewardEligibility {
  isEligible: boolean
  isChampion: boolean
  championCourse: { id: string; title: string } | null
  currentRank: number | null
  totalEnrolled: number
  topMarks: number
  myMarks: number
  marksGap: number
  courses: Array<{
    id: string
    title: string
    rank: number | null
    isChampion: boolean
    marks: number
    topMarks: number
  }>
}

export interface ClaimWithCourse {
  id: string
  rewardId: string
  rewardTitle: string
  selectedOption: string
  status: RewardClaimStatus
  trackingCode: string | null
  courier: string | null
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  claimedAt: Date
  courseTitle: string
}

/**
 * Checks a student's leaderboard rank across all enrolled courses
 * and determines if they qualify for the Champion Swag reward.
 */
export async function getStudentRewardStatus(studentId: string): Promise<{
  eligibility: StudentRewardEligibility
  claims: ClaimWithCourse[]
}> {
  const enrollments = await db.enrollment.findMany({
    where: {
      userId: studentId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  })

  const courseStatuses: StudentRewardEligibility["courses"] = []
  let championCourse: { id: string; title: string } | null = null
  let bestRank: number | null = null
  let bestMarks = 0
  let bestTopMarks = 0

  for (const e of enrollments) {
    const lb = await getCourseLeaderboard(e.course.id, {
      id: studentId,
      isStaff: false,
    })

    if (!lb) continue

    const myEntry = lb.ranked.find((r) => r.userId === studentId)
    const isRankOne = lb.ranked.length > 0 && lb.ranked[0]?.userId === studentId
    const currentCourseRank = myEntry?.rank ?? null
    const myCourseMarks = myEntry?.totalMarks ?? 0
    const topCourseMarks = lb.stats.topMarks

    if (isRankOne && !championCourse) {
      championCourse = { id: e.course.id, title: e.course.title }
    }

    if (currentCourseRank !== null) {
      if (bestRank === null || currentCourseRank < bestRank) {
        bestRank = currentCourseRank
        bestMarks = myCourseMarks
        bestTopMarks = topCourseMarks
      }
    }

    courseStatuses.push({
      id: e.course.id,
      title: e.course.title,
      rank: currentCourseRank,
      isChampion: isRankOne,
      marks: myCourseMarks,
      topMarks: topCourseMarks,
    })
  }

  const isEligible = Boolean(championCourse)

  // Fetch student's existing claims
  const rawClaims = await db.rewardClaim.findMany({
    where: { userId: studentId },
    include: { course: { select: { title: true } } },
    orderBy: { claimedAt: "desc" },
  })

  const claims: ClaimWithCourse[] = rawClaims.map((c) => ({
    id: c.id,
    rewardId: c.rewardId,
    rewardTitle: c.rewardTitle,
    selectedOption: c.selectedOption,
    status: c.status,
    trackingCode: c.trackingCode,
    courier: c.courier,
    shippingName: c.shippingName,
    shippingPhone: c.shippingPhone,
    shippingAddress: c.shippingAddress,
    shippingCity: c.shippingCity,
    shippingState: c.shippingState,
    shippingPincode: c.shippingPincode,
    claimedAt: c.claimedAt,
    courseTitle: c.course.title,
  }))

  return {
    eligibility: {
      isEligible,
      isChampion: isEligible,
      championCourse,
      currentRank: bestRank,
      totalEnrolled: enrollments.length,
      topMarks: bestTopMarks,
      myMarks: bestMarks,
      marksGap: Math.max(0, bestTopMarks - bestMarks),
      courses: courseStatuses,
    },
    claims,
  }
}
