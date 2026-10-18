import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class LiveClassesScreen extends ConsumerStatefulWidget {
  const LiveClassesScreen({super.key});

  @override
  ConsumerState<LiveClassesScreen> createState() => _LiveClassesScreenState();
}

class _LiveClassesScreenState extends ConsumerState<LiveClassesScreen> {
  int _activeTab = 0; // 0: Upcoming, 1: Recordings

  void _joinMeeting(BuildContext context, String meetingUrl, String title) async {
    HapticService.mediumImpact();
    if (meetingUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Meeting link not yet active for $title')),
      );
      return;
    }

    final uri = Uri.parse(meetingUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Opening Google Meet / Zoom: $meetingUrl')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final liveClasses = dashboardState.liveClasses;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Live Classes',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF00D6D6),
          backgroundColor: AppColors.surfaceLight,
          onRefresh: () => ref.read(studentDashboardProvider.notifier).loadDashboard(),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            children: [
              // Glassmorphic Banner matching Next.js LMS
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.videocam_rounded, color: Color(0xFFF59E0B), size: 14),
                          SizedBox(width: 6),
                          Text(
                            'LIVE INTERACTIVE SCHEDULE',
                            style: TextStyle(
                              color: Color(0xFFF59E0B),
                              fontWeight: FontWeight.w800,
                              fontSize: 10,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Live Engineering Sessions',
                      style: AppTypography.headlineLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Attend real-time architectural reviews, system design whiteboarding, and Q&A sessions led by principal architects.',
                      style: AppTypography.bodySmall.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Tabs & Timezone Row
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildTabButton(0, 'Upcoming (1)'),
                        _buildTabButton(1, 'Recordings (0)'),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.schedule_rounded, size: 14, color: Color(0xFF008A8A)),
                        SizedBox(width: 6),
                        Text(
                          'IST (Asia/Kolkata)',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              if (_activeTab == 0) ...[
                if (liveClasses.isNotEmpty) ...[
                  for (final item in liveClasses) ...[
                    _buildLiveCardFromMap(context, item as Map<String, dynamic>),
                  ],
                ] else ...[
                  // Genuine Empty State when no live classes scheduled
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
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
                          child: const Icon(Icons.videocam_off_outlined, color: Color(0xFF008A8A), size: 28),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          'No Live Classes Scheduled',
                          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'There are no active or scheduled live classes right now. When your instructor schedules a session, it will appear here.',
                          textAlign: TextAlign.center,
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ] else ...[
                // Recordings Tab Empty State
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.borderLight),
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
                      const SizedBox(height: 14),
                      Text(
                        'No Past Recordings Available',
                        style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Lecture video recordings are automatically processed and archived here 2 hours after each live session completes.',
                        textAlign: TextAlign.center,
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(int index, String label) {
    final isSelected = _activeTab == index;
    return GestureDetector(
      onTap: () {
        HapticService.selection();
        setState(() => _activeTab = index);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00D6D6) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildLiveCardFromMap(BuildContext context, Map<String, dynamic> item) {
    final title = item['title'] as String? ?? 'Masterclass';
    final course = item['courseTitle'] as String? ?? item['course']?['title'] as String? ?? 'Machine Learning';
    final instructor = item['instructorName'] as String? ?? item['instructor']?['name'] as String? ?? 'Principal Faculty';
    final meetingUrl = item['meetingUrl'] as String? ?? 'https://meet.google.com/techgration-masterclass';
    final status = item['status'] as String? ?? 'SCHEDULED';
    final isLive = status == 'LIVE';

    return _buildLiveCard(
      context,
      course: course,
      title: title,
      instructor: instructor,
      time: isLive ? 'Live Right Now' : 'Scheduled • IST',
      meetingUrl: meetingUrl,
      platform: 'Google Meet',
      isLive: isLive,
    );
  }

  Widget _buildLiveCard(
    BuildContext context, {
    required String course,
    required String title,
    required String instructor,
    required String time,
    required String meetingUrl,
    required String platform,
    required bool isLive,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isLive ? const Color(0xFF00D6D6) : AppColors.borderLight,
          width: isLive ? 1.8 : 1.2,
        ),
        boxShadow: isLive
            ? [
                BoxShadow(
                  color: const Color(0xFF00D6D6).withValues(alpha: 0.18),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                )
              ]
            : AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  course.toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF008A8A),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              if (isLive)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'LIVE NOW',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.error,
                          fontWeight: FontWeight.w800,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 6),
          Text(
            'Instructor: $instructor',
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Text(
                time,
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              BouncingButton(
                scaleDown: 0.94,
                onTap: () => _joinMeeting(context, meetingUrl, title),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00D6D6).withValues(alpha: 0.25),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.video_call_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        isLive ? 'Join Session' : 'Meeting Link',
                        style: AppTypography.buttonText.copyWith(fontSize: 12, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
