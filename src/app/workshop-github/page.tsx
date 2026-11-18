import type { Metadata } from "next"
import { WorkshopGithubClient } from "./workshop-github-client"

export const metadata: Metadata = {
  title: "Master GitHub Live Workshop — TechGration",
  description:
    "Join TechGration's live hands-on Master GitHub Workshop today from 6:00 PM to 7:00 PM IST. Register quickly to enter the live Zoom session.",
  openGraph: {
    title: "Master GitHub Live Workshop — TechGration",
    description:
      "Learn Version Control, Team Collaboration, Project Management & Build a Dev Portfolio. Today 6:00 PM – 7:00 PM IST.",
    url: "https://campus.techgration.live/workshop-github",
    siteName: "TechGration LMS",
    images: [
      {
        url: "https://campus.techgration.live/posters/master-github-workshop-nov18.jpg",
        width: 935,
        height: 1024,
        alt: "TechGration Master GitHub Live Workshop",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Master GitHub Live Workshop — TechGration",
    description:
      "Join TechGration's live hands-on Master GitHub Workshop today (6:00 PM – 7:00 PM IST).",
    images: ["https://campus.techgration.live/posters/master-github-workshop-nov18.jpg"],
  },
}

export default function WorkshopGithubPage() {
  return <WorkshopGithubClient />
}
