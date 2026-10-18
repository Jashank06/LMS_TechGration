import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';
import '../widgets/bouncing_button.dart';

class SubmitAssignmentSheet extends StatefulWidget {
  final String assignmentTitle;

  const SubmitAssignmentSheet({
    super.key,
    this.assignmentTitle = 'Course Deliverable',
  });

  @override
  State<SubmitAssignmentSheet> createState() => _SubmitAssignmentSheetState();
}

class _SubmitAssignmentSheetState extends State<SubmitAssignmentSheet> {
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isValidUrl = false;

  @override
  void dispose() {
    _urlController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _onUrlChanged(String val) {
    final valid = (val.contains('github.com/') || val.contains('vercel.app') || val.contains('http')) && val.length > 10;
    if (valid != _isValidUrl) {
      if (valid) HapticService.lightTap();
      setState(() => _isValidUrl = valid);
    }
  }

  void _submit() {
    HapticService.success();
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Assignment deliverable submitted to senior faculty for review! 🚀'),
        backgroundColor: Color(0xFF008A8A),
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

          Text(
            'Submit Practical Deliverable 📋',
            style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            widget.assignmentTitle,
            style: AppTypography.bodySmall.copyWith(
              color: const Color(0xFF008A8A),
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 20),

          // GitHub Repo / Hosted Demo Input
          Text(
            'Repository or Deployment Link',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: _isValidUrl ? const Color(0xFF008A8A) : AppColors.borderLight,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.link_rounded, size: 20, color: Color(0xFF008A8A)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _urlController,
                    cursorColor: const Color(0xFF008A8A),
                    style: AppTypography.bodyMedium,
                    decoration: const InputDecoration(
                      hintText: 'https://github.com/username/project',
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    onChanged: _onUrlChanged,
                  ),
                ),
                if (_isValidUrl)
                  const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Optional Notes
          Text(
            'Notes for Senior Faculty (Optional)',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: TextField(
              controller: _notesController,
              maxLines: 2,
              style: AppTypography.bodyMedium,
              decoration: const InputDecoration(
                hintText: 'Architecture design choices, environment details...',
                border: InputBorder.none,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Submit Button
          BouncingButton(
            onTap: _submit,
            child: Container(
              height: 52,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Turn In Assignment',
                      style: AppTypography.buttonText.copyWith(color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
