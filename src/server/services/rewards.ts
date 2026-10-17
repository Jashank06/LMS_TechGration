import { db } from "@/server/db"
import { getCourseLeaderboard } from "@/server/services/leaderboard"
import { RewardClaimStatus } from "@prisma/client"

export interface SwagRewardItem {
  id: string
  title: string
  subtitle: string
  tagline: string
  category: "Apparel & Wearables" | "Apparel & Headwear" | "Tech Gear & Accessories" | "Audio & Electronics"
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
