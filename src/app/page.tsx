import { getCurrentUser } from "@/server/auth"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingCurriculum } from "@/components/landing/landing-curriculum"
import { LandingWhy } from "@/components/landing/landing-why"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export const metadata = {
  title: "TechGration LMS — Learning. Technology. Growth.",
  description:
    "Official Learning Management System of TechGration Technologies. Master modern cloud architecture, full-stack systems, and generative AI through live mentor-led cohorts and hands-on projects.",
}

export default async function HomePage() {
  const user = await getCurrentUser()

  const navUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.profile?.avatarUrl ?? null,
      }
    : null

  const heroUser = user
    ? {
        name: user.name,
        role: user.role,
      }
    : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand-teal/30 scroll-smooth">
      {/* 1. Frosted Glass Top Navigation */}
      <LandingNav user={navUser} />

      {/* Main Single-Page LMS Experience */}
      <main className="flex-1 w-full">
        {/* 2. Flagship Hero: TechGration Technologies LMS */}
        <LandingHero user={heroUser} />

        {/* 3. The TechGration Learning Experience (Live Classes, Labs, Quizzes, Leaderboard) */}
        <LandingFeatures />

        {/* 4. Live Enterprise Engineering Courses */}
        <LandingCurriculum />

        {/* 5. Why Students Choose TechGration Technologies */}
        <LandingWhy />

        {/* 6. High-Converting Call to Action Banner */}
        <LandingCta />
      </main>

      {/* 7. Minimalist Apple Footer */}
      <LandingFooter />
    </div>
  )
}
