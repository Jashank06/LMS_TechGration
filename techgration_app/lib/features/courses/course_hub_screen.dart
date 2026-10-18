import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class CourseHubScreen extends ConsumerStatefulWidget {
  final String courseTitle;
  final String instructor;
  final String? courseId;

  const CourseHubScreen({
    super.key,
    this.courseTitle = 'Artificial Intelligence & Modern Deep Learning Systems',
    this.instructor = 'Senior AI Faculty',
    this.courseId,
  });

  @override
  ConsumerState<CourseHubScreen> createState() => _CourseHubScreenState();
}

class _CourseHubScreenState extends ConsumerState<CourseHubScreen> {
  bool _isPlaying = false;
  double _scrubberValue = 0.35;
  String _playbackSpeed = '1.0x';
  final Set<String> _localCompletedLessons = {};

  final List<Map<String, String>> _fallbackLessons = [
    {
      'id': '6ad4a0de61e0e81dfc1e4ef4',
      'title': '01. Next.js 16 Server Components & Mobile REST Bridge',
      'type': 'VIDEO',
      'duration': '18 mins',
    },
    {
      'id': '6ad4a0de61e0e81dfc1e4ef5',
      'title': '02. MongoDB Atlas Aggregation Pipelines & Indexes',
      'type': 'READING',
      'duration': '25 mins',
    },
    {
      'id': '6ad4a0de61e0e81dfc1e4ef6',
      'title': '03. Realtime WebSockets & Kafka Event Streaming',
      'type': 'VIDEO',
      'duration': '30 mins',
    },
    {
      'id': 'lesson-ml-4',
      'title': '04. PyTorch Neural Tensors & GPU Acceleration',
      'type': 'VIDEO',
      'duration': '22 mins',
    },
    {
      'id': 'lesson-ml-5',
      'title': '05. Production Model Deployment & Edge Inference',
      'type': 'VIDEO',
      'duration': '35 mins',
    },
  ];

  void _togglePlay() {
    HapticService.lightTap();
    setState(() => _isPlaying = !_isPlaying);
  }

  void _toggleSpeed() {
    HapticService.selection();
    setState(() {
      if (_playbackSpeed == '1.0x') {
        _playbackSpeed = '1.5x';
      } else if (_playbackSpeed == '1.5x') {
        _playbackSpeed = '2.0x';
      } else {
        _playbackSpeed = '1.0x';
      }
    });
  }

  void _toggleLesson(String lessonId, bool isCurrentlyDone) async {
    HapticService.selection();

    // Toggle locally for instant UI response
    setState(() {
      if (_localCompletedLessons.contains(lessonId)) {
        _localCompletedLessons.remove(lessonId);
      } else {
        _localCompletedLessons.add(lessonId);
        HapticService.success();
      }
    });

    // Sync to MongoDB Atlas and Web LMS backend
    final success = await ref
        .read(studentDashboardProvider.notifier)
        .toggleLessonProgress(lessonId, !isCurrentlyDone);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lesson progress synced with MongoDB Atlas & LMS! ⚡'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final enrollments = dashboardState.enrollments;

    Map<String, dynamic>? activeEnrollment;
    if (enrollments.isNotEmpty) {
      if (widget.courseId != null) {
        activeEnrollment = enrollments.firstWhere(
          (e) => (e as Map<String, dynamic>)['courseId'] == widget.courseId,
          orElse: () => enrollments.first as Map<String, dynamic>,
        ) as Map<String, dynamic>?;
      } else {
        activeEnrollment = enrollments.first as Map<String, dynamic>?;
      }
    }

    final courseObj = activeEnrollment?['course'] as Map<String, dynamic>?;
    final displayTitle = courseObj?['title'] as String? ?? widget.courseTitle;
    final displayInstructor = courseObj?['instructor']?['name'] as String? ?? widget.instructor;

    // Calculate progress
    final double serverProgressPct = (activeEnrollment?['progressPct'] as num?)?.toDouble() ?? 0.0;
    final progressValue = activeEnrollment != null
        ? (serverProgressPct / 100.0).clamp(0.0, 1.0)
        : (_localCompletedLessons.length / _fallbackLessons.length).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Course Player',
          style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            HapticService.lightTap();
            Navigator.pop(context);
          },
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Cinematic Video Player Mockup
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                height: 220,
                decoration: BoxDecoration(
                  color: const Color(0xFF0D0E15),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Ambient Video Thumbnail Grid
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: RadialGradient(
                              colors: [Color(0xFF1E1B4B), Color(0xFF090A0F)],
                              radius: 0.9,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Play/Pause Button
                    BouncingButton(
                      scaleDown: 0.88,
                      onTap: _togglePlay,
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.accentOrange,
                          shape: BoxShape.circle,
                          boxShadow: AppColors.orangeFabShadow,
                        ),
                        child: Icon(
                          _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 34,
                        ),
                      ),
                    ),

                    // Top Course Badge
                    Positioned(
                      top: 14,
                      left: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'LESSON 01 • ACTIVE TRACK',
                          style: AppTypography.bodySmall.copyWith(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),

                    // Speed Pill
                    Positioned(
                      top: 14,
                      right: 16,
                      child: BouncingButton(
                        scaleDown: 0.9,
                        onTap: _toggleSpeed,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _playbackSpeed,
                            style: AppTypography.bodySmall.copyWith(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Scrubber Bar
                    Positioned(
                      bottom: 8,
                      left: 14,
                      right: 14,
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          thumbColor: AppColors.accentOrange,
                          activeTrackColor: AppColors.accentOrange,
                          inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          trackHeight: 3,
                        ),
                        child: Slider(
                          value: _scrubberValue,
                          onChanged: (val) {
                            HapticService.lightTap();
                            setState(() => _scrubberValue = val);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. Course Header & Progress Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayTitle,
                      style: AppTypography.headlineLarge.copyWith(
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Instructor: $displayInstructor',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Animated Progress Meter
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Overall Progress (MongoDB Synced)',
                                      style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                                    ),
                                    Text(
                                      '${(progressValue * 100).toInt()}%',
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.accentOrange,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: LinearProgressIndicator(
                                    value: progressValue,
                                    minHeight: 8,
                                    backgroundColor: AppColors.divider,
                                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentOrange),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 3. Curriculum Checklist
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Curriculum & Lessons',
                  style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(height: 12),

              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _fallbackLessons.length,
                itemBuilder: (context, index) {
                  final lesson = _fallbackLessons[index];
                  final lessonId = lesson['id']!;
                  final lessonTitle = lesson['title']!;
                  final isDone = _localCompletedLessons.contains(lessonId);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: isDone ? const Color(0xFFF0FDF4) : AppColors.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDone ? const Color(0xFFBBF7D0) : AppColors.borderLight,
                      ),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      title: Text(
                        lessonTitle,
                        style: AppTypography.titleMedium.copyWith(
                          fontSize: 14,
                          fontWeight: isDone ? FontWeight.w700 : FontWeight.w600,
                          color: isDone ? const Color(0xFF166534) : AppColors.textPrimary,
                        ),
                      ),
                      trailing: BouncingButton(
                        scaleDown: 0.85,
                        onTap: () => _toggleLesson(lessonId, isDone),
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: isDone ? AppColors.success : Colors.transparent,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isDone ? AppColors.success : AppColors.borderLight,
                              width: 2,
                            ),
                          ),
                          child: isDone
                              ? const Icon(Icons.check, color: Colors.white, size: 16)
                              : null,
                        ),
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
