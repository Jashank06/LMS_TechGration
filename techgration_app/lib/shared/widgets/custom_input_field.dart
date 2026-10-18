import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';

class CustomInputField extends StatefulWidget {
  final String label;
  final String hintText;
  final TextEditingController controller;
  final TextInputType keyboardType;
  final bool isPhone;
  final bool isPassword;
  final Widget? prefixIcon;
  final String countryCode;
  final Function(String)? onChanged;
  final String? errorText;

  const CustomInputField({
    super.key,
    required this.label,
    required this.hintText,
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.isPhone = false,
    this.isPassword = false,
    this.prefixIcon,
    this.countryCode = '+91',
    this.onChanged,
    this.errorText,
  });

  @override
  State<CustomInputField> createState() => _CustomInputFieldState();
}

class _CustomInputFieldState extends State<CustomInputField> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.isPassword;
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
      if (_focusNode.hasFocus) {
        HapticService.lightTap();
      }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label.isNotEmpty) ...[
          Text(
            widget.label,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Container(
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: widget.errorText != null
                  ? AppColors.error
                  : (_isFocused ? AppColors.primaryDark : AppColors.borderLight),
              width: _isFocused ? 1.5 : 1.0,
            ),
          ),
          child: Row(
            children: [
              if (widget.isPhone) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    widget.countryCode,
                    style: AppTypography.titleLarge.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 28,
                  color: AppColors.divider,
                ),
                const SizedBox(width: 14),
              ],
              if (widget.prefixIcon != null) ...[
                Padding(
                  padding: const EdgeInsets.only(left: 14, right: 10),
                  child: widget.prefixIcon,
                ),
              ] else if (!widget.isPhone) ...[
                const SizedBox(width: 16),
              ],
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  focusNode: _focusNode,
                  keyboardType: widget.keyboardType,
                  obscureText: widget.isPassword ? _obscureText : false,
                  cursorColor: AppColors.accentOrange, // Screenshot 1: orange blinking cursor
                  cursorWidth: 2.2,
                  cursorRadius: const Radius.circular(2),
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                    letterSpacing: widget.isPhone ? 1.2 : 0,
                  ),
                  decoration: InputDecoration(
                    hintText: widget.hintText,
                    hintStyle: AppTypography.titleLarge.copyWith(
                      color: AppColors.textMuted,
                      fontWeight: FontWeight.w500,
                      fontSize: 15,
                      letterSpacing: widget.isPhone ? 1.2 : 0,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onChanged: (val) {
                    HapticService.lightTap();
                    widget.onChanged?.call(val);
                  },
                ),
              ),
              if (widget.isPassword) ...[
                IconButton(
                  onPressed: () {
                    HapticService.selection();
                    setState(() => _obscureText = !_obscureText);
                  },
                  icon: Icon(
                    _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    color: AppColors.textSecondary,
                    size: 20,
                  ),
                  splashRadius: 20,
                ),
                const SizedBox(width: 4),
              ] else ...[
                const SizedBox(width: 16),
              ],
            ],
          ),
        ),
        if (widget.errorText != null) ...[
          const SizedBox(height: 6),
          Text(
            widget.errorText!,
            style: AppTypography.bodySmall.copyWith(color: AppColors.error),
          ),
        ],
      ],
    );
  }
}
