import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';

class ReferEarnScreen extends StatefulWidget {
  const ReferEarnScreen({super.key});

  @override
  State<ReferEarnScreen> createState() => _ReferEarnScreenState();
}

class _ReferEarnScreenState extends State<ReferEarnScreen> {
  bool _isLoading = true;

  String _referralCode = 'TG-LEARN';
  int _totalInvited = 0;
  int _totalEnrolled = 0;
  int _cashbackEarned = 0;
  final String _supportPhone = '9911752744';
  List<Map<String, dynamic>> _referrals = [];

  @override
  void initState() {
    super.initState();
    _fetchReferralStats();
  }

  Future<void> _fetchReferralStats() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final res = await ApiClient.get(Endpoints.referStats);
      if (res.success && res.data is Map && res.data['stats'] != null) {
        final s = res.data['stats'] as Map<String, dynamic>;
        final rawList = (s['referrals'] as List<dynamic>?) ?? [];

        if (mounted) {
          setState(() {
            _referralCode = (s['referralCode'] as String?) ?? 'TG-LEARN';
            _totalInvited = (s['totalInvited'] as num?)?.toInt() ?? 0;
            _totalEnrolled = (s['totalEnrolled'] as num?)?.toInt() ?? 0;
            _cashbackEarned = (s['cashbackEarned'] as num?)?.toInt() ?? 0;
            _referrals = rawList.map((r) => Map<String, dynamic>.from(r as Map)).toList();
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

  void _copyReferralCode() {
    HapticService.selection();
    Clipboard.setData(ClipboardData(text: _referralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Referral Code $_referralCode copied to clipboard! 📋'),
        backgroundColor: const Color(0xFF008A8A),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _shareViaWhatsApp() async {
    HapticService.mediumImpact();
    final message =
        'Hey! Join TechGration Learning Portal using my referral code: $_referralCode to get exclusive course access and industry certification: https://campus.techgration.live/enroll?ref=$_referralCode';
    final url = 'https://api.whatsapp.com/send?text=${Uri.encodeComponent(message)}';
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      Clipboard.setData(ClipboardData(text: message));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Referral message copied to clipboard!')),
      );
    }
  }

  void _contactCashbackSupport() async {
    HapticService.mediumImpact();
    final message =
        'Hi TechGration Team! I would like to verify and claim my referral cashback for Refer Code: $_referralCode.';
    final url = 'https://api.whatsapp.com/send?phone=91$_supportPhone&text=${Uri.encodeComponent(message)}';
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Refer & Earn ₹500',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
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
                child: CircularProgressIndicator(color: Color(0xFF00D6D6)),
              )
            : RefreshIndicator(
                color: const Color(0xFF00D6D6),
                onRefresh: _fetchReferralStats,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  children: [
                    // Hero Glassmorphic Cashback Card
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.35)),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
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
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.card_giftcard_rounded, color: Color(0xFFF59E0B), size: 14),
                                SizedBox(width: 6),
                                Text(
                                  'UNLIMITED CASHBACK REWARDS',
                                  style: TextStyle(
                                    color: Color(0xFFF59E0B),
                                    fontWeight: FontWeight.w900,
                                    fontSize: 10,
                                    letterSpacing: 0.6,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                          const Text(
                            'Refer Friends & Earn ₹500 Cashback',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 20,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Earn flat ₹500 direct cashback into your UPI or bank account every time a friend joins TechGration and enrolls using your unique code.',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.75),
                              fontSize: 12,
                              height: 1.45,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Referral Code Box
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderLight),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'YOUR UNIQUE REFERRAL CODE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF008A8A),
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.qr_code_rounded, size: 22, color: Color(0xFF008A8A)),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _referralCode,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.5,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                                BouncingButton(
                                  scaleDown: 0.94,
                                  onTap: _copyReferralCode,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00D6D6),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.copy_rounded, size: 14, color: Colors.white),
                                        SizedBox(width: 4),
                                        Text(
                                          'Copy',
                                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Share on WhatsApp Button
                          BouncingButton(
                            scaleDown: 0.97,
                            onTap: _shareViaWhatsApp,
                            child: Container(
                              height: 46,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: const Color(0xFF25D366),
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF25D366).withValues(alpha: 0.25),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.share_rounded, color: Colors.white, size: 18),
                                  SizedBox(width: 8),
                                  Text(
                                    'Share Invite via WhatsApp',
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

                    const SizedBox(height: 20),

                    // Metrics Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildMetricTile(
                            title: 'Friends Invited',
                            value: '$_totalInvited',
                            icon: Icons.people_outline_rounded,
                            iconColor: const Color(0xFF0284C7),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            title: 'Enrolled',
                            value: '$_totalEnrolled',
                            icon: Icons.school_outlined,
                            iconColor: const Color(0xFF10B981),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildMetricTile(
                            title: 'Cashback Earned',
                            value: '₹$_cashbackEarned',
                            icon: Icons.account_balance_wallet_outlined,
                            iconColor: const Color(0xFFF59E0B),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Referrals History
                    Text(
                      'Referred Friends (${_referrals.length})',
                      style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 16),
                    ),
                    const SizedBox(height: 12),

                    if (_referrals.isEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.borderLight),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 52,
                              height: 52,
                              decoration: BoxDecoration(
                                color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.group_add_outlined, color: Color(0xFF008A8A), size: 26),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'No Friends Referred Yet',
                              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Share your referral code with your peers. Once they sign up and start a course, your cashback will appear here.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      for (final item in _referrals) ...[
                        _buildReferralCard(item),
                        const SizedBox(height: 10),
                      ],
                    ],

                    const SizedBox(height: 24),

                    // Direct Cashback Support Card
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFBBF7D0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.headset_mic_rounded, color: Colors.white, size: 22),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Ready to claim ₹500 cashback?',
                                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF065F46)),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Message our admissions desk with your UPI ID to claim.',
                                  style: TextStyle(fontSize: 11, color: Color(0xFF047857)),
                                ),
                              ],
                            ),
                          ),
                          BouncingButton(
                            scaleDown: 0.94,
                            onTap: _contactCashbackSupport,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'Claim',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 18),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildReferralCard(Map<String, dynamic> item) {
    final name = (item['name'] as String?) ?? 'Student';
    final email = (item['maskedEmail'] as String?) ?? '***@techgration.live';
    final isEnrolled = item['isEnrolled'] == true;
    final cashback = item['cashbackAmount'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isEnrolled
                  ? const Color(0xFF10B981).withValues(alpha: 0.15)
                  : const Color(0xFFF59E0B).withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isEnrolled ? Icons.check_circle_rounded : Icons.schedule_rounded,
              color: isEnrolled ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
              size: 20,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  email,
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: isEnrolled ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              isEnrolled ? '+₹$cashback ELIGIBLE' : 'PENDING',
              style: TextStyle(
                color: isEnrolled ? const Color(0xFF047857) : const Color(0xFFB45309),
                fontWeight: FontWeight.w900,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
