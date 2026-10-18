import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../auth/login_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  double _pageOffset = 0.0;

  @override
  void initState() {
    super.initState();
    _pageController.addListener(() {
      setState(() {
        _pageOffset = _pageController.page ?? 0.0;
      });
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  final List<OnboardingData> _slides = [
    const OnboardingData(
      title: 'Engineering Curriculum',
      subtitle: 'Structured modules, hands-on architectural codebases, and interactive video lessons.',
      cardType: 0,
    ),
    const OnboardingData(
      title: 'Live Masterclasses',
      subtitle: 'Real-time architectural reviews, system design whiteboarding, and direct faculty Q&A.',
      cardType: 1,
    ),
    const OnboardingData(
      title: 'Verified Credentials',
      subtitle: 'Earn cryptographically hashed certificates with public verification registry lookup.',
      cardType: 2,
    ),
  ];

  void _onNext() {
    HapticService.lightTap();
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
      );
    } else {
      _finishOnboarding();
    }
  }

  void _finishOnboarding() async {
    HapticService.mediumImpact();
    await StorageService.setOnboarded(true);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
        transitionsBuilder: (context, a, secondaryAnimation, c) => FadeTransition(opacity: a, child: c),
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),
            // Carousel Card Section
            Expanded(
              flex: 11,
              child: PageView.builder(
                controller: _pageController,
                itemCount: _slides.length,
                onPageChanged: (idx) {
                  HapticService.selection();
                  setState(() => _currentPage = idx);
                },
                itemBuilder: (context, index) {
                  final delta = index - _pageOffset;
                  final angle = (delta * 0.18).clamp(-0.4, 0.4);

                  return Transform(
                    alignment: delta > 0 ? Alignment.centerLeft : Alignment.centerRight,
                    transform: Matrix4.identity()
                      ..setEntry(3, 2, 0.001)
                      ..rotateY(angle),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: _buildGraphicCard(_slides[index].cardType),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Content Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _slides[_currentPage].title,
                    style: AppTypography.displayLarge.copyWith(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _slides[_currentPage].subtitle,
                    style: AppTypography.bodyLarge.copyWith(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Diamond Indicators (Screenshot 2)
                  Row(
                    children: List.generate(
                      _slides.length,
                      (i) => Container(
                        margin: const EdgeInsets.only(right: 8),
                        width: i == _currentPage ? 10 : 8,
                        height: i == _currentPage ? 10 : 8,
                        decoration: BoxDecoration(
                          color: i == _currentPage ? AppColors.primaryDark : AppColors.divider,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Bottom Dual Buttons (Screenshot 2)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: [
                  Expanded(
                    child: BouncingButton(
                      onTap: _finishOnboarding,
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: AppColors.borderLight,
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            'Skip',
                            style: AppTypography.titleLarge.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryDark,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: BouncingButton(
                      onTap: _onNext,
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.primaryDark,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: AppColors.buttonShadow,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _currentPage == _slides.length - 1 ? 'Get Started' : 'Next',
                              style: AppTypography.buttonText,
                            ),
                            const SizedBox(width: 6),
                            const Icon(
                              Icons.arrow_forward_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGraphicCard(int type) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Main Warm Orange Gradient Card (Screenshot 2)
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFFFFB800),
                Color(0xFFFF5500),
              ],
            ),
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF5500).withValues(alpha: 0.24),
                blurRadius: 28,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const SizedBox(height: 12),
              // White stylized top icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.people_alt_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(height: 18),

              // Stacked Frosted Cards (Screenshot 2)
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'SYSTEMS ARCHITECTURE',
                            style: AppTypography.pillText.copyWith(
                              color: AppColors.accentOrange,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF5500),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.code_rounded, color: Colors.white, size: 13),
                                const SizedBox(width: 4),
                                Text(
                                  'PROD',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'FullStack Next.js 16, Distributed Databases & ML Systems.',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      const Divider(color: AppColors.borderLight),
                      const Spacer(),

                      // Card 2
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'CURRICULUM MODULES',
                            style: AppTypography.pillText.copyWith(
                              color: AppColors.accentOrange,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFF9500),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 13),
                                const SizedBox(width: 4),
                                Text(
                                  '4K',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Watch high-definition lessons and track your progress in real-time.',
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      const Divider(color: AppColors.borderLight),
                      const Spacer(),

                      // Card 3
                      Center(
                        child: Text(
                          'PRACTICAL • Zero fluff, enterprise engineering',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.accentOrange,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Floating Circular Blue Button (Screenshot 2 bottom right)
        Positioned(
          bottom: -16,
          right: 18,
          child: Container(
            width: 62,
            height: 62,
            decoration: BoxDecoration(
              color: AppColors.accentBlue,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.28),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.work_outline_rounded,
                color: Colors.white,
                size: 28,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class OnboardingData {
  final String title;
  final String subtitle;
  final int cardType;

  const OnboardingData({
    required this.title,
    required this.subtitle,
    required this.cardType,
  });
}
