import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/widgets/course_image.dart';
import '../dashboard/student_dashboard_controller.dart';

class CourseDetailScreen extends ConsumerStatefulWidget {
  final String courseId;
  final String courseTitle;
  final String? courseSubtitle;
  final String? category;
  final String? instructorName;
  final String? thumbnailUrl;
  final double progressPct;

  const CourseDetailScreen({
    super.key,
    required this.courseId,
    required this.courseTitle,
    this.courseSubtitle,
    this.category,
    this.instructorName,
    this.thumbnailUrl,
    this.progressPct = 0.0,
  });

  @override
  ConsumerState<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends ConsumerState<CourseDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _activeTabIndex = 0;

  final List<Map<String, dynamic>> _tabsConfig = [
    {'title': 'Live Class', 'icon': Icons.podcasts_rounded, 'badgeKey': 'live'},
    {'title': 'Recordings', 'icon': Icons.play_circle_outline_rounded, 'badgeKey': 'recordings'},
    {'title': 'Time Table', 'icon': Icons.calendar_month_rounded, 'badgeKey': null},
    {'title': 'Study Materials', 'icon': Icons.description_outlined, 'badgeKey': 'materials'},
    {'title': 'Assignments', 'icon': Icons.assignment_turned_in_outlined, 'badgeKey': 'assignments'},
    {'title': 'Quizzes', 'icon': Icons.help_outline_rounded, 'badgeKey': 'quizzes'},
  ];

  bool _isLoading = false;
  Map<String, dynamic>? _apiCourseData;

  final String _defaultMeetingUrl = 'https://meet.google.com/jan-hnzk-nhf';
  final String _defaultTimetableUrl =
      'https://res.cloudinary.com/dozazvcec/image/upload/v1792270601/techgration_lms/courses/6ad283b4e196d0b8fbfb9eae/timetable/timetable_1792270598486_ai_course_timetable_poster.png.png';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabsConfig.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging || _tabController.index != _activeTabIndex) {
        setState(() {
          _activeTabIndex = _tabController.index;
        });
      }
    });

    _fetchCourseDetails();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchCourseDetails() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.get<Map<String, dynamic>>(
        Endpoints.courseDetail(widget.courseId),
      );
      if (res.success && res.data != null && res.data!['course'] != null) {
        if (mounted) {
          setState(() {
            _apiCourseData = Map<String, dynamic>.from(res.data!['course'] as Map);
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _launchUrl(String url) async {
    HapticService.mediumImpact();
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Opening link: $url')),
      );
    }
  }

  void _copyMeetingLink() {
    HapticService.selection();
    Clipboard.setData(ClipboardData(text: _defaultMeetingUrl));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Meeting link copied to clipboard! 📋'),
        backgroundColor: Color(0xFF008A8A),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _openFullscreenImage(String imageUrl) {
    HapticService.mediumImpact();
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierDismissible: true,
        pageBuilder: (context, animation, secondaryAnimation) {
          return Scaffold(
            backgroundColor: Colors.black.withValues(alpha: 0.95),
            appBar: AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              iconTheme: const IconThemeData(color: Colors.white),
              title: const Text(
                'AI Course Timetable Poster',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.download_rounded, color: Color(0xFF00D6D6)),
                  onPressed: () => _launchUrl(imageUrl),
                  tooltip: 'Download Poster',
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            body: Center(
              child: InteractiveViewer(
                minScale: 0.8,
                maxScale: 4.5,
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => Image.asset(
                    'assets/images/ai_timetable_poster.png',
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final enrollments = dashboardState.enrollments;

    Map<String, dynamic>? currentEnrollment;
    if (enrollments.isNotEmpty) {
      try {
        currentEnrollment = enrollments.firstWhere(
          (e) => (e as Map<String, dynamic>)['courseId'] == widget.courseId,
        ) as Map<String, dynamic>?;
      } catch (_) {
        currentEnrollment = enrollments.first as Map<String, dynamic>?;
      }
    }

    final courseData = _apiCourseData ?? ((currentEnrollment?['course'] as Map<String, dynamic>?) ?? {});
    final title = (courseData['title'] as String?) ?? widget.courseTitle;
    final category = (courseData['category'] as String?) ?? widget.category ?? 'AI & MACHINE LEARNING';
    final instructor = (courseData['instructorName'] as String?) ??
        (courseData['instructor']?['name'] as String?) ??
        widget.instructorName ??
        'Vineet Sir';
    final instructorTitle = (courseData['instructorTitle'] as String?) ?? 'Lead AI & Cloud Architect • TechGration Academy';
    final thumb = (courseData['thumbnailUrl'] as String?) ?? widget.thumbnailUrl;
    final progress = (courseData['progressPct'] as num?)?.toDouble() ??
        (currentEnrollment?['progressPct'] as num?)?.toDouble() ??
        widget.progressPct;

    final List<dynamic> liveClasses = (courseData['liveClasses'] as List<dynamic>?) ?? [];
    final List<dynamic> recordings = (courseData['recordings'] as List<dynamic>?) ?? [];
    final List<dynamic> materials = (courseData['studyMaterials'] as List<dynamic>?) ?? [];
    final List<dynamic> assignments = (courseData['assignments'] as List<dynamic>?) ?? [];
    final List<dynamic> quizzes = (courseData['quizzes'] as List<dynamic>?) ?? [];

    final timetableUrl = (courseData['timetableUrl'] as String?)?.isNotEmpty == true
        ? courseData['timetableUrl'] as String
        : _defaultTimetableUrl;
    final timetableTitle = (courseData['timetableTitle'] as String?) ?? 'AI Course Timetable Poster';
    final timetableFileName = (courseData['timetableFileName'] as String?) ?? 'AI Course Timetable Poster.png';
    final timetableFileSize = (courseData['timetableFileSize'] as String?) ?? '2.0 MB';
    final timetableFileType = (courseData['timetableFileType'] as String?) ?? 'PNG';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Course Details',
          style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        bottom: _isLoading
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(
                  minHeight: 2,
                  color: Color(0xFF00D6D6),
                  backgroundColor: Colors.transparent,
                ),
              )
            : null,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () {
            HapticService.lightTap();
            Navigator.pop(context);
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20),
            onPressed: _copyMeetingLink,
            tooltip: 'Copy Meeting Link',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Breadcrumbs
              Padding(
                padding: const EdgeInsets.only(left: 20, right: 20, top: 12),
                child: Text(
                  'Student Portal  ›  Courses  ›  ${widget.courseId.substring(0, widget.courseId.length >= 8 ? 8 : widget.courseId.length)}...',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // 2. Badges Row
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    _buildPillBadge(
                      category.toUpperCase(),
                      bgColor: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                      textColor: const Color(0xFF008A8A),
                      borderColor: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                    ),
                    _buildPillBadge(
                      'ALL_LEVELS',
                      bgColor: const Color(0xFFF1F5F9),
                      textColor: const Color(0xFF475569),
                      borderColor: const Color(0xFFCBD5E1),
                    ),
                    _buildPillBadge(
                      'LIVE INTERACTIVE CLASSES',
                      bgColor: const Color(0xFFF3E8FF),
                      textColor: const Color(0xFF7E22CE),
                      borderColor: const Color(0xFFD8B4FE),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // 3. Course Title (Clean, NO extra description text, NO clutter pills)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  title,
                  style: AppTypography.displayLarge.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                    letterSpacing: -0.4,
                    height: 1.25,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // 4. Instructor Card (Vineet Sir with verified badge)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.16),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                        ),
                        child: const Center(
                          child: Text(
                            'VS',
                            style: TextStyle(
                              color: Color(0xFF008A8A),
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  instructor,
                                  style: AppTypography.titleMedium.copyWith(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF0284C7)),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              instructorTitle,
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // 5. Hero Live Batch Card (Matching Web LMS)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.borderLight),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 18,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Course Image with Live Batch Tag
                      Stack(
                        children: [
                          AspectRatio(
                            aspectRatio: 16 / 9,
                            child: CourseImage(
                              imageUrl: thumb,
                              courseTitle: title,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            bottom: 12,
                            left: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 7,
                                    height: 7,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF22C55E),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text(
                                    'TechGration Live Batch Active',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 11,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),

                      Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Row(
                                  children: [
                                    Icon(Icons.check_circle_outline_rounded, size: 14, color: Color(0xFF008A8A)),
                                    SizedBox(width: 5),
                                    Text(
                                      'Enrolled in Batch',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF008A8A),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  '${progress.toInt()}% Completed',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF008A8A),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: (progress / 100.0).clamp(0.0, 1.0),
                                minHeight: 6,
                                backgroundColor: const Color(0xFFF1F5F9),
                                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
                              ),
                            ),
                            const SizedBox(height: 16),
                            BouncingButton(
                              scaleDown: 0.96,
                              onTap: () => _launchUrl(_defaultMeetingUrl),
                              child: Container(
                                width: double.infinity,
                                height: 48,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                                      blurRadius: 14,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.videocam_rounded, color: Colors.white, size: 20),
                                    SizedBox(width: 8),
                                    Text(
                                      'Join Google Meet Room',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 22),

              // 6. Modernized Segmented Capsule Tab Bar (NO clipped blue blobs!)
              _buildSegmentedTabBar(assignments.length, quizzes.length),

              const SizedBox(height: 18),

              // 7. Tab Content Views (Exact Authentic LMS States)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _buildActiveTabContent(
                  courseTitle: title,
                  liveClasses: liveClasses,
                  recordings: recordings,
                  materials: materials,
                  assignments: assignments,
                  quizzes: quizzes,
                  timetableUrl: timetableUrl,
                  timetableTitle: timetableTitle,
                  timetableFileName: timetableFileName,
                  timetableFileSize: timetableFileSize,
                  timetableFileType: timetableFileType,
                ),
              ),

              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }

  // --- MODERN SEGMENTED CAPSULE TAB BAR ---
  Widget _buildSegmentedTabBar(int assignmentsCount, int quizzesCount) {
    return Container(
      height: 52,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
        itemCount: _tabsConfig.length,
        separatorBuilder: (context, index) => const SizedBox(width: 4),
        itemBuilder: (context, index) {
          final tab = _tabsConfig[index];
          final isSelected = _activeTabIndex == index;
          final title = tab['title'] as String;
          final icon = tab['icon'] as IconData;

          // Determine badge count
          int? badgeCount;
          Color badgeColor = const Color(0xFFF59E0B);
          if (title == 'Assignments' && assignmentsCount > 0) {
            badgeCount = assignmentsCount;
            badgeColor = const Color(0xFFF59E0B);
          } else if (title == 'Quizzes' && quizzesCount > 0) {
            badgeCount = quizzesCount;
            badgeColor = const Color(0xFF9333EA);
          }

          return BouncingButton(
            scaleDown: 0.95,
            onTap: () {
              HapticService.selection();
              _tabController.animateTo(index);
              setState(() {
                _activeTabIndex = index;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                gradient: isSelected
                    ? const LinearGradient(
                        colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isSelected ? null : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    icon,
                    size: 15,
                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF475569),
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                  if (badgeCount != null) ...[
                    const SizedBox(width: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.white.withValues(alpha: 0.25) : badgeColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        badgeCount.toString(),
                        style: TextStyle(
                          color: isSelected ? Colors.white : badgeColor,
                          fontWeight: FontWeight.w900,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildActiveTabContent({
    required String courseTitle,
    required List<dynamic> liveClasses,
    required List<dynamic> recordings,
    required List<dynamic> materials,
    required List<dynamic> assignments,
    required List<dynamic> quizzes,
    required String timetableUrl,
    required String timetableTitle,
    required String timetableFileName,
    required String timetableFileSize,
    required String timetableFileType,
  }) {
    switch (_activeTabIndex) {
      case 0:
        return _buildLiveClassTab(courseTitle, liveClasses);
      case 1:
        return _buildRecordingsTab(recordings);
      case 2:
        return _buildTimeTableTab(
          timetableUrl: timetableUrl,
          timetableTitle: timetableTitle,
          timetableFileName: timetableFileName,
          timetableFileSize: timetableFileSize,
          timetableFileType: timetableFileType,
        );
      case 3:
        return _buildStudyMaterialsTab(materials);
      case 4:
        return _buildAssignmentsTab(courseTitle, assignments);
      case 5:
        return _buildQuizzesTab(courseTitle, quizzes);
      default:
        return _buildLiveClassTab(courseTitle, liveClasses);
    }
  }

  // --- TAB 0: LIVE CLASS VIEW (Exact Authentic LMS State) ---
  Widget _buildLiveClassTab(String courseTitle, List<dynamic> liveClasses) {
    if (liveClasses.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 16,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.podcasts_rounded, color: Color(0xFF008A8A), size: 28),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Live Class In Session Right Now',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              'There is currently no live class running. When your instructor starts the live session, the join link and room status will appear here immediately.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 12),
            ),
            const SizedBox(height: 20),
            BouncingButton(
              scaleDown: 0.95,
              onTap: () {
                HapticService.selection();
                _tabController.animateTo(2);
                setState(() => _activeTabIndex = 2);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF00D6D6)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.calendar_month_rounded, size: 16, color: Color(0xFF008A8A)),
                    SizedBox(width: 8),
                    Text(
                      'View Batch Time Table',
                      style: TextStyle(
                        color: Color(0xFF008A8A),
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    final activeClass = liveClasses[0] as Map<String, dynamic>;
    final classTitle = (activeClass['title'] as String?) ?? 'Live Session';
    final meetingUrl = (activeClass['meetingUrl'] as String?) ?? _defaultMeetingUrl;
    final platform = (activeClass['platform'] as String?) ?? 'Google Meet';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.circle, color: Color(0xFFEF4444), size: 8),
                SizedBox(width: 6),
                Text(
                  'LIVE CLASS SCHEDULED',
                  style: TextStyle(color: Color(0xFFDC2626), fontSize: 10, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(classTitle, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 6),
          Text('Platform: $platform', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          const SizedBox(height: 16),
          BouncingButton(
            scaleDown: 0.96,
            onTap: () => _launchUrl(meetingUrl),
            child: Container(
              width: double.infinity,
              height: 46,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(
                child: Text('Join Live Room', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- TAB 1: RECORDINGS VIEW (Exact Authentic LMS State) ---
  Widget _buildRecordingsTab(List<dynamic> recordings) {
    if (recordings.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 16,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.play_circle_outline_rounded, color: Color(0xFF008A8A), size: 28),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Recordings Available Yet',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              'This course is starting fresh. Recordings of live class sessions will be published here automatically once the live sessions conclude.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return Column(
      children: recordings.map((rec) {
        final title = (rec['title'] as String?) ?? 'Session Recording';
        final durMin = (rec['durationMinutes'] as int?) ?? 45;
        final videoUrl = rec['videoUrl'] as String?;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.play_arrow_rounded, color: Color(0xFF008A8A), size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text('$durMin mins • HD Recording', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              ),
              if (videoUrl != null && videoUrl.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.open_in_new_rounded, size: 18, color: Color(0xFF008A8A)),
                  onPressed: () => _launchUrl(videoUrl),
                ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // --- TAB 2: TIME TABLE VIEW (1:1 with Screenshot 5!) ---
  Widget _buildTimeTableTab({
    required String timetableUrl,
    required String timetableTitle,
    required String timetableFileName,
    required String timetableFileSize,
    required String timetableFileType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Official Timetable Document Header Card (Screenshot 5)
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.35)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.06),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00D6D6).withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.35)),
                    ),
                    child: const Icon(Icons.code_rounded, color: Color(0xFF008A8A), size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            Text(
                              timetableTitle,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF00D6D6).withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                timetableFileType,
                                style: const TextStyle(
                                  color: Color(0xFF008A8A),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 11, color: Color(0xFF16A34A)),
                                  SizedBox(width: 4),
                                  Text(
                                    'OFFICIAL SCHEDULE',
                                    style: TextStyle(
                                      color: Color(0xFF15803D),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 9,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Uploaded by Vineet Sir • $timetableFileName • $timetableFileSize • Last updated Oct 18, 2026',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'This is your official curriculum timetable for lectures, live labs, and mentoring milestones.',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Action buttons (Download & Fullscreen)
              Row(
                children: [
                  Expanded(
                    child: BouncingButton(
                      scaleDown: 0.96,
                      onTap: () => _launchUrl(timetableUrl),
                      child: Container(
                        height: 42,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.download_rounded, color: Colors.white, size: 16),
                            SizedBox(width: 6),
                            Text(
                              'Download Timetable',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  BouncingButton(
                    scaleDown: 0.96,
                    onTap: () => _openFullscreenImage(timetableUrl),
                    child: Container(
                      height: 42,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.fullscreen_rounded, color: Color(0xFF475569), size: 18),
                          SizedBox(width: 6),
                          Text(
                            'Open Fullscreen',
                            style: TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.w700, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // 2. Interactive Timetable Viewer Header
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Interactive Timetable Viewer',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.textPrimary),
            ),
            Text(
              'Pinch to zoom schedule',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            ),
          ],
        ),

        const SizedBox(height: 10),

        // 3. High-Resolution Poster Card (Showing Friday & Saturday 6:00-7:00 PM Live Classes)
        GestureDetector(
          onTap: () => _openFullscreenImage(timetableUrl),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.3)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              children: [
                InteractiveViewer(
                  minScale: 1.0,
                  maxScale: 3.5,
                  child: Image.network(
                    timetableUrl,
                    fit: BoxFit.contain,
                    width: double.infinity,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        height: 220,
                        color: const Color(0xFF0F172A),
                        child: const Center(
                          child: CircularProgressIndicator(color: Color(0xFF00D6D6), strokeWidth: 2.5),
                        ),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) => Image.asset(
                      'assets/images/ai_timetable_poster.png',
                      fit: BoxFit.contain,
                      width: double.infinity,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.zoom_in_rounded, size: 14, color: Color(0xFF00D6D6)),
                        SizedBox(width: 5),
                        Text(
                          'Tap to Expand',
                          style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // --- TAB 3: STUDY MATERIALS VIEW (Exact Authentic LMS State) ---
  Widget _buildStudyMaterialsTab(List<dynamic> materials) {
    if (materials.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 16,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.description_outlined, color: Color(0xFF008A8A), size: 28),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Study Materials Uploaded Yet',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            const Text(
              'Course slides, lecture notes, and source code repositories will be shared here by the instructor during the course.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return Column(
      children: materials.map((m) {
        final title = (m['title'] as String?) ?? 'Study Material';
        final fileType = (m['fileType'] as String?) ?? 'PDF';
        final fileSize = (m['fileSize'] as String?) ?? '1.2 MB';
        final fileUrl = m['fileUrl'] as String?;

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFFDC2626), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text('$fileType • $fileSize', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              ),
              if (fileUrl != null)
                IconButton(
                  icon: const Icon(Icons.download_rounded, size: 20, color: Color(0xFF008A8A)),
                  onPressed: () => _launchUrl(fileUrl),
                ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // --- TAB 4: ASSIGNMENTS VIEW (Exact Authentic LMS State) ---
  Widget _buildAssignmentsTab(String courseTitle, List<dynamic> assignments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header Banner (Screenshot from Web LMS)
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.assignment_turned_in_rounded, size: 12, color: Color(0xFFD97706)),
                        SizedBox(width: 4),
                        Text(
                          'Practical Course Milestones',
                          style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.w900, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${assignments.length} Total Tasks',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF475569)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Text(
                'Course Assignments & Projects',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
              ),
              const SizedBox(height: 4),
              const Text(
                'Hands-on engineering tasks evaluated directly by your lead mentor. Submit your code repositories, view grading rubrics, and inspect instructor feedback.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        if (assignments.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderLight),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 16,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.assignment_outlined, color: Color(0xFFD97706), size: 28),
                ),
                const SizedBox(height: 16),
                const Text(
                  'No Assignments for this Course Yet',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your course instructor will publish practical engineering deliverables and evaluation milestones as the syllabus progresses.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 12),
                ),
              ],
            ),
          )
        else
          Column(
            children: assignments.map((a) {
              final title = (a['title'] as String?) ?? 'Assignment';
              final maxMarks = a['maxMarks'] ?? 100;
              final status = (a['submissionStatus'] as String?) ?? 'PENDING';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            status,
                            style: const TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.w900, fontSize: 10),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('Max Score: $maxMarks pts', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              );
            }).toList(),
          ),
      ],
    );
  }

  // --- TAB 5: QUIZZES VIEW (Exact Authentic LMS State) ---
  Widget _buildQuizzesTab(String courseTitle, List<dynamic> quizzes) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header Banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF9333EA).withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF9333EA).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.help_outline_rounded, size: 12, color: Color(0xFF9333EA)),
                        SizedBox(width: 4),
                        Text(
                          'Interactive Knowledge Verification',
                          style: TextStyle(color: Color(0xFF9333EA), fontWeight: FontWeight.w900, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${quizzes.length} Quizzes',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF475569)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Text(
                'Course Quizzes & Assessments',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
              ),
              const SizedBox(height: 4),
              const Text(
                'Timed scenario-based evaluations designed to test deep conceptual understanding and validate readiness for enterprise certifications.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.4),
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        if (quizzes.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderLight),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 16,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: const Color(0xFF9333EA).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.quiz_outlined, color: Color(0xFF9333EA), size: 28),
                ),
                const SizedBox(height: 16),
                const Text(
                  'No Quizzes Configured Yet',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Scenario-based multiple-choice quizzes will unlock as you progress through this course.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary, height: 1.45, fontSize: 12),
                ),
              ],
            ),
          )
        else
          Column(
            children: quizzes.map((q) {
              final title = (q['title'] as String?) ?? 'Quiz';
              final questions = q['questionCount'] ?? 10;
              final passingPct = q['passingPct'] ?? 75;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    const SizedBox(height: 6),
                    Text('$questions Questions • $passingPct% to Pass', style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              );
            }).toList(),
          ),
      ],
    );
  }

  Widget _buildPillBadge(
    String label, {
    required Color bgColor,
    required Color textColor,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
