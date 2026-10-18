import 'package:flutter/material.dart';

class AnimatedGlowingHalo extends StatefulWidget {
  final Widget child;
  final Color glowColor;
  final double maxBlur;
  final double minBlur;
  final Duration duration;

  const AnimatedGlowingHalo({
    super.key,
    required this.child,
    this.glowColor = const Color(0xFFFF5500),
    this.maxBlur = 24.0,
    this.minBlur = 8.0,
    this.duration = const Duration(milliseconds: 1400),
  });

  @override
  State<AnimatedGlowingHalo> createState() => _AnimatedGlowingHaloState();
}

class _AnimatedGlowingHaloState extends State<AnimatedGlowingHalo> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _blurAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..repeat(reverse: true);

    _blurAnimation = Tween<double>(begin: widget.minBlur, end: widget.maxBlur).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _scaleAnimation = Tween<double>(begin: 0.98, end: 1.04).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.glowColor.withValues(alpha: 0.35 * _controller.value + 0.15),
                blurRadius: _blurAnimation.value,
                spreadRadius: 2.0 * _controller.value,
              ),
            ],
          ),
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: widget.child,
          ),
        );
      },
    );
  }
}
