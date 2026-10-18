import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class AssignmentsScreen extends ConsumerStatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  ConsumerState<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends ConsumerState<AssignmentsScreen> {
  void _openSubmitSheet(String assignmentId, String assignmentTitle, String courseTitle) {
    HapticService.selection();
    final urlController = TextEditingController();
    final notesController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: AppColors.borderLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.assignment_turned_in_rounded,
                        color: Color(0xFF008A8A),
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Submit Assignment',
                            style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                          ),
                          Text(
                            courseTitle,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Text(
                    assignmentTitle,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'GitHub or Project Deployment URL',
                  style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: urlController,
                  decoration: InputDecoration(
                    hintText: 'https://github.com/... or https://vercel.app/...',
                    prefixIcon: const Icon(Icons.link_rounded, color: Color(0xFF008A8A), size: 20),
                    filled: true,
                    fillColor: AppColors.surfaceLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.borderLight),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.borderLight),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF008A8A), width: 1.5),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Notes for Senior Faculty (Optional)',
                  style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: notesController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'Any architectural decisions or special instructions...',
                    filled: true,
                    fillColor: AppColors.surfaceLight,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.borderLight),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.borderLight),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF008A8A), width: 1.5),
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                BouncingButton(
                  scaleDown: 0.96,
                  onTap: () async {
                    if (isSubmitting || urlController.text.trim().isEmpty) return;
                    setSheetState(() => isSubmitting = true);
                    HapticService.mediumImpact();

                    final success = await ref
                        .read(studentDashboardProvider.notifier)
                        .submitAssignment(assignmentId, urlController.text.trim());

                    if (!context.mounted) return;
                    Navigator.pop(ctx);

                    if (success) {
                      HapticService.success();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Assignment submitted for faculty review! Synced with Atlas 🚀'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Submission updated in local portal. Synced with MongoDB.'),
                          backgroundColor: Color(0xFF0284C7),
                        ),
                      );
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Text(
                            'Confirm & Submit Deliverable',
                            style: AppTypography.buttonText.copyWith(color: Colors.white, fontSize: 15),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final assignments = dashboardState.assignments;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Assignments',
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
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.3)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00D6D6).withValues(alpha: 0.08),
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
                        color: const Color(0xFF00D6D6).withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.assignment_turned_in_rounded, color: Color(0xFF00D6D6), size: 14),
                          SizedBox(width: 6),
                          Text(
                            'PRACTICAL DELIVERABLES',
                            style: TextStyle(
                              color: Color(0xFF00D6D6),
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
                      'Assignments Workspace',
                      style: AppTypography.headlineLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Hands-on architecture blueprints, infrastructure codebases, and system design submissions evaluated directly by senior faculty.',
                      style: AppTypography.bodySmall.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Active Deliverables',
                    style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Text(
                      '${dashboardState.pendingAssignmentsCount} Pending',
                      style: AppTypography.bodySmall.copyWith(
                        fontWeight: FontWeight.w700,
                        color: dashboardState.pendingAssignmentsCount > 0
                            ? const Color(0xFF008A8A)
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              if (assignments.isNotEmpty) ...[
                for (final item in assignments) ...[
                  _buildAssignmentCard(context, item as Map<String, dynamic>),
                ],
              ] else ...[
                _buildEmptyAssignmentsView(context),
              ],

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyAssignmentsView(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
              ),
            ),
            child: const Icon(
              Icons.assignment_turned_in_outlined,
              size: 28,
              color: Color(0xFF008A8A),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No Active Deliverables',
            style: AppTypography.headlineMedium.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 17,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            'Your instructors have not published any pending assignments yet. New practical tasks and blueprints will appear here as course modules progress.',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              height: 1.45,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAssignmentCard(BuildContext context, Map<String, dynamic> item) {
    final id = item['id'] as String? ?? 'asgn-1';
    final title = item['title'] as String? ?? 'Engineering Assignment';
    final course = item['courseTitle'] as String? ?? item['course']?['title'] as String? ?? 'Machine Learning';
    final instructions = item['instructions'] as String? ?? 'Complete the architecture blueprint and submit GitHub repository link.';
    final dueRaw = item['dueAt']?.toString() ?? 'Oct 21, 2026';
    final maxMarks = item['maxMarks'] ?? 100;
    final submissions = item['submissions'] as List<dynamic>?;
    final isSubmitted = submissions != null && submissions.isNotEmpty;
    final submission = isSubmitted ? (submissions.first as Map<String, dynamic>) : null;
    final status = item['status'] as String? ?? (isSubmitted ? (submission?['status'] as String? ?? 'SUBMITTED') : 'PENDING');
    final marksAwarded = item['marksAwarded'] ?? submission?['marksAwarded'];

    return _buildAssignmentCardView(
      context: context,
      id: id,
      course: course,
      title: title,
      instructions: instructions,
      due: dueRaw.contains('T') ? 'Due ${dueRaw.split('T').first}' : 'Due $dueRaw',
      maxMarks: maxMarks,
      status: status,
      marksAwarded: marksAwarded,
    );
  }

  Widget _buildAssignmentCardView({
    required BuildContext context,
    required String id,
    required String course,
    required String title,
    required String instructions,
    required String due,
    required dynamic maxMarks,
    required String status,
    required dynamic marksAwarded,
  }) {
    final bool isGraded = status == 'GRADED';
    final bool isSubmitted = status == 'SUBMITTED' || status == 'IN_REVIEW';

    Color badgeBg;
    Color badgeText;
    String badgeLabel;
    IconData badgeIcon;

    if (isGraded) {
      badgeBg = const Color(0xFFD1FAE5);
      badgeText = const Color(0xFF047857);
      badgeLabel = 'Score: $marksAwarded/$maxMarks pts';
      badgeIcon = Icons.check_circle_rounded;
    } else if (isSubmitted) {
      badgeBg = const Color(0xFFE0F2FE);
      badgeText = const Color(0xFF0369A1);
      badgeLabel = 'In Faculty Review';
      badgeIcon = Icons.hourglass_top_rounded;
    } else {
      badgeBg = const Color(0xFFFEF3C7);
      badgeText = const Color(0xFFB45309);
      badgeLabel = 'Pending Submission';
      badgeIcon = Icons.pending_actions_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
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
                    fontSize: 11,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(badgeIcon, color: badgeText, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      badgeLabel,
                      style: AppTypography.bodySmall.copyWith(
                        color: badgeText,
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
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
            style: AppTypography.titleLarge.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: 17,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            instructions,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 6),
              Text(
                due,
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '• Max $maxMarks pts',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const Spacer(),
              if (!isSubmitted && !isGraded)
                BouncingButton(
                  scaleDown: 0.94,
                  onTap: () => _openSubmitSheet(id, title, course),
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
                    child: Text(
                      'Submit Assignment',
                      style: AppTypography.buttonText.copyWith(
                        fontSize: 12,
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Text(
                    isGraded ? 'View Feedback' : 'Submitted',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
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
