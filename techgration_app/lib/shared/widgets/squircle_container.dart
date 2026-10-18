import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class SquircleContainer extends StatelessWidget {
  final double size;
  final Widget child;
  final Color backgroundColor;
  final Color borderColor;
  final double borderWidth;
  final double cornerRadius;
  final List<BoxShadow>? boxShadow;

  const SquircleContainer({
    super.key,
    required this.size,
    required this.child,
    this.backgroundColor = Colors.white,
    this.borderColor = AppColors.primaryDark,
    this.borderWidth = 1.8,
    this.cornerRadius = 32,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(cornerRadius),
        border: Border.all(
          color: borderColor,
          width: borderWidth,
        ),
        boxShadow: boxShadow,
      ),
      child: Center(child: child),
    );
  }
}
