import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class InterviewPrepScreen extends ConsumerStatefulWidget {
  const InterviewPrepScreen({super.key});

  @override
  ConsumerState<InterviewPrepScreen> createState() => _InterviewPrepScreenState();
}

class _InterviewPrepScreenState extends ConsumerState<InterviewPrepScreen> {
  int _selectedCourseIndex = 0;
  bool _isLoading = true;
  List<dynamic> _enrolledCourses = [];
  bool _hasEarnedCertificate = false;

  @override
  void initState() {
    super.initState();
    _fetchInterviewReadiness();
  }

  Future<void> _fetchInterviewReadiness() async {
    final res = await ApiClient.get(Endpoints.interview);
    if (!mounted) return;

    if (res.success && res.data is Map) {
      final data = res.data as Map<String, dynamic>;
      setState(() {
        _isLoading = false;
        _hasEarnedCertificate = data['hasEarnedCertificate'] as bool? ?? false;
        _enrolledCourses = (data['enrolledCourses'] as List<dynamic>?) ?? [];
      });
    } else {
      // Fallback to studentDashboardProvider enrollments
      final enrollments = ref.read(studentDashboardProvider).enrollments;
      setState(() {
        _isLoading = false;
        _enrolledCourses = enrollments;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeCourse = _enrolledCourses.isNotEmpty && _selectedCourseIndex < _enrolledCourses.length
        ? (_enrolledCourses[_selectedCourseIndex] as Map<String, dynamic>)
        : null;

    final courseTitle = activeCourse?['courseTitle'] as String? ??
        activeCourse?['course']?['title'] as String? ??
        activeCourse?['title'] as String? ??
        'Artificial Intelligence & Modern Deep Learning Systems';

    final progressPct = (activeCourse?['progressPct'] as num?)?.round() ?? 0;
    final isEligible = progressPct >= 100 && _hasEarnedCertificate;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Interview Prep Hub',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF00D6D6)))
            : ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                physics: const BouncingScrollPhysics(),
                children: [
                  // Multi-Course Switcher
                  if (_enrolledCourses.length > 1) ...[
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      child: Row(
                        children: _enrolledCourses.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final c = entry.value as Map<String, dynamic>;
                          final title = c['courseTitle'] ?? c['course']?['title'] ?? c['title'] ?? 'Course';
                          final isSel = idx == _selectedCourseIndex;

                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text('$title'),
                              selected: isSel,
                              onSelected: (_) {
                                HapticService.selection();
                                setState(() => _selectedCourseIndex = idx);
                              },
                              selectedColor: const Color(0xFF00D6D6),
                              backgroundColor: AppColors.surfaceLight,
                              labelStyle: TextStyle(
                                color: isSel ? Colors.white : AppColors.textPrimary,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                              ),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              side: BorderSide(color: isSel ? const Color(0xFF00D6D6) : AppColors.borderLight),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Cyber Vault Hero Card
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isEligible
                            ? [const Color(0xFF042F2E), const Color(0xFF0F172A)]
                            : [const Color(0xFF0F172A), const Color(0xFF1E293B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(26),
                      border: Border.all(
                        color: isEligible ? const Color(0xFF00D6D6) : const Color(0xFF38BDF8).withValues(alpha: 0.3),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: isEligible
                              ? const Color(0xFF00D6D6).withValues(alpha: 0.25)
                              : Colors.black.withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isEligible ? const Color(0xFF00D6D6).withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isEligible ? Icons.lock_open_rounded : Icons.lock_outline_rounded,
                                color: isEligible ? const Color(0xFF00D6D6) : const Color(0xFF94A3B8),
                                size: 14,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isEligible ? 'ACCESS UNLOCKED' : 'CYBER PLACEMENT VAULT',
                                style: TextStyle(
                                  color: isEligible ? const Color(0xFF00D6D6) : const Color(0xFF94A3B8),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 10,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          isEligible ? 'You Are Placement Ready!' : 'Exclusive Placement Gateway',
                          style: AppTypography.headlineLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isEligible
                              ? 'Congratulations! You have completed the curriculum and unlocked direct access to Lead Faculty 1-on-1 mocks and hiring partner referrals.'
                              : 'Unlocked automatically upon 100% course curriculum completion and verified certificate issuance for $courseTitle.',
                          style: AppTypography.bodySmall.copyWith(color: Colors.white.withValues(alpha: 0.75), height: 1.45),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 18),

                        // Progress Bar
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Eligibility Progress',
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              '$progressPct% / 100%',
                              style: const TextStyle(color: Color(0xFF00D6D6), fontSize: 12, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: (progressPct / 100.0).clamp(0.0, 1.0),
                            minHeight: 8,
                            backgroundColor: Colors.white.withValues(alpha: 0.1),
                            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Roadmap Title
                  Text(
                    'Feature Roadmap Preview',
                    style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),

                  // 1. AI Voice Viva
                  _buildRoadmapCard(
                    icon: Icons.mic_external_on_rounded,
                    iconBg: const Color(0xFF00D6D6),
                    title: 'AI Technical Voice & Architectural Viva',
                    subtitle:
                        'Adaptive AI interviewer simulates live technical screenings, asking targeted deep-dive questions based on your course curriculum.',
                    badge: 'Real-Time Concept Analysis',
                  ),

                  // 2. 1-on-1 Faculty Mock
                  _buildRoadmapCard(
                    icon: Icons.video_camera_front_rounded,
                    iconBg: const Color(0xFF8B5CF6),
                    title: '1-on-1 Faculty Mock Screening',
                    subtitle:
                        'Schedule a 45-minute live 1-on-1 video mock interview with Lead Course Architect (Jay Kumar) to fine-tune your problem-solving presentation.',
                    badge: 'Direct Mentorship & Rubric Feedback',
                  ),

                  // 3. Diagnostic Matrix
                  _buildRoadmapCard(
                    icon: Icons.analytics_outlined,
                    iconBg: const Color(0xFFF59E0B),
                    title: 'Interview Readiness Diagnostic Matrix',
                    subtitle:
                        'Receive granular rubric scoring on System Architecture, Algorithmic Precision, Code Quality, and Engineering Communication.',
                    badge: 'Personalized Improvement Roadmap',
                  ),

                  // 4. Referral Gateway
                  _buildRoadmapCard(
                    icon: Icons.work_outline_rounded,
                    iconBg: const Color(0xFF10B981),
                    title: 'Enterprise Placement Referral Gateway',
                    subtitle:
                        'Candidates scoring ≥ 85% on their mock evaluations receive direct resume routing and referrals to TechGration hiring partners.',
                    badge: 'Fast-Track Recruiter Visibility',
                  ),

                  const SizedBox(height: 20),

                  // Action Button
                  BouncingButton(
                    scaleDown: 0.96,
                    onTap: () {
                      if (!isEligible) {
                        HapticService.heavyImpact();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Curriculum in progress. Complete upcoming course lessons to unlock!'),
                            backgroundColor: Color(0xFF0284C7),
                          ),
                        );
                      } else {
                        HapticService.success();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Opening 1-on-1 Faculty Booking Calendar... 🎯'),
                            backgroundColor: Color(0xFF047857),
                          ),
                        );
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: isEligible
                            ? const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)])
                            : null,
                        color: isEligible ? null : AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(16),
                        border: isEligible ? null : Border.all(color: AppColors.borderLight),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        isEligible ? 'Schedule 1-on-1 Faculty Mock Screening 🎯' : '🔒 Complete Course to Unlock Placement Viva',
                        style: TextStyle(
                          color: isEligible ? Colors.white : AppColors.textMuted,
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
      ),
    );
  }

  Widget _buildRoadmapCard({
    required IconData icon,
    required Color iconBg,
    required String title,
    required String subtitle,
    required String badge,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: iconBg.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconBg, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(subtitle, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.bolt_rounded, size: 14, color: Color(0xFF008A8A)),
                const SizedBox(width: 4),
                Text(
                  badge,
                  style: const TextStyle(color: Color(0xFF008A8A), fontWeight: FontWeight.w700, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
