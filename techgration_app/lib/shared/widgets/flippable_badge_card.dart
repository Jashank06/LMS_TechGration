import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';

class FlippableBadgeCard extends StatefulWidget {
  final String emoji;
  final String title;
  final String subtitle;
  final String rarity;
  final String unlockedDate;
  final Color bgColor;
  final Color textColor;

  const FlippableBadgeCard({
    super.key,
    required this.emoji,
    required this.title,
    required this.subtitle,
    this.rarity = 'LEGENDARY',
    this.unlockedDate = 'Oct 14, 2026',
    required this.bgColor,
    required this.textColor,
  });

  @override
  State<FlippableBadgeCard> createState() => _FlippableBadgeCardState();
}

class _FlippableBadgeCardState extends State<FlippableBadgeCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _flipCard() {
    HapticService.lightTap();
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() => _isFront = !_isFront);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flipCard,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * pi;
          final isUnderHalfway = _animation.value <= 0.5;

          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001) // perspective
              ..rotateY(angle),
            child: isUnderHalfway ? _buildFront() : _buildBack(),
          );
        },
      ),
    );
  }

  Widget _buildFront() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: widget.bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.textColor.withValues(alpha: 0.2)),
        boxShadow: AppColors.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(widget.emoji, style: const TextStyle(fontSize: 30)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: widget.textColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  widget.rarity,
                  style: TextStyle(
                    color: widget.textColor,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.title,
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            widget.subtitle,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    return Transform(
      alignment: Alignment.center,
      transform: Matrix4.identity()..rotateY(pi), // counter-rotate for back side
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.primaryDark,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppColors.buttonShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                const Icon(Icons.verified_user_rounded, color: AppColors.accentOrange, size: 16),
                const SizedBox(width: 6),
                Text(
                  'VERIFIED BADGE',
                  style: AppTypography.bodySmall.copyWith(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Unlocked: ${widget.unlockedDate}',
              style: AppTypography.bodySmall.copyWith(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Hash: 0x9f8...2b4c',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textMuted,
                fontSize: 10,
                fontFamily: 'monospace',
              ),
            ),
            const Spacer(),
            Center(
              child: Text(
                'Tap to flip ↺',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.accentOrange,
                  fontWeight: FontWeight.w700,
                  fontSize: 10,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
