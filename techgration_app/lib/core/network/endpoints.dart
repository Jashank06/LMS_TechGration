class Endpoints {
  // Live Production Backend URL (or local development: http://localhost:3000)
  static const String baseUrl = 'https://campus.techgration.live';

  // Auth routes
  static const String login = '$baseUrl/api/auth/login';
  static const String sendOtp = '$baseUrl/api/auth/register/send-otp';
  static const String verifyOtp = '$baseUrl/api/auth/register/verify-otp';
  static const String me = '$baseUrl/api/auth/me';
  static const String logout = '$baseUrl/api/auth/logout';

  // Student portal routes (Synced with MongoDB Atlas)
  static const String studentDashboard = '$baseUrl/api/student/dashboard';
  static const String myCourses = '$baseUrl/api/student/my-courses';
  static const String liveClasses = '$baseUrl/api/student/live-classes';
  static const String assignments = '$baseUrl/api/student/assignments';
  static const String assessments = '$baseUrl/api/student/assessments';
  static const String certificates = '$baseUrl/api/student/certificates';
  static const String claimCertificate = '$baseUrl/api/student/certificates/claim';
  static const String rewards = '$baseUrl/api/student/rewards';
  static const String claimReward = '$baseUrl/api/student/rewards/claim';
  static const String interview = '$baseUrl/api/student/interview';
  static const String profile = '$baseUrl/api/student/profile';
  static const String updatePassword = '$baseUrl/api/student/profile/password';
  static const String notifications = '$baseUrl/api/student/notifications';
  static const String avatar = '$baseUrl/api/student/avatar';

  // Dynamic mutation & query routes
  static String courseDetail(String id) => '$baseUrl/api/student/courses/$id';
  static String leaderboard({String? courseId}) =>
      courseId != null ? '$baseUrl/api/student/leaderboard?courseId=$courseId' : '$baseUrl/api/student/leaderboard';
  static String submitAssignment(String id) => '$baseUrl/api/student/assignments/$id/submit';
  static String updateLessonProgress(String id) => '$baseUrl/api/student/lessons/$id/progress';
}
