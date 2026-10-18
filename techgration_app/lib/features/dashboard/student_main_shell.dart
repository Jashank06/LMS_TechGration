import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bottom_nav_bar.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/sheets/ask_doubt_sheet.dart';
import '../../shared/sheets/submit_assignment_sheet.dart';
import '../drawer/profile_drawer.dart';
import 'home_screen.dart';
import '../courses/my_courses_screen.dart';
import '../assignments/assignments_screen.dart';
import '../rewards/rewards_screen.dart';
import '../live/live_classes_screen.dart';
import 'student_dashboard_controller.dart';

import '../../core/providers/navigation_provider.dart';

class StudentMainShell extends ConsumerStatefulWidget {
  const StudentMainShell({super.key});

  @override
  ConsumerState<StudentMainShell> createState() => _StudentMainShellState();
}

class _StudentMainShellState extends ConsumerState<StudentMainShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  void _openDrawer() {
    _scaffoldKey.currentState?.openDrawer();
  }

  // ignore: unused_element
  void _onFabPressed() {
    HapticService.mediumImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.background,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
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
              Text(
                'Quick Actions ⚡',
                style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 16),
              _buildActionTile(
                icon: Icons.chat_bubble_outline_rounded,
                title: 'Ask Faculty a Doubt',
                subtitle: 'Get instant code & theory answers from mentors',
                onTap: () {
                  Navigator.pop(ctx);
                  _openAskDoubtSheet();
                },
              ),
              _buildActionTile(
                icon: Icons.upload_file_rounded,
                title: 'Submit Assignment',
                subtitle: 'Submit GitHub repository or project solution',
                onTap: () {
                  Navigator.pop(ctx);
                  _openSubmitAssignmentSheet();
                },
              ),
              _buildActionTile(
                icon: Icons.videocam_outlined,
                title: 'Join Live Masterclass',
                subtitle: 'Connect to live Google Meet / Zoom class',
                onTap: () {
                  Navigator.pop(ctx);
                  ref.read(selectedNavIndexProvider.notifier).state = 2; // Switch to Live Classes
                },
              ),
              _buildActionTile(
                icon: Icons.menu_book_rounded,
                title: 'View My Courses',
                subtitle: 'Track modules and continue lessons',
                onTap: () {
                  Navigator.pop(ctx);
                  ref.read(selectedNavIndexProvider.notifier).state = 1; // Switch to Courses
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openAskDoubtSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AskDoubtSheet(),
    );
  }

  void _openSubmitAssignmentSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const SubmitAssignmentSheet(),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return BouncingButton(
      scaleDown: 0.97,
      onTap: () {
        HapticService.lightTap();
        onTap();
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                borderRadius: const BorderRadius.all(Radius.circular(12)),
              ),
              child: Icon(icon, color: const Color(0xFF008A8A), size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 2),
                  Text(subtitle, style: AppTypography.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(selectedNavIndexProvider);

    return Scaffold(
      key: _scaffoldKey,
      drawer: const ProfileDrawer(),
      body: IndexedStack(
        index: currentIndex,
        children: [
          HomeScreen(onOpenDrawer: _openDrawer),
          const MyCoursesScreen(),
          const LiveClassesScreen(),
          const AssignmentsScreen(),
          const RewardsScreen(),
        ],
      ),
      // Floating Action Button commented out per user request:
      // floatingActionButton: currentIndex == 0 || currentIndex == 1
      //     ? BouncingButton(
      //         scaleDown: 0.88,
      //         onTap: _onFabPressed,
      //         child: Container(
      //           width: 56,
      //           height: 56,
      //           decoration: BoxDecoration(
      //             gradient: const LinearGradient(
      //               colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
      //             ),
      //             shape: BoxShape.circle,
      //             boxShadow: [
      //               BoxShadow(
      //                 color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
      //                 blurRadius: 14,
      //                 offset: const Offset(0, 5),
      //               ),
      //             ],
      //           ),
      //           child: const Center(
      //             child: Icon(
      //               Icons.add_rounded,
      //               color: Colors.white,
      //               size: 30,
      //             ),
      //           ),
      //         ),
      //       )
      //     : null,
      bottomNavigationBar: TechGrationBottomNavBar(
        currentIndex: currentIndex,
        pendingAssignmentsCount: ref.watch(studentDashboardProvider).pendingAssignmentsCount,
        onTap: (index) {
          ref.read(selectedNavIndexProvider.notifier).state = index;
        },
      ),
    );
  }
}
