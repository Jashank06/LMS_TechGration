import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';
import '../video/recording_player_screen.dart';

class CourseHubScreen extends ConsumerStatefulWidget {
  final String courseTitle;
  final String instructor;
  final String? courseId;

  const CourseHubScreen({
    super.key,
    this.courseTitle = 'Course Curriculum',
    this.instructor = 'Course Faculty',
    this.courseId,
  });

  @override
  ConsumerState<CourseHubScreen> createState() => _CourseHubScreenState();
}

class _CourseHubScreenState extends ConsumerState<CourseHubScreen> {
  bool _isLoading = false;
  bool _isPlaying = false;
  double _scrubberValue = 0.0;
  String _playbackSpeed = '1.0x';
  final Set<String> _localCompletedLessons = {};

  List<Map<String, dynamic>> _modules = [];
  List<Map<String, dynamic>> _lessons = [];
  Map<String, dynamic>? _selectedLesson;

  @override
  void initState() {
    super.initState();
    _fetchCurriculum();
  }

  Future<void> _fetchCurriculum() async {
    final id = widget.courseId;
    if (id == null || id.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final res = await ApiClient.get(Endpoints.courseDetail(id));
      if (res.success && res.data is Map && res.data['course'] != null) {
        final course = res.data['course'] as Map<String, dynamic>;
        final rawModules = (course['modules'] as List<dynamic>?) ?? [];
        final List<Map<String, dynamic>> parsedModules = [];
        final List<Map<String, dynamic>> flatLessons = [];

        for (final m in rawModules) {
          final mObj = m as Map<String, dynamic>;
          final rawLessons = (mObj['lessons'] as List<dynamic>?) ?? [];
          final parsedLessons = rawLessons
              .map((l) => Map<String, dynamic>.from(l as Map))
              .toList();
          if (parsedLessons.isNotEmpty) {
            parsedModules.add({
              'id': mObj['id'],
              'title': mObj['title'] ?? 'Module',
              'lessons': parsedLessons,
            });
            flatLessons.addAll(parsedLessons);
          }
        }

        // Also include real HD live class recordings from this course so Course Player
        // displays all playable course sessions (1:1 sync with Course Detail & Web LMS)
        final rawRecordings = (course['recordings'] as List<dynamic>?) ?? [];
        if (rawRecordings.isNotEmpty) {
          final parsedRecordings = rawRecordings.map((r) {
            final rObj = Map<String, dynamic>.from(r as Map);
            rObj['isRecording'] = true;
            return rObj;
          }).toList();

          parsedModules.add({
            'id': 'recorded_sessions',
            'title': 'Recorded Class Sessions',
            'lessons': parsedRecordings,
          });
          flatLessons.addAll(parsedRecordings);
        }

        final initialCompleted = flatLessons
            .where((l) => l['isCompleted'] == true && l['id'] != null)
            .map((l) => l['id'] as String)
            .toSet();

        if (mounted) {
          setState(() {
            _modules = parsedModules;
            _lessons = flatLessons;
            _localCompletedLessons.addAll(initialCompleted);
            if (flatLessons.isNotEmpty) {
              _selectedLesson = flatLessons.first;
            }
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

  void _openVideoLesson(Map<String, dynamic>? lesson) {
    HapticService.lightTap();
    final target = lesson ?? _selectedLesson;
    final vidUrl = (target?['videoUrl'] as String?)?.trim() ?? '';

    if (target == null || vidUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No playable video lesson is available for this course yet.'),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    final title = (target['title'] as String?) ?? 'Course Session';
    final lessonId = (target['id'] ?? '').toString();
    final isRecording = target['isRecording'] == true;
    final durationMins = (target['durationMinutes'] as num?)?.toInt() ??
        ((target['durationSec'] as num?) != null
            ? ((target['durationSec'] as num) / 60).round()
            : 45);

    setState(() {
      _selectedLesson = target;
      _isPlaying = true;
    });

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => RecordingPlayerScreen(
          classId: lessonId,
          title: title,
          videoUrl: vidUrl,
          courseTitle: widget.courseTitle,
          instructorName: (target['instructorName'] as String?) ?? widget.instructor,
          durationMinutes: durationMins,
          conductedDate: isRecording ? 'HD Class Recording • $durationMins mins' : 'Curriculum Video Lesson',
          description: target['description'] as String?,
        ),
      ),
    ).then((_) {
      if (mounted) {
        setState(() => _isPlaying = false);
      }
    });
  }

  void _togglePlay() => _openVideoLesson(_selectedLesson);

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
          content: Text('Lesson progress synced with LMS! ⚡'),
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
    if (enrollments.isNotEmpty && widget.courseId != null) {
      activeEnrollment = enrollments.cast<Map<String, dynamic>?>().firstWhere(
        (e) => e != null && (e['courseId'] == widget.courseId || e['id'] == widget.courseId),
        orElse: () => enrollments.first as Map<String, dynamic>,
      );
    }

    final courseObj = activeEnrollment?['course'] as Map<String, dynamic>?;
    final displayTitle = courseObj?['title'] as String? ?? widget.courseTitle;
    final displayInstructor = courseObj?['instructor']?['name'] as String? ?? widget.instructor;

    // Calculate progress
    final double serverProgressPct = (activeEnrollment?['progressPct'] as num?)?.toDouble() ?? 0.0;
    final progressValue = _lessons.isNotEmpty
        ? (_localCompletedLessons.length / _lessons.length).clamp(0.0, 1.0)
        : (serverProgressPct / 100.0).clamp(0.0, 1.0);

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
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF00D6D6),
                ),
              )
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Cinematic Video Player HUD
                    Container(
                      width: double.infinity,
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
                          // Ambient Background Gradient
                          Positioned.fill(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(24),
                              child: Container(
                                decoration: const BoxDecoration(
                                  gradient: RadialGradient(
                                    colors: [Color(0xFF132A3E), Color(0xFF090A0F)],
                                    radius: 0.95,
                                  ),
                                ),
                              ),
                            ),
                          ),

                          // Center Play CTA + Caption
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              BouncingButton(
                                scaleDown: 0.88,
                                onTap: _togglePlay,
                                child: Container(
                                  width: 64,
                                  height: 64,
                                  decoration: BoxDecoration(
                                    color: _selectedLesson != null
                                        ? const Color(0xFF00D6D6)
                                        : Colors.white.withValues(alpha: 0.14),
                                    shape: BoxShape.circle,
                                    boxShadow: _selectedLesson != null
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF00D6D6).withValues(alpha: 0.45),
                                              blurRadius: 18,
                                              offset: const Offset(0, 4),
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Icon(
                                    _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                                    color: _selectedLesson != null
                                        ? const Color(0xFF090A0F)
                                        : Colors.white54,
                                    size: 34,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                _selectedLesson != null
                                    ? 'Tap to watch in Full HD Player'
                                    : 'No video lessons published yet',
                                style: AppTypography.bodySmall.copyWith(
                                  color: Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),

                          // Top Active Lesson Pill
                          Positioned(
                            top: 14,
                            left: 16,
                            right: 76,
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.65),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                                  ),
                                ),
                                child: Text(
                                  _selectedLesson != null
                                      ? (_selectedLesson!['title'] as String? ?? 'Active Lesson')
                                      : 'TECHGRATION COURSE PLAYER',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTypography.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
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
                                  color: Colors.black.withValues(alpha: 0.65),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
                                ),
                                child: Text(
                                  _playbackSpeed,
                                  style: AppTypography.bodySmall.copyWith(
                                    color: const Color(0xFF00D6D6),
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
                                thumbColor: const Color(0xFF00D6D6),
                                activeTrackColor: const Color(0xFF00D6D6),
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
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Overall Progress',
                                      style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      '${(progressValue * 100).toInt()}%',
                                      style: AppTypography.titleMedium.copyWith(
                                        color: const Color(0xFF008A8A),
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(6),
                                  child: LinearProgressIndicator(
                                    value: progressValue,
                                    minHeight: 7,
                                    backgroundColor: AppColors.borderLight,
                                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    const Icon(Icons.bolt_rounded, size: 16, color: Color(0xFF00D6D6)),
                                    const SizedBox(width: 4),
                                    Text(
                                      _lessons.isNotEmpty
                                          ? '${_localCompletedLessons.length} of ${_lessons.length} lessons completed'
                                          : 'Complete modules to build certification readiness',
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.textSecondary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 3. Curriculum Section
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        'Curriculum & Lessons (${_lessons.length})',
                        style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    const SizedBox(height: 12),

                    if (_lessons.isEmpty) ...[
                      // Authentic Empty State
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.symmetric(horizontal: 20),
                        padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.menu_book_outlined, color: Color(0xFF008A8A), size: 26),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              'Curriculum Under Curation',
                              style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Video lessons and learning notes for this course are currently being curated by your instructor.',
                              textAlign: TextAlign.center,
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      // Grouped by Module if modules exist, or flat list
                      if (_modules.isNotEmpty) ...[
                        for (final module in _modules) ...[
                          Padding(
                            padding: const EdgeInsets.fromLTRB(20, 12, 20, 6),
                            child: Text(
                              (module['title'] as String? ?? 'Module').toUpperCase(),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF008A8A),
                                letterSpacing: 0.6,
                              ),
                            ),
                          ),
                          for (final lesson in (module['lessons'] as List<dynamic>? ?? []))
                            _buildLessonTile(lesson as Map<String, dynamic>),
                        ],
                      ] else ...[
                        for (final lesson in _lessons)
                          _buildLessonTile(lesson),
                      ],
                    ],

                    const SizedBox(height: 40),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildLessonTile(Map<String, dynamic> lesson) {
    final lessonId = (lesson['id'] ?? '').toString();
    final lessonTitle = (lesson['title'] ?? 'Lesson').toString();
    final isRecording = lesson['isRecording'] == true;
    final isDone = _localCompletedLessons.contains(lessonId);
    final isSelected = _selectedLesson != null && _selectedLesson!['id'] == lessonId;
    final durSec = (lesson['durationSec'] as num?)?.toInt();
    final durMins = (lesson['durationMinutes'] as num?)?.toInt() ??
        (durSec != null && durSec > 0 ? (durSec / 60).round() : null);
    final durLabel = durMins != null && durMins > 0
        ? (isRecording ? '$durMins mins • HD Recording' : '$durMins mins • Video Lesson')
        : (isRecording ? 'HD Class Recording' : 'Video Lesson');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      decoration: BoxDecoration(
        color: isSelected
            ? const Color(0xFFE6FFFA)
            : isDone
                ? const Color(0xFFF0FDF4)
                : AppColors.background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected
              ? const Color(0xFF00D6D6)
              : isDone
                  ? const Color(0xFFBBF7D0)
                  : AppColors.borderLight,
          width: isSelected ? 1.5 : 1.0,
        ),
      ),
      child: ListTile(
        onTap: () => _openVideoLesson(lesson),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF00D6D6).withValues(alpha: 0.2)
                : AppColors.surfaceLight,
            shape: BoxShape.circle,
          ),
          child: Icon(
            isSelected && _isPlaying
                ? Icons.volume_up_rounded
                : Icons.play_arrow_rounded,
            color: isSelected ? const Color(0xFF008A8A) : AppColors.textSecondary,
            size: 20,
          ),
        ),
        title: Text(
          lessonTitle,
          style: AppTypography.titleMedium.copyWith(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected
                ? const Color(0xFF008A8A)
                : isDone
                    ? const Color(0xFF166534)
                    : AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          durLabel,
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
        trailing: isRecording
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Watch',
                  style: TextStyle(
                    color: Color(0xFF008A8A),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              )
            : BouncingButton(
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
  }
}
