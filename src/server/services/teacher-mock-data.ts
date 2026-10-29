export interface TeacherProfile {
  id: string
  name: string
  email: string
  role: "TEACHER" | "ADMIN"
  avatarUrl: string
  headline: string
  department: string
  totalStudents: number
  totalCourses: number
  rating: number
}

export interface TeacherCourse {
  id: string
  code: string
  slug: string
  title: string
  subtitle: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS"
  format: "SELF_PACED" | "LIVE_INTERACTIVE" | "HYBRID"
  description: string
  thumbnailUrl: string
  promoVideoUrl?: string
  durationHours: number
  enrolledCount: number
  rating: number
  isPublished: boolean
  approvalStatus: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  outcomes: string[]
  prerequisites: string[]
  updatedAt: string
  modules: TeacherModule[]
}

export interface TeacherModule {
  id: string
  courseId: string
  title: string
  description?: string
  position: number
  lessons: TeacherLesson[]
}

export interface TeacherLesson {
  id: string
  moduleId: string
  title: string
  slug: string
  type: "VIDEO" | "READING" | "QUIZ" | "ASSIGNMENT"
  durationSec: number
  position: number
  videoUrl?: string
  content?: string
  isPreview: boolean
  resources: {
    id: string
    title: string
    fileUrl: string
    fileSize: string
    fileType: string
  }[]
}

export interface TeacherLiveClass {
  id: string
  courseId: string
  courseTitle: string
  courseCode: string
  title: string
  description?: string
  instructorName: string
  startsAt: string
  endsAt: string
  timezone: string
  platform: "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "CUSTOM"
  meetingUrl: string
  meetingPasscode?: string
  meetingId?: string | null
  recordingUrl?: string | null
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
  enrolledCount: number
  attendedCount?: number
}

export interface StudentAttendanceRecord {
  userId: string
  name: string
  email: string
  avatarUrl: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  markedAt: string
  reason?: string
}

export interface AttendanceAuditLog {
  id: string
  classId: string
  studentName: string
  changedBy: string
  previousStatus: string
  newStatus: string
  reason: string
  timestamp: string
}

export interface TeacherAssignment {
  id: string
  courseId: string
  courseTitle: string
  title: string
  instructions: string
  maxMarks: number
  dueAt: string
  totalSubmissions: number
  gradedSubmissions: number
  pendingGrading: number
  averageScore: number
  submissions: TeacherSubmission[]
}

export interface TeacherSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar: string
  submittedAt: string
  isLate: boolean
  latePenaltyPct: number
  status: "SUBMITTED" | "IN_REVIEW" | "GRADED"
  studentNotes: string
  submittedCodeSnippet?: string
  codeLanguage?: string
  attachedFiles: { name: string; url: string; size: string }[]
  marksAwarded?: number
  feedback?: string
  gradedAt?: string
  rubricScores: { criterion: string; score: number; maxScore: number }[]
}

export interface EnrolledStudentItem {
  id: string
  name: string
  email: string
  avatarUrl: string
  enrolledCourses: string[]
  overallProgressPct: number
  attendancePct: number
  lastActive: string
  daysInactive: number
  failedQuizzesCount: number
  missingAssignmentsCount: number
  supportFlags: string[]
  academicHealth: "HEALTHY" | "NEEDS_SUPPORT" | "AT_RISK"
}

// Current In-Memory State
class TeacherDataStore {
  public teacherProfile: TeacherProfile = {
    id: "teacher-vikram-01",
    name: "Dr. Vikram Joshi",
    email: "jaykumar0305@gmail.com",
    role: "TEACHER",
    avatarUrl: "/brand/avatar-vikram.png",
    headline: "Lead Enterprise Architect & Senior Cloud Instructor",
    department: "Cloud Engineering & Distributed Systems",
    totalStudents: 342,
    totalCourses: 4,
    rating: 4.92,
  }

  public courses: TeacherCourse[] = [
    {
      id: "course-1",
      code: "TG-CS401",
      slug: "cloud-architecture-kubernetes-microservices",
      title: "Cloud Architecture & Kubernetes Microservices",
      subtitle: "Production-grade orchestration, GitOps workflows, and zero-downtime rollouts.",
      category: "Cloud Engineering",
      level: "ADVANCED",
      format: "HYBRID",
      description:
        "Comprehensive deep-dive into Kubernetes infrastructure, multi-cluster architectures, service mesh traffic management with Istio, and GitOps deployments with ArgoCD.",
      thumbnailUrl: "/brand/og-image.png",
      promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationHours: 32,
      enrolledCount: 148,
      rating: 4.95,
      isPublished: true,
      approvalStatus: "APPROVED",
      outcomes: [
        "Design multi-region active-active cloud topologies",
        "Implement production Kubernetes cluster hardening",
        "Configure automated CI/CD pipelines with ArgoCD",
        "Set up real-time observability using Prometheus and Grafana",
      ],
      prerequisites: [
        "Solid foundation in Docker & container primitives",
        "Basic Linux systems and networking experience",
      ],
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      modules: [
        {
          id: "mod-1-1",
          courseId: "course-1",
          title: "Module 1: Production Container Topologies",
          description: "Container design patterns and multi-stage builds",
          position: 1,
          lessons: [
            {
              id: "les-1-1-1",
              moduleId: "mod-1-1",
              title: "1.1 Multi-Stage Docker Builds & Distroless Containers",
              slug: "multi-stage-docker-builds",
              type: "VIDEO",
              durationSec: 1240,
              position: 1,
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              content: "In this lesson, we break down production container optimizations and vulnerability reduction.",
              isPreview: true,
              resources: [
                {
                  id: "res-1",
                  title: "distroless-dockerfile.yaml",
                  fileUrl: "#",
                  fileSize: "24 KB",
                  fileType: "yaml",
                },
              ],
            },
            {
              id: "les-1-1-2",
              moduleId: "mod-1-1",
              title: "1.2 Container Security Scanning with Trivy",
              slug: "container-security-scanning",
              type: "READING",
              durationSec: 900,
              position: 2,
              content: "Step-by-step guide on incorporating Trivy static vulnerability scanning in pre-commit hooks.",
              isPreview: false,
              resources: [],
            },
          ],
        },
        {
          id: "mod-1-2",
          courseId: "course-1",
          title: "Module 2: Kubernetes Control Plane & Networking",
          description: "Cluster architecture, CNI plugins, and network policies",
          position: 2,
          lessons: [
            {
              id: "les-1-2-1",
              moduleId: "mod-1-2",
              title: "2.1 Calico vs Cilium: High-Throughput eBPF Networking",
              slug: "cni-plugins-ebpf",
              type: "VIDEO",
              durationSec: 1560,
              position: 1,
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              content: "Exploring Cilium eBPF packet routing and kernel level bypass techniques.",
              isPreview: false,
              resources: [],
            },
            {
              id: "les-1-2-2",
              moduleId: "mod-1-2",
              title: "2.2 Cluster Security Hardening Benchmark",
              slug: "cluster-security-hardening",
              type: "ASSIGNMENT",
              durationSec: 3600,
              position: 2,
              content: "Configure RBAC, Pod Security Standards, and Network Policies for a banking microservice.",
              isPreview: false,
              resources: [],
            },
          ],
        },
      ],
    },
    {
      id: "course-2",
      code: "TG-FE302",
      slug: "nextjs-16-enterprise-fullstack-engineering",
      title: "Next.js 16 Enterprise Full-Stack Engineering",
      subtitle: "React Server Components, Async Request APIs, Turbopack, and Distributed Caching.",
      category: "Full-Stack Development",
      level: "INTERMEDIATE",
      format: "HYBRID",
      description:
        "Master Next.js 16 breaking updates, Server Actions security, dynamic searchParams promises, streaming SSR, and edge deployment architectures.",
      thumbnailUrl: "/brand/og-image.png",
      promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      durationHours: 24,
      enrolledCount: 112,
      rating: 4.88,
      isPublished: true,
      approvalStatus: "APPROVED",
      outcomes: [
        "Architect scalable Next.js applications using RSC paradigm",
        "Implement secure Server Actions with Zod and CSRF defense",
        "Optimize Core Web Vitals to 100 on Google Lighthouse",
      ],
      prerequisites: ["Proficiency in React 19 and Modern TypeScript"],
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      modules: [
        {
          id: "mod-2-1",
          courseId: "course-2",
          title: "Module 1: Next.js 16 Runtime Foundations",
          description: "Async params, Turbopack, and build optimizations",
          position: 1,
          lessons: [
            {
              id: "les-2-1-1",
              moduleId: "mod-2-1",
              title: "1.1 Migrating to Next.js 16 Async Request APIs",
              slug: "async-request-apis-migration",
              type: "VIDEO",
              durationSec: 1080,
              position: 1,
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              content: "Detailed walkthrough of awaiting cookies(), params, and searchParams.",
              isPreview: true,
              resources: [],
            },
          ],
        },
      ],
    },
    {
      id: "course-3",
      code: "TG-SEC501",
      slug: "zero-trust-cybersecurity-devsecops",
      title: "Zero-Trust Cybersecurity & DevSecOps",
      subtitle: "Identity governance, mTLS, secret rotation, and automated compliance pipelines.",
      category: "Security",
      level: "ADVANCED",
      format: "HYBRID",
      description:
        "Implement modern zero-trust enterprise architecture, mutual TLS with HashiCorp Vault, and continuous vulnerability triage in CI/CD pipelines.",
      thumbnailUrl: "/brand/og-image.png",
      durationHours: 28,
      enrolledCount: 54,
      rating: 4.9,
      isPublished: false,
      approvalStatus: "PENDING_APPROVAL",
      outcomes: [
        "Build automated secret rotation with Vault and Kubernetes",
        "Enforce zero-trust network segmentation",
      ],
      prerequisites: ["Understanding of cryptography and public key infrastructure"],
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      modules: [
        {
          id: "mod-3-1",
          courseId: "course-3",
          title: "Module 1: Principles of Zero-Trust Architecture",
          position: 1,
          lessons: [
            {
              id: "les-3-1-1",
              moduleId: "mod-3-1",
              title: "1.1 Beyond Identity: Dynamic Attestation",
              slug: "dynamic-attestation",
              type: "READING",
              durationSec: 1200,
              position: 1,
              content: "Cryptographic device and user attestation protocols.",
              isPreview: true,
              resources: [],
            },
          ],
        },
      ],
    },
    {
      id: "course-4",
      code: "TG-SYS601",
      slug: "scalable-distributed-systems-kafka",
      title: "Scalable Distributed Systems & Kafka",
      subtitle: "Event-driven microservices, exactly-once semantics, and partition scaling.",
      category: "Backend Engineering",
      level: "ADVANCED",
      format: "SELF_PACED",
      description: "Designing fault-tolerant streaming systems using Apache Kafka, Debezium CDC, and ClickHouse.",
      thumbnailUrl: "/brand/og-image.png",
      durationHours: 20,
      enrolledCount: 28,
      rating: 4.85,
      isPublished: false,
      approvalStatus: "DRAFT",
      outcomes: ["Implement event-driven CQRS architectures"],
      prerequisites: ["Java or Go systems development experience"],
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      modules: [],
    },
  ]

  public liveClasses: TeacherLiveClass[] = [
    {
      id: "class-1",
      courseId: "course-1",
      courseTitle: "Cloud Architecture & Kubernetes Microservices",
      courseCode: "TG-CS401",
      title: "Enterprise Kubernetes Cluster Hardening & RBAC Audit",
      description: "Live hands-on lab on CIS benchmarks, network policy configurations, and admission controllers.",
      instructorName: "Dr. Vikram Joshi",
      startsAt: new Date(Date.now() + 3600000 * 3).toISOString(),
      endsAt: new Date(Date.now() + 3600000 * 4.5).toISOString(),
      timezone: "Asia/Kolkata",
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/98421092842",
      meetingPasscode: "K8S-SEC-2026",
      status: "SCHEDULED",
      enrolledCount: 42,
    },
    {
      id: "class-2",
      courseId: "course-2",
      courseTitle: "Next.js 16 Enterprise Full-Stack Engineering",
      courseCode: "TG-FE302",
      title: "Server Actions Security & Async Request API Deep Dive",
      description: "Interactive session solving real production migration challenges in Next.js 16.",
      instructorName: "Dr. Vikram Joshi",
      startsAt: new Date(Date.now() + 3600000 * 24).toISOString(),
      endsAt: new Date(Date.now() + 3600000 * 25.5).toISOString(),
      timezone: "Asia/Kolkata",
      platform: "GOOGLE_MEET",
      meetingUrl: "https://meet.google.com/tg-next-2026",
      status: "SCHEDULED",
      enrolledCount: 38,
    },
    {
      id: "class-3",
      courseId: "course-1",
      courseTitle: "Cloud Architecture & Kubernetes Microservices",
      courseCode: "TG-CS401",
      title: "Service Mesh Observability with Istio & Jaeger",
      description: "Distributed tracing across microservices and latency anomaly detection.",
      instructorName: "Dr. Vikram Joshi",
      startsAt: new Date(Date.now() + 3600000 * 72).toISOString(),
      endsAt: new Date(Date.now() + 3600000 * 73.5).toISOString(),
      timezone: "Asia/Kolkata",
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/84102948210",
      status: "SCHEDULED",
      enrolledCount: 45,
    },
    {
      id: "class-past-1",
      courseId: "course-1",
      courseTitle: "Cloud Architecture & Kubernetes Microservices",
      courseCode: "TG-CS401",
      title: "Container Networking & CoreDNS Troubleshooting",
      description: "Packet tracing through veth pairs, iptables, and CoreDNS lookups.",
      instructorName: "Dr. Vikram Joshi",
      startsAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      endsAt: new Date(Date.now() - 3600000 * 46.5).toISOString(),
      timezone: "Asia/Kolkata",
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/84102948210",
      status: "COMPLETED",
      enrolledCount: 40,
      attendedCount: 36,
    },
  ]

  public attendanceRecords: Record<string, StudentAttendanceRecord[]> = {
    "class-past-1": [
      {
        userId: "std-1",
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
      },
      {
        userId: "std-2",
        name: "Aanya Sharma",
        email: "aanya.sharma@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
      },
      {
        userId: "std-3",
        name: "Rohan Kulkarni",
        email: "rohan.k@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
        status: "LATE",
        markedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
        reason: "Joined 20 mins late due to internet reconnection",
      },
      {
        userId: "std-4",
        name: "Priya Nair",
        email: "priya.nair@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
        status: "ABSENT",
        markedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
      },
      {
        userId: "std-5",
        name: "Karan Singhania",
        email: "karan.s@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
        status: "EXCUSED",
        markedAt: new Date(Date.now() - 3600000 * 47).toISOString(),
        reason: "Medical leave approved by admin",
      },
    ],
    "class-1": [
      {
        userId: "std-1",
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date().toISOString(),
      },
      {
        userId: "std-2",
        name: "Aanya Sharma",
        email: "aanya.sharma@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date().toISOString(),
      },
      {
        userId: "std-3",
        name: "Rohan Kulkarni",
        email: "rohan.k@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date().toISOString(),
      },
      {
        userId: "std-4",
        name: "Priya Nair",
        email: "priya.nair@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
        status: "ABSENT",
        markedAt: new Date().toISOString(),
      },
      {
        userId: "std-5",
        name: "Karan Singhania",
        email: "karan.s@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
        status: "PRESENT",
        markedAt: new Date().toISOString(),
      },
    ],
  }

  public auditLogs: AttendanceAuditLog[] = [
    {
      id: "log-1",
      classId: "class-past-1",
      studentName: "Rohan Kulkarni",
      changedBy: "Dr. Vikram Joshi",
      previousStatus: "ABSENT",
      newStatus: "LATE",
      reason: "Confirmed student joined via chat log after network outage",
      timestamp: new Date(Date.now() - 3600000 * 46).toISOString(),
    },
    {
      id: "log-2",
      classId: "class-past-1",
      studentName: "Karan Singhania",
      changedBy: "Dr. Vikram Joshi",
      previousStatus: "ABSENT",
      newStatus: "EXCUSED",
      reason: "Medical certificate verified by department",
      timestamp: new Date(Date.now() - 3600000 * 45).toISOString(),
    },
  ]

  public assignments: TeacherAssignment[] = [
    {
      id: "assign-1",
      courseId: "course-1",
      courseTitle: "Cloud Architecture & Kubernetes Microservices",
      title: "Lab 3: Hardening Pod Security Standards & RBAC Roles",
      instructions:
        "Submit your manifests for a restricted pod security profile, along with a least-privilege RoleBinding that restricts access to the payment namespace. Include verification commands using 'kubectl auth can-i'.",
      maxMarks: 100,
      dueAt: new Date(Date.now() + 3600000 * 18).toISOString(),
      totalSubmissions: 36,
      gradedSubmissions: 22,
      pendingGrading: 14,
      averageScore: 84.5,
      submissions: [
        {
          id: "sub-1",
          assignmentId: "assign-1",
          studentId: "std-1",
          studentName: "Rahul Verma",
          studentEmail: "rahul.verma@example.com",
          studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
          submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          isLate: false,
          latePenaltyPct: 0,
          status: "SUBMITTED",
          studentNotes:
            "I've configured PodSecurityAdmission at 'restricted' level with audit mode on 'baseline'. All container images are strictly non-root with read-only root filesystems.",
          codeLanguage: "yaml",
          submittedCodeSnippet: `apiVersion: v1
kind: Namespace
metadata:
  name: payment-production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: payment-production
  name: payment-operator
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "update"]`,
          attachedFiles: [
            { name: "restricted-security-manifests.yaml", url: "#", size: "32 KB" },
            { name: "test-auth-verify.log", url: "#", size: "14 KB" },
          ],
          rubricScores: [
            { criterion: "Pod Security Adherence", score: 30, maxScore: 30 },
            { criterion: "Least-Privilege RBAC Configuration", score: 25, maxScore: 30 },
            { criterion: "Manifest Modularity & Cleanliness", score: 18, maxScore: 20 },
            { criterion: "Verification Evidence & Logs", score: 18, maxScore: 20 },
          ],
        },
        {
          id: "sub-2",
          assignmentId: "assign-1",
          studentId: "std-2",
          studentName: "Aanya Sharma",
          studentEmail: "aanya.sharma@example.com",
          studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
          submittedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
          isLate: false,
          latePenaltyPct: 0,
          status: "SUBMITTED",
          studentNotes:
            "Included custom NetworkPolicies denying ingress from non-payment namespaces and egress to external IP ranges except DNS.",
          codeLanguage: "yaml",
          submittedCodeSnippet: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: isolate-payment-traffic
  namespace: payment-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          tier: api-gateway`,
          attachedFiles: [{ name: "network-policy-spec.yaml", url: "#", size: "18 KB" }],
          rubricScores: [
            { criterion: "Pod Security Adherence", score: 28, maxScore: 30 },
            { criterion: "Least-Privilege RBAC Configuration", score: 28, maxScore: 30 },
            { criterion: "Manifest Modularity & Cleanliness", score: 19, maxScore: 20 },
            { criterion: "Verification Evidence & Logs", score: 19, maxScore: 20 },
          ],
        },
        {
          id: "sub-3",
          assignmentId: "assign-1",
          studentId: "std-3",
          studentName: "Rohan Kulkarni",
          studentEmail: "rohan.k@example.com",
          studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
          submittedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          isLate: true,
          latePenaltyPct: 10,
          status: "GRADED",
          studentNotes: "Submitted 2 hours after deadline due to cluster provisioning issues.",
          codeLanguage: "yaml",
          submittedCodeSnippet: `apiVersion: v1
kind: Pod
metadata:
  name: hardened-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001`,
          attachedFiles: [{ name: "rbac-setup.yaml", url: "#", size: "12 KB" }],
          marksAwarded: 82,
          feedback: "Good security context configuration. -10% late penalty applied per policy.",
          gradedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          rubricScores: [
            { criterion: "Pod Security Adherence", score: 28, maxScore: 30 },
            { criterion: "Least-Privilege RBAC Configuration", score: 26, maxScore: 30 },
            { criterion: "Manifest Modularity & Cleanliness", score: 18, maxScore: 20 },
            { criterion: "Verification Evidence & Logs", score: 18, maxScore: 20 },
          ],
        },
      ],
    },
    {
      id: "assign-2",
      courseId: "course-2",
      courseTitle: "Next.js 16 Enterprise Full-Stack Engineering",
      title: "Project: Zero-Downtime Server Action Mutations",
      instructions: "Implement optimistic UI updates with Next.js 16 Server Actions and Zod parsing.",
      maxMarks: 100,
      dueAt: new Date(Date.now() + 3600000 * 72).toISOString(),
      totalSubmissions: 28,
      gradedSubmissions: 20,
      pendingGrading: 8,
      averageScore: 91.2,
      submissions: [],
    },
  ]

  public students: EnrolledStudentItem[] = [
    {
      id: "std-1",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      enrolledCourses: ["Cloud Architecture & Kubernetes Microservices", "Next.js 16 Enterprise"],
      overallProgressPct: 88,
      attendancePct: 96,
      lastActive: "15 minutes ago",
      daysInactive: 0,
      failedQuizzesCount: 0,
      missingAssignmentsCount: 0,
      supportFlags: ["Honor Roll", "Quick Grader"],
      academicHealth: "HEALTHY",
    },
    {
      id: "std-2",
      name: "Aanya Sharma",
      email: "aanya.sharma@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      enrolledCourses: ["Cloud Architecture & Kubernetes Microservices"],
      overallProgressPct: 92,
      attendancePct: 100,
      lastActive: "1 hour ago",
      daysInactive: 0,
      failedQuizzesCount: 0,
      missingAssignmentsCount: 0,
      supportFlags: ["Top Performer", "Perfect Attendance"],
      academicHealth: "HEALTHY",
    },
    {
      id: "std-3",
      name: "Rohan Kulkarni",
      email: "rohan.k@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      enrolledCourses: ["Cloud Architecture & Kubernetes Microservices"],
      overallProgressPct: 64,
      attendancePct: 78,
      lastActive: "2 days ago",
      daysInactive: 2,
      failedQuizzesCount: 1,
      missingAssignmentsCount: 1,
      supportFlags: ["Late Submitter"],
      academicHealth: "NEEDS_SUPPORT",
    },
    {
      id: "std-4",
      name: "Priya Nair",
      email: "priya.nair@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
      enrolledCourses: ["Cloud Architecture & Kubernetes Microservices"],
      overallProgressPct: 22,
      attendancePct: 45,
      lastActive: "14 days ago",
      daysInactive: 14,
      failedQuizzesCount: 2,
      missingAssignmentsCount: 3,
      supportFlags: ["Inactive for 14 days", "Low attendance (45%)", "At Risk of Failure"],
      academicHealth: "AT_RISK",
    },
    {
      id: "std-5",
      name: "Karan Singhania",
      email: "karan.s@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      enrolledCourses: ["Cloud Architecture & Kubernetes Microservices"],
      overallProgressPct: 58,
      attendancePct: 82,
      lastActive: "Yesterday",
      daysInactive: 1,
      failedQuizzesCount: 0,
      missingAssignmentsCount: 1,
      supportFlags: ["Medical Leave Logged"],
      academicHealth: "NEEDS_SUPPORT",
    },
  ]

  public analytics = {
    monthlyEnrollments: [
      { month: "May", enrollments: 42, activeStudents: 38 },
      { month: "Jun", enrollments: 68, activeStudents: 61 },
      { month: "Jul", enrollments: 95, activeStudents: 89 },
      { month: "Aug", enrollments: 142, activeStudents: 135 },
      { month: "Sep", enrollments: 210, activeStudents: 198 },
      { month: "Oct", enrollments: 342, activeStudents: 320 },
    ],
    courseCompletionRates: [
      { course: "K8s Microservices", completionRate: 78, inProgressRate: 18, dropRate: 4 },
      { course: "Next.js 16 Eng.", completionRate: 84, inProgressRate: 14, dropRate: 2 },
      { course: "Zero-Trust Security", completionRate: 69, inProgressRate: 25, dropRate: 6 },
      { course: "Kafka Distributed", completionRate: 62, inProgressRate: 30, dropRate: 8 },
    ],
    weeklyAttendance: [
      { session: "Sess 1", presentPct: 95, latePct: 3, absentPct: 2 },
      { session: "Sess 2", presentPct: 92, latePct: 5, absentPct: 3 },
      { session: "Sess 3", presentPct: 88, latePct: 8, absentPct: 4 },
      { session: "Sess 4", presentPct: 94, latePct: 4, absentPct: 2 },
      { session: "Sess 5", presentPct: 91, latePct: 6, absentPct: 3 },
      { session: "Sess 6", presentPct: 89, latePct: 7, absentPct: 4 },
      { session: "Sess 7", presentPct: 96, latePct: 2, absentPct: 2 },
    ],
    gradeDistribution: [
      { grade: "A (90-100%)", count: 58, fill: "#00D6D6" },
      { grade: "B (80-89%)", count: 72, fill: "#16A675" },
      { grade: "C (70-79%)", count: 34, fill: "#4A8DFF" },
      { grade: "D (60-69%)", count: 14, fill: "#E6A23C" },
      { grade: "F (<60%)", count: 6, fill: "#E05260" },
    ],
    gradingWorkload: [
      { week: "Week 1", submitted: 42, graded: 42, avgTurnaroundHours: 14 },
      { week: "Week 2", submitted: 56, graded: 54, avgTurnaroundHours: 18 },
      { week: "Week 3", submitted: 48, graded: 48, avgTurnaroundHours: 12 },
      { week: "Week 4", submitted: 62, graded: 48, avgTurnaroundHours: 24 },
    ],
  }
}

// Global Singleton for in-memory persistence during development session
const globalStore = globalThis as unknown as { __teacherStore?: TeacherDataStore }
export const teacherStore = globalStore.__teacherStore ?? new TeacherDataStore()
if (process.env.NODE_ENV !== "production") globalStore.__teacherStore = teacherStore
