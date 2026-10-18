import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../widgets/bouncing_button.dart';

class SupportHelpdeskSheet extends StatelessWidget {
  const SupportHelpdeskSheet({super.key});

  Future<void> _launchUrl(BuildContext context, String urlString) async {
    final uri = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open: $urlString')),
        );
      }
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  void _copyToClipboard(BuildContext context, String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    HapticService.lightTap();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard! 📋'),
        backgroundColor: const Color(0xFF008A8A),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
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
          const SizedBox(height: 18),
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.headset_mic_rounded, color: Color(0xFF008A8A), size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Student Helpdesk',
                      style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 18),
                    ),
                    Text(
                      '24x7 Faculty & Technical Support',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 22),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Expanded(
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: [
                // Channel 1: WhatsApp Hotline
                _buildChannelTile(
                  icon: Icons.chat_rounded,
                  iconColor: const Color(0xFF22C55E),
                  title: 'WhatsApp Faculty Hotline',
                  subtitle: '+91 91702 96644 • Instant mentor replies',
                  actionLabel: 'Chat on WhatsApp',
                  onTap: () {
                    HapticService.selection();
                    _launchUrl(context, 'https://wa.me/919170296644?text=Hi%20TechGration%20Faculty%2C%20I%20need%20assistance%20with%20my%20learning%20portal.');
                  },
                ),
                const SizedBox(height: 12),

                // Channel 2: Official Email Support
                _buildChannelTile(
                  icon: Icons.mail_outline_rounded,
                  iconColor: const Color(0xFF0284C7),
                  title: 'Official Email Support',
                  subtitle: 'support@techgration.live • 24h SLA',
                  actionLabel: 'Copy Email',
                  onTap: () {
                    _copyToClipboard(context, 'support@techgration.live', 'Support email');
                  },
                ),
                const SizedBox(height: 12),

                // Channel 3: Discord / Slack Community
                _buildChannelTile(
                  icon: Icons.groups_rounded,
                  iconColor: const Color(0xFF8B5CF6),
                  title: 'Student Community Gateway',
                  subtitle: 'Connect with 1000+ peers & mentors',
                  actionLabel: 'Join Discord',
                  onTap: () {
                    HapticService.selection();
                    _launchUrl(context, 'https://campus.techgration.live');
                  },
                ),
                const SizedBox(height: 24),

                // Frequently Asked Questions
                Text(
                  'Frequently Asked Questions',
                  style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 16),
                ),
                const SizedBox(height: 10),

                _buildFaqItem(
                  question: 'How do I join live interactive masterclasses?',
                  answer:
                      'All scheduled live classes appear under the "Live" tab. 15 minutes before the start time, a direct "Join Masterclass" button connects you to the live Zoom or Google Meet room.',
                ),
                _buildFaqItem(
                  question: 'How are practical assignments graded?',
                  answer:
                      'Once you submit your GitHub repository or deployment link, senior faculty reviews your architecture, code cleanliness, and tests, providing rubric marks and detailed feedback within 48-72 hours.',
                ),
                _buildFaqItem(
                  question: 'When is my verified certificate unlocked?',
                  answer:
                      'Your cryptographically hashed certificate is unlocked upon completing 100% of the course lectures and passing the scenario-based evaluations.',
                ),
                _buildFaqItem(
                  question: 'How do I win the Champion Swag merchandise?',
                  answer:
                      'Achieve and maintain the #1 Rank on your course cohort leaderboard. Champions unlock free delivery of TechGration Signature T-Shirts, Caps, and Tech Gear.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String actionLabel,
    required VoidCallback onTap,
  }) {
    return Container(
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
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 14)),
                const SizedBox(height: 2),
                Text(subtitle, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          BouncingButton(
            scaleDown: 0.94,
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                actionLabel,
                style: const TextStyle(color: Color(0xFF008A8A), fontWeight: FontWeight.w800, fontSize: 11),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFaqItem({required String question, required String answer}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
        title: Text(
          question,
          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700, fontSize: 13),
        ),
        iconColor: const Color(0xFF008A8A),
        collapsedIconColor: AppColors.textSecondary,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 14, right: 14, bottom: 14),
            child: Text(
              answer,
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary, height: 1.45),
            ),
          ),
        ],
      ),
    );
  }
}
