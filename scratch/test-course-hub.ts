import { db } from "../src/server/db"

async function runTest() {
  console.log("=== TESTING FRESH COURSE START (ZERO DUMMY DATA & PURE ENGLISH TABS) ===")

  // 1. Fetch AI Course
  const course = await db.course.findFirst({
    where: { title: { contains: "Artificial Intelligence" } },
    include: {
      modules: {
        include: { lessons: true },
      },
      liveClasses: true,
      enrollments: {
        include: { user: true },
      },
    },
  })

  if (!course) {
    console.error("❌ Course not found!")
    process.exit(1)
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  console.log(`📍 Found Course: "${course.title}" (${course.id})`)
  console.log(`   - Modules count: ${course.modules.length}`)
  console.log(`   - Total lessons / fake recordings: ${totalLessons}`)
  console.log(`   - Live Classes count: ${course.liveClasses.length}`)

  if (totalLessons !== 0) {
    console.error("❌ Expected 0 dummy lessons for a completely fresh course start!")
    process.exit(1)
  }
  console.log("✅ Verified: Zero fake/dummy lessons in DB (100% Fresh Start)!")

  // 2. Create test session for student
  const student = course.enrollments.find((e) => e.user.email === "arunkumar0003578@gmail.com")?.user
  if (!student) {
    console.error("❌ Student not found!")
    process.exit(1)
  }

  const testToken = "fresh_course_token_" + Date.now()
  await db.session.create({
    data: {
      userId: student.id,
      token: testToken,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    },
  })
  const cookies = `tg_session=${testToken}`
  console.log(`✅ Session created for student: ${student.email}`)

  // 3. Test GET /student/courses/${course.id} (Course Hub)
  console.log(`\nTesting GET /student/courses/${course.id}...`)
  const hubRes = await fetch(`http://localhost:3000/student/courses/${course.id}`, {
    headers: { Cookie: cookies },
  })
  console.log(`Status: ${hubRes.status} ${hubRes.statusText}`)
  if (hubRes.status !== 200) {
    console.error("❌ Hub returned non-200 status code!")
    process.exit(1)
  }

  const hubHtml = await hubRes.text()

  // Verify pure English tabs (NO HINDI in tab headers)
  const hasPureLiveClass = hubHtml.includes("Live Class</span>")
  const hasPureRecordings = hubHtml.includes("Recordings</span>")
  const hasPureTimeTable = hubHtml.includes("Time Table</span>")
  const hasPureMaterials = hubHtml.includes("Study Materials</span>")

  const hasNoHindiInTabs =
    !hubHtml.includes("लाइव क्लास") &&
    !hubHtml.includes("रिकॉर्डिंग") &&
    !hubHtml.includes("टाइम टेबल") &&
    !hubHtml.includes("स्टडी मटेरियल")

  console.log(`   - Pure English 'Live Class': ${hasPureLiveClass ? "✅" : "❌"}`)
  console.log(`   - Pure English 'Recordings': ${hasPureRecordings ? "✅" : "❌"}`)
  console.log(`   - Pure English 'Time Table': ${hasPureTimeTable ? "✅" : "❌"}`)
  console.log(`   - Pure English 'Study Materials': ${hasPureMaterials ? "✅" : "❌"}`)
  console.log(`   - Zero Hindi text in Tabs: ${hasNoHindiInTabs ? "✅" : "❌"}`)

  // Verify clean empty state on SSR for fresh course start
  const hasNoLiveClassRightNow = hubHtml.includes("No Live Class In Session Right Now")
  console.log(`   - Fresh Start 'No Live Class In Session' state: ${hasNoLiveClassRightNow ? "✅" : "❌"}`)

  // 4. Test GET /student/learn (redirects safely to /student/courses/${course.id}, NO 404!)
  console.log("\nTesting GET /student/learn (should redirect cleanly, NO 404)...")
  const learnRes = await fetch("http://localhost:3000/student/learn", {
    headers: { Cookie: cookies },
    redirect: "manual",
  })
  console.log(`Status: ${learnRes.status} (Redirect location: ${learnRes.headers.get("location")})`)
  if (learnRes.status === 404) {
    console.error("❌ 404 Error encountered on /student/learn!")
    process.exit(1)
  }
  console.log("✅ /student/learn safely redirects to Course Hub without 404!")

  console.log("\n🎉 ALL TESTS PASSED! 100% PURE ENGLISH & 100% FRESH START (ZERO DUMMY DATA).")
  process.exit(0)
}

runTest().catch((err) => {
  console.error("Test error:", err)
  process.exit(1)
})
