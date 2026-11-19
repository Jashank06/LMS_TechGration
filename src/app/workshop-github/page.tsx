import type { Metadata } from "next"
import { WorkshopGithubClient } from "./workshop-github-client"

export const metadata: Metadata = {
  title: "Master GitHub Workshop Recording — TechGration",
  description:
    "Watch the full recording of TechGration's hands-on Master GitHub Workshop. Learn Version Control, Git Commands, Team Collaboration, and Developer Portfolio Building.",
  openGraph: {
    title: "Master GitHub Workshop Recording — TechGration",
    description:
      "Watch the complete hands-on recording of TechGration's Master GitHub Workshop. Master Git, GitHub collaboration, branching, and portfolio building.",
    url: "https://campus.techgration.live/workshop-github",
    siteName: "TechGration LMS",
    images: [
      {
        url: "https://campus.techgration.live/posters/master-github-workshop-nov18.jpg",
        width: 935,
        height: 1024,
        alt: "TechGration Master GitHub Workshop Recording",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Master GitHub Workshop Recording — TechGration",
    description:
      "Watch the complete hands-on recording of TechGration's Master GitHub Workshop.",
    images: ["https://campus.techgration.live/posters/master-github-workshop-nov18.jpg"],
  },
}

export default function WorkshopGithubPage() {
  return <WorkshopGithubClient />
}
