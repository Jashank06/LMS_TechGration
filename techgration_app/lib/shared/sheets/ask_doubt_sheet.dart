import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../widgets/bouncing_button.dart';

class AskDoubtSheet extends StatefulWidget {
  const AskDoubtSheet({super.key});

  @override
  State<AskDoubtSheet> createState() => _AskDoubtSheetState();
}

class _AskDoubtSheetState extends State<AskDoubtSheet> with SingleTickerProviderStateMixin {
  final TextEditingController _doubtController = TextEditingController();
  int _selectedTag = 0;
  bool _isRecording = false;
  late AnimationController _waveController;

  final List<String> _tags = ['Next.js 16', 'Flutter Mobile', 'MongoDB', 'DSA & Graphs'];

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _doubtController.dispose();
    _waveController.dispose();
    super.dispose();
  }

  void _toggleRecording() {
    HapticService.mediumImpact();
    setState(() => _isRecording = !_isRecording);
  }

  void _submitDoubt() {
    HapticService.success();
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Doubt broadcasted to Mentor Hub! ETA: ~4 mins'),
        backgroundColor: AppColors.primaryDark,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 16,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
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
          const SizedBox(height: 18),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Ask Mentor a Doubt 💡',
                style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text(
                      '4 Mentors Live',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.success, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Topic Tag Selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_tags.length, (i) {
                final isSelected = _selectedTag == i;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: BouncingButton(
                    scaleDown: 0.95,
                    onTap: () {
                      HapticService.selection();
                      setState(() => _selectedTag = i);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primaryDark : AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _tags[i],
                        style: AppTypography.bodySmall.copyWith(
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          const SizedBox(height: 16),

          // Doubt Text Field
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: TextField(
              controller: _doubtController,
              maxLines: 4,
              cursorColor: AppColors.accentOrange,
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                hintText: 'Describe your issue or paste code snippet error...',
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Voice Note Simulator + Submit Button
          Row(
            children: [
              BouncingButton(
                onTap: _toggleRecording,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: _isRecording ? const Color(0xFFFFECEB) : AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: _isRecording ? AppColors.error : AppColors.borderLight,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isRecording ? Icons.mic_rounded : Icons.mic_none_rounded,
                        color: _isRecording ? AppColors.error : AppColors.textPrimary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isRecording ? 'Recording...' : 'Voice Note',
                        style: AppTypography.bodySmall.copyWith(
                          color: _isRecording ? AppColors.error : AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: BouncingButton(
                  onTap: _submitDoubt,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.accentOrange,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: AppColors.orangeFabShadow,
                    ),
                    child: Center(
                      child: Text(
                        'Send to Mentor 🚀',
                        style: AppTypography.buttonText.copyWith(fontSize: 14),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
