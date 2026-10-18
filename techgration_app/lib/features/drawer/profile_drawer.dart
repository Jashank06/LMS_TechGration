import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/providers/navigation_provider.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/sheets/support_helpdesk_sheet.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../auth/login_screen.dart';
import '../dashboard/student_dashboard_controller.dart';
import '../interview/interview_prep_screen.dart';
import '../profile/profile_settings_screen.dart';
import '../rewards/champion_swag_screen.dart';

class ProfileDrawer extends ConsumerWidget {
  const ProfileDrawer({super.key});

  void _onLogout(BuildContext context) async {
    HapticService.heavyImpact();
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Sign Out?', style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800)),
        content: const Text(
          'Are you sure you want to sign out from your TechGration student account?',
          style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              'Cancel',
              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
          BouncingButton(
            onTap: () => Navigator.pop(ctx, true),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.error,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                'Logout',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );

    if (shouldLogout == true) {
      await StorageService.clearSession();
      if (!context.mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (name.isNotEmpty) {
      return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
    }
    return 'NS';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final user = dashboardState.user ?? StorageService.getUserData() ?? {};
    final studentName = user['name'] as String? ?? 'Student';
    final studentEmail = user['email'] as String? ?? 'student@techgration.live';
    final avatarUrl = (user['profile']?['avatarUrl'] ?? user['avatarUrl']) as String?;
    final initials = _getInitials(studentName);
    final pendingCount = dashboardState.pendingAssignmentsCount;
    final avgProgress = dashboardState.avgProgress;
    final certCount = dashboardState.certificatesCount;

    return Drawer(
      backgroundColor: Colors.transparent,
      elevation: 0,
      width: MediaQuery.of(context).size.width * 0.82,
      child: Stack(
        children: [
          // Frosted Glass Blur Backdrop
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
            child: Container(
              color: Colors.white.withValues(alpha: 0.96),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 6),

                  // TechGration Brand Lockup
                  Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(9),
                          border: Border.all(
                            color: const Color(0xFF00D6D6).withValues(alpha: 0.25),
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            'assets/images/logo.png',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TechGration',
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const Text(
                            'Student Workspace',
                            style: TextStyle(
                              fontSize: 10,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textSecondary),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1, color: AppColors.borderLight),
                  const SizedBox(height: 14),

                  // Student Profile Card (Matching LMS Topbar/Sidebar)
                  GestureDetector(
                    onTap: () {
                      HapticService.lightTap();
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileSettingsScreen()));
                    },
                    child: Row(
                      children: [
                        // Cyan gradient avatar with online badge
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                                  width: 1.5,
                                ),
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: ClipOval(
                                child: (avatarUrl != null && avatarUrl.isNotEmpty)
                                    ? Image.network(
                                        avatarUrl,
                                        width: 56,
                                        height: 56,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Center(
                                          child: Text(
                                            initials,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w900,
                                              fontSize: 18,
                                            ),
                                          ),
                                        ),
                                      )
                                    : Center(
                                        child: Text(
                                          initials,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w900,
                                            fontSize: 18,
                                          ),
                                        ),
                                      ),
                              ),
                            ),
                            Positioned(
                              bottom: 1,
                              right: 1,
                              child: Container(
                                width: 13,
                                height: 13,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF22C55E),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 14),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                studentName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.headlineMedium.copyWith(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 17,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                studentEmail,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'STUDENT PORTAL',
                                  style: TextStyle(
                                    color: Color(0xFF008A8A),
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.6,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Divider(color: AppColors.divider),
                  const SizedBox(height: 10),

                  // ACADEMICS Category Section
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Text(
                      'ACADEMICS',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSecondary,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),

                  Expanded(
                    child: ListView(
                      physics: const BouncingScrollPhysics(),
                      children: [
                        _buildMenuItem(
                          icon: Icons.assignment_turned_in_outlined,
                          title: 'Assignments',
                          badge: pendingCount > 0 ? '$pendingCount' : null,
                          badgeColor: const Color(0xFFF59E0B),
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            ref.read(selectedNavIndexProvider.notifier).state = 3;
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.help_outline_rounded,
                          title: 'Quizzes & Tests',
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            ref.read(selectedAcademicsTabProvider.notifier).state = 0;
                            ref.read(selectedNavIndexProvider.notifier).state = 4;
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.emoji_events_outlined,
                          title: 'Leaderboard',
                          badge: 'LIVE',
                          badgeColor: const Color(0xFF10B981),
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            ref.read(selectedAcademicsTabProvider.notifier).state = 1;
                            ref.read(selectedNavIndexProvider.notifier).state = 4;
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.card_giftcard_rounded,
                          title: 'Rewards & Swag',
                          badge: 'CHAMPION',
                          badgeColor: const Color(0xFFF59E0B),
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ChampionSwagScreen()),
                            );
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.workspace_premium_outlined,
                          title: 'Certificates',
                          badge: certCount > 0 ? '$certCount' : null,
                          badgeColor: const Color(0xFF008A8A),
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            ref.read(selectedAcademicsTabProvider.notifier).state = 2;
                            ref.read(selectedNavIndexProvider.notifier).state = 4;
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.psychology_outlined,
                          title: 'Interview Prep',
                          badge: avgProgress >= 100 ? 'Unlocked' : 'Locked',
                          badgeColor: avgProgress >= 100 ? const Color(0xFF10B981) : AppColors.textSecondary,
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const InterviewPrepScreen()),
                            );
                          },
                        ),

                        const SizedBox(height: 12),
                        const Divider(color: AppColors.divider),
                        const SizedBox(height: 8),

                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 4),
                          child: Text(
                            'ACCOUNT',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textSecondary,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),

                        _buildMenuItem(
                          icon: Icons.person_outline_rounded,
                          title: 'Profile & Settings',
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ProfileSettingsScreen()),
                            );
                          },
                        ),
                        _buildMenuItem(
                          icon: Icons.headset_mic_outlined,
                          title: 'Support Helpdesk',
                          onTap: () {
                            HapticService.selection();
                            Navigator.pop(context);
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (_) => const SupportHelpdeskSheet(),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  // Bottom Logout Button
                  BouncingButton(
                    scaleDown: 0.97,
                    onTap: () => _onLogout(context),
                    child: Container(
                      height: 48,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.logout_rounded, color: Color(0xFFDC2626), size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Sign Out',
                            style: TextStyle(
                              color: Color(0xFFDC2626),
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? badge,
    Color? badgeColor,
    required VoidCallback onTap,
  }) {
    return BouncingButton(
      scaleDown: 0.97,
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Icon(icon, color: AppColors.textPrimary, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor ?? const Color(0xFF00D6D6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 10,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textSecondary,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}
