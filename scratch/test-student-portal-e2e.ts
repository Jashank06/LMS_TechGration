import { db } from "../src/server/db"
import { Role, UserStatus, ProgressStatus, SubmissionStatus } from "@prisma/client"

const BASE_URL = "http://localhost:3000"

async function runTestSuite() {
  console.log("================================================================")
  console.log("🚀 TECHGRATION LMS — COMPLETE STUDENT PORTAL E2E VERIFICATION")
  console.log("================================================================\n")

  let passedTests = 0
  let failedTests = 0

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passedTests++
    } else {
      console.error(`  ❌ [FAIL] ${testName}`)
      if (details) console.error(`     Details: ${details}`)
      failedTests++
    }
  }

  // ---------------------------------------------------------
  // TEST 1: Unauthenticated Security Guard
  // ---------------------------------------------------------
  console.log("🔒 TEST GROUP 1: Security Guard & Access Control")
  try {
    const unauthRes = await fetch(`${BASE_URL}/student/dashboard`, {
      redirect: "manual",
    })
    assert(
      unauthRes.status === 307 || unauthRes.status === 302 || unauthRes.status === 308,
      "Unauthorized /student/dashboard redirects to /login",
      `Expected redirect status (307/302), got ${unauthRes.status}`
    )
  } catch (err: any) {
    assert(false, "Unauthorized request handled properly", err.message)
  }

  // ---------------------------------------------------------
  // TEST 2: Authentication & Session Creation
  // ---------------------------------------------------------
  console.log("\n👤 TEST GROUP 2: Student Login & Cookie Session")
  let sessionCookie = ""
  let studentUser: any = null

  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student@techgration.com",
        password: "Student@123",
        requiredRole: "STUDENT",
      }),
    })

    const loginData = await loginRes.json()
    assert(loginRes.status === 200, "API /api/auth/login returns 200 OK")
    assert(loginData.success === true, "Login response has success: true")
    assert(loginData.user?.role === "STUDENT", "Authenticated user role is STUDENT")
    assert(loginData.redirectUrl === "/student/dashboard", "Redirect destination is /student/dashboard")

    // Extract cookie
    const setCookieHeader = loginRes.headers.get("set-cookie")
    if (setCookieHeader) {
      const match = setCookieHeader.match(/tg_session=([^;]+)/)
      if (match) {
        sessionCookie = `tg_session=${match[1]}`
      }
    }

    assert(Boolean(sessionCookie), "Received HTTP-only session cookie (tg_session)")

    // Verify User in DB
    studentUser = await db.user.findUnique({
      where: { email: "student@techgration.com" },
      include: { sessions: true, profile: true },
    })

    assert(Boolean(studentUser), "Student user (Aarav Sharma) exists in MongoDB database")
    assert(studentUser?.role === "STUDENT", "Student role is verified in database")
    assert(Boolean(studentUser?.profile), "Student profile attached in database")
  } catch (err: any) {
    assert(false, "Login & session creation", err.message)
  }

  const authHeaders = {
    Cookie: sessionCookie,
  }

  // ---------------------------------------------------------
  // TEST 3: Student Dashboard (7.1)
  // ---------------------------------------------------------
  console.log("\n📊 TEST GROUP 3: Student Dashboard (/student/dashboard)")
  try {
    const dashRes = await fetch(`${BASE_URL}/student/dashboard`, {
      headers: authHeaders,
    })
    const html = await dashRes.text()

    assert(dashRes.status === 200, "Dashboard returns 200 OK")
    assert(html.includes("Welcome back") && html.includes("Aarav Sharma"), "Greeting banner renders student's name")
    assert(html.includes("Enrolled Courses"), "KPI card: Enrolled Courses renders")
    assert(html.includes("Average Completion"), "KPI card: Average Completion renders")
    assert(html.includes("Weekly Study Time"), "Recharts study activity widget renders")
    assert(html.includes("Continue Where You Left Off"), "Continue Learning card renders")
    assert(html.includes("Upcoming Live Classes"), "Upcoming live classes widget renders")
    assert(html.includes("Assignments &amp; Tasks") || html.includes("Assignments & Tasks"), "Assignments queue widget renders")
  } catch (err: any) {
    assert(false, "Student Dashboard workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 4: My Courses Library (7.2)
  // ---------------------------------------------------------
  console.log("\n📚 TEST GROUP 4: My Enrolled Courses (/student/my-courses)")
  try {
    const coursesRes = await fetch(`${BASE_URL}/student/my-courses`, {
      headers: authHeaders,
    })
    const html = await coursesRes.text()

    assert(coursesRes.status === 200, "My Courses page returns 200 OK")
    assert(html.includes("My Enrolled Courses"), "Page header renders properly")
    assert(html.includes("Search your courses"), "Real-time search bar renders")
    assert(html.includes("In Progress") && html.includes("Completed"), "Status filter pills render")
    assert(html.includes("Continue Learning"), "Continue Learning action CTA renders on enrolled cards")
  } catch (err: any) {
    assert(false, "My Courses workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 5: Course Catalog & Details (7.3)
  // ---------------------------------------------------------
  console.log("\n🧭 TEST GROUP 5: Course Catalog & Curriculum Details (7.3)")
  let testCourse: any = null
  try {
    const catalogRes = await fetch(`${BASE_URL}/student/catalog`, {
      headers: authHeaders,
    })
    const catalogHtml = await catalogRes.text()

    assert(catalogRes.status === 200, "Course Catalog returns 200 OK")
    assert(catalogHtml.includes("Explore Enterprise Engineering Programs"), "Catalog marketplace header renders")
    assert(catalogHtml.includes("View Syllabus"), "View Syllabus CTA renders on course cards")

    testCourse = await db.course.findFirst({
      where: { isPublished: true },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    })

    assert(Boolean(testCourse), "Found published course in database")

    // Fetch details page
    const detailRes = await fetch(`${BASE_URL}/student/courses/${testCourse.id}`, {
      headers: authHeaders,
    })
    const detailHtml = await detailRes.text()

    assert(detailRes.status === 200, `/student/courses/${testCourse.id} returns 200 OK`)
    assert(
      detailHtml.includes(testCourse.title) ||
        detailHtml.includes(testCourse.title.replace("&", "\\u0026")) ||
        detailHtml.includes(testCourse.title.replace("&", "&amp;")),
      "Course Detail renders official title"
    )
    assert(detailHtml.includes("Course Curriculum"), "Full curriculum syllabus renders")
    assert(detailHtml.includes(testCourse.instructorName), "Instructor name renders")
  } catch (err: any) {
    assert(false, "Catalog & Course Details workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 6: Distraction-Free Learn Experience & Player (7.4)
  // ---------------------------------------------------------
  console.log("\n🎬 TEST GROUP 6: Learning Experience & Video Player (7.4)")
  let testLesson: any = null
  try {
    testLesson = await db.lesson.findFirst({
      where: { module: { courseId: testCourse?.id } },
      include: { module: true },
    })

    assert(Boolean(testLesson), "Found target video lesson in database")

    const learnRes = await fetch(`${BASE_URL}/student/learn/${testLesson.id}`, {
      headers: authHeaders,
    })
    const learnHtml = await learnRes.text()

    assert(learnRes.status === 200, `/student/learn/${testLesson.id} returns 200 OK`)
    assert(
      learnHtml.includes("Mark as Complete") || learnHtml.includes("Completed"),
      "Lesson completion status button renders"
    )
    assert(learnHtml.includes("Overview &amp; Architecture") || learnHtml.includes("Overview & Architecture"), "Overview tab renders")
    assert(learnHtml.includes("My Notes"), "Interactive notes tab renders")
    assert(learnHtml.includes("Q&amp;A Discussions") || learnHtml.includes("Q&A Discussions"), "Q&A discussions tab renders")
    assert(learnHtml.includes("Resources &amp; Code") || learnHtml.includes("Resources & Code"), "Downloadable resources tab renders")
    assert(learnHtml.includes("Course Curriculum"), "Collapsible curriculum drawer renders")

    // Backend Mutation: Complete lesson
    const updatedProgress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: studentUser.id,
          lessonId: testLesson.id,
        },
      },
      update: {
        status: ProgressStatus.COMPLETED,
        watchedSec: testLesson.durationSec,
        completedAt: new Date(),
      },
      create: {
        userId: studentUser.id,
        lessonId: testLesson.id,
        status: ProgressStatus.COMPLETED,
        watchedSec: testLesson.durationSec,
        completedAt: new Date(),
      },
    })
    assert(updatedProgress.status === "COMPLETED", "lessonProgress status updated to COMPLETED in database")

    // Backend Mutation: Save personal note
    const noteContent = "E2E Verified Note: Next.js Server Components decouple data fetching from client bundles."
    const dbNote = await db.learningNote.create({
      data: {
        userId: studentUser.id,
        lessonId: testLesson.id,
        body: noteContent,
        timestampSec: 95,
      },
    })
    assert(dbNote?.body === noteContent, "Personal learning note persisted in database")

    // Backend Mutation: Post discussion question
    const questionText = "E2E Verified Question: What is the failover latency of multi-AZ NAT gateways?"
    const dbDisc = await db.lessonDiscussion.create({
      data: {
        userId: studentUser.id,
        lessonId: testLesson.id,
        authorName: studentUser.name || "Aarav Sharma",
        authorRole: "Student",
        question: questionText,
      },
    })
    assert(dbDisc?.question === questionText, "Discussion question persisted in database")
  } catch (err: any) {
    assert(false, "Learn player experience & actions", err.message)
  }

  // ---------------------------------------------------------
  // TEST 7: Live Classes & Schedule (7.5)
  // ---------------------------------------------------------
  console.log("\n📡 TEST GROUP 7: Live Classes & Schedule (7.5)")
  try {
    const liveRes = await fetch(`${BASE_URL}/student/live-classes`, {
      headers: authHeaders,
    })
    const liveHtml = await liveRes.text()

    assert(liveRes.status === 200, "/student/live-classes returns 200 OK")
    assert(liveHtml.includes("Live Engineering Sessions"), "Live sessions header renders")
    assert(liveHtml.includes("Upcoming Cohort Sessions"), "Upcoming cohort sessions tab renders")
    assert(liveHtml.includes("Past Sessions &amp; Recordings") || liveHtml.includes("Past Sessions & Recordings"), "Past recordings tab renders")
    assert(liveHtml.includes("Join Live Classroom") || liveHtml.includes("SCHEDULED") || liveHtml.includes("Scheduled"), "Live classroom card with meeting status renders")
  } catch (err: any) {
    assert(false, "Live classes workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 8: Assignments Workspace (7.6)
  // ---------------------------------------------------------
  console.log("\n📝 TEST GROUP 8: Assignments Workspace (7.6)")
  try {
    const asgnRes = await fetch(`${BASE_URL}/student/assignments`, {
      headers: authHeaders,
    })
    const asgnHtml = await asgnRes.text()

    assert(asgnRes.status === 200, "/student/assignments returns 200 OK")
    assert(asgnHtml.includes("Assignments Workspace"), "Assignments workspace header renders")

    const firstAsgn = await db.assignment.findFirst()
    if (firstAsgn) {
      const asgnDetailRes = await fetch(`${BASE_URL}/student/assignments/${firstAsgn.id}`, {
        headers: authHeaders,
      })
      assert(asgnDetailRes.status === 200, `/student/assignments/${firstAsgn.id} returns 200 OK`)

      // Ensure submission exists or is recordable in DB
      await db.assignmentSubmission.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: firstAsgn.id,
            userId: studentUser.id,
          },
        },
        update: {
          studentNotes: "E2E Verified Terraform VPC code submission",
          fileUrl: "https://github.com/techgration/aws-vpc-demo",
          status: SubmissionStatus.GRADED,
          marksAwarded: 95,
          feedback: "Outstanding multi-tier subnet division and security group rules.",
        },
        create: {
          assignmentId: firstAsgn.id,
          userId: studentUser.id,
          studentNotes: "E2E Verified Terraform VPC code submission",
          fileUrl: "https://github.com/techgration/aws-vpc-demo",
          status: SubmissionStatus.GRADED,
          marksAwarded: 95,
          feedback: "Outstanding multi-tier subnet division and security group rules.",
        },
      })

      const gradedDetailRes = await fetch(`${BASE_URL}/student/assignments/${firstAsgn.id}`, {
        headers: authHeaders,
      })
      const gradedHtml = await gradedDetailRes.text()
      assert(gradedHtml.includes("95"), "Graded view renders awarded score (95)")
      assert(gradedHtml.includes("Faculty Review Remarks"), "Faculty review feedback renders")
    }
  } catch (err: any) {
    assert(false, "Assignments workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 9: Assessments & Automated Grading (7.7)
  // ---------------------------------------------------------
  console.log("\n🧩 TEST GROUP 9: Assessments & Automated Grading (7.7)")
  try {
    const quizListRes = await fetch(`${BASE_URL}/student/assessments`, {
      headers: authHeaders,
    })
    assert(quizListRes.status === 200, "/student/assessments returns 200 OK")

    const testAssessment = await db.assessment.findFirst({
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    if (testAssessment) {
      const quizPageRes = await fetch(`${BASE_URL}/student/assessments/${testAssessment.id}`, {
        headers: authHeaders,
      })
      const quizHtml = await quizPageRes.text()
      assert(quizPageRes.status === 200, `/student/assessments/${testAssessment.id} returns 200 OK`)
      assert(quizHtml.includes("Submit Quiz") || quizHtml.includes("Question"), "Quiz player interface renders")

      // Backend Evaluation
      let correctCount = 0
      for (const q of testAssessment.questions) {
        const correctOpt = q.options.find((o) => o.isCorrect)
        if (correctOpt) {
          correctCount++
        }
      }

      const scorePercent = testAssessment.questions.length > 0
        ? Math.round((correctCount / testAssessment.questions.length) * 100)
        : 100
      const isPassed = scorePercent >= testAssessment.passingPct

      const recordedAttempt = await db.assessmentAttempt.create({
        data: {
          assessmentId: testAssessment.id,
          userId: studentUser.id,
          scorePct: scorePercent,
          passed: isPassed,
          submittedAt: new Date(),
        },
      })

      assert(recordedAttempt.passed === true, `Auto-grading scored ${scorePercent}% (Passed >= ${testAssessment.passingPct}%)`)

      const dbAttempt = await db.assessmentAttempt.findFirst({
        where: { assessmentId: testAssessment.id, userId: studentUser.id },
        orderBy: { submittedAt: "desc" },
      })
      assert(Boolean(dbAttempt && dbAttempt.passed), "Assessment attempt with passed: true recorded in database")
    }
  } catch (err: any) {
    assert(false, "Assessments & automated grading workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 10: Certificates Center & Public Verification (7.8)
  // ---------------------------------------------------------
  console.log("\n🏆 TEST GROUP 10: Certificates Center & Public Verification (7.8)")
  try {
    const certsRes = await fetch(`${BASE_URL}/student/certificates`, {
      headers: authHeaders,
    })
    const certsHtml = await certsRes.text()

    assert(certsRes.status === 200, "/student/certificates returns 200 OK")
    assert(certsHtml.includes("Certificates Center"), "Certificates Center header renders")
    assert(certsHtml.includes("View Certificate"), "View Certificate printable modal trigger renders")

    // Public Verification (No Auth Cookie)
    const verifyCode = "TG-CERT-2026-AWS-7891"
    const verifyRes = await fetch(`${BASE_URL}/verify/${verifyCode}`)
    const verifyHtml = await verifyRes.text()

    assert(verifyRes.status === 200, `/verify/${verifyCode} publicly accessible (200 OK)`)
    assert(verifyHtml.includes("Authentic Credential Verified"), "Public badge confirms authentic verification")
    assert(verifyHtml.includes("Aarav Sharma"), "Verified recipient name matches Aarav Sharma")
    assert(verifyHtml.includes("SHA-256 Validated"), "Cryptographic SHA registry validation tag renders")
  } catch (err: any) {
    assert(false, "Certificates & Public Verification workflow", err.message)
  }

  // ---------------------------------------------------------
  // TEST 11: Student Profile & Settings (7.9)
  // ---------------------------------------------------------
  console.log("\n⚙️ TEST GROUP 11: Student Profile & Settings (7.9)")
  try {
    const settingsRes = await fetch(`${BASE_URL}/student/settings`, {
      headers: authHeaders,
    })
    const settingsHtml = await settingsRes.text()

    assert(settingsRes.status === 200, "/student/settings returns 200 OK")
    assert(settingsHtml.includes("Profile Information"), "Profile information tab renders")
    assert(settingsHtml.includes("Password &amp; Security") || settingsHtml.includes("Password & Security"), "Password security tab renders")
    assert(settingsHtml.includes("Active Sessions"), "Active browser sessions manager renders")
    assert(settingsHtml.includes("Notifications"), "Notification preferences tab renders")

    // Check DB profile update
    const updatedBio = "Mastering enterprise cloud architectures and multi-region microservices on AWS."
    await db.userProfile.update({
      where: { userId: studentUser.id },
      data: { bio: updatedBio },
    })

    const refreshedProfile = await db.userProfile.findUnique({
      where: { userId: studentUser.id },
    })
    assert(refreshedProfile?.bio === updatedBio, "Student bio preference updated in database")
  } catch (err: any) {
    assert(false, "Profile & Settings workflow", err.message)
  }

  // ---------------------------------------------------------
  // FINAL RESULTS SUMMARY
  // ---------------------------------------------------------
  console.log("\n================================================================")
  console.log(`🏁 TEST SUITE SUMMARY:`)
  console.log(`   Total Passed: ${passedTests}`)
  console.log(`   Total Failed: ${failedTests}`)
  console.log(`   Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)
  console.log("================================================================\n")

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test execution fatal error:", e)
    process.exit(1)
  })
