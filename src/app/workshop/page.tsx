import type { Metadata } from "next"
import { WorkshopClient } from "./workshop-client"

export const metadata: Metadata = {
  title: "Python Fundamentals Workshop — TechGration Masterclass",
  description:
    "Watch the exclusive Python Fundamentals & Practical Software Engineering Masterclass recording. Register now to unlock full HD access with interactive topic milestones.",
  openGraph: {
    title: "Python Fundamentals Workshop — TechGration Masterclass",
    description:
      "Exclusive Masterclass on Python syntax, memory architecture, data structures, and practical engineering. Unlock the full session now.",
    url: "https://campus.techgration.live/workshop",
    siteName: "TechGration LMS",
    images: [
      {
        url: "https://res.cloudinary.com/dozazvcec/image/upload/v1792270601/techgration_lms/courses/6ad283b4e196d0b8fbfb9eae/timetable/timetable_1792270598486_ai_course_timetable_poster.png.png",
        width: 1200,
        height: 630,
        alt: "TechGration Python Fundamentals Workshop",
      },
    ],
    type: "video.other",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python Fundamentals Workshop — TechGration Masterclass",
    description:
      "Watch the exclusive Python Fundamentals Workshop recording with live code demonstrations and interactive topic chapters.",
  },
}

export default function WorkshopPage() {
  return <WorkshopClient />
}
