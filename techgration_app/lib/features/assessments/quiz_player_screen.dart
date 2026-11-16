import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';

class QuizPlayerScreen extends StatefulWidget {
  final String assessmentId;
  final String assessmentTitle;

  const QuizPlayerScreen({
    super.key,
    required this.assessmentId,
    required this.assessmentTitle,
  });

  @override
  State<QuizPlayerScreen> createState() => _QuizPlayerScreenState();
}

class _QuizPlayerScreenState extends State<QuizPlayerScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  Map<String, dynamic>? _assessmentData;
  List<Map<String, dynamic>> _questions = [];

  int _currentIndex = 0;
  final Map<String, String> _selectedAnswers = {}; // questionId -> optionId

  Timer? _timer;
  int _secondsRemaining = 0;
  bool _isSubmitting = false;

  Map<String, dynamic>? _result; // Result from submission

  @override
  void initState() {
    super.initState();
    _fetchAssessmentDetails();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchAssessmentDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiClient.get(Endpoints.assessmentDetail(widget.assessmentId));
      if (res.success && res.data is Map && res.data['assessment'] != null) {
        final a = res.data['assessment'] as Map<String, dynamic>;
        final rawQ = (a['questions'] as List<dynamic>?) ?? [];
        final questions = rawQ.map((q) => Map<String, dynamic>.from(q as Map)).toList();

        final timeSec = (a['timeLimitSec'] as int?) ?? ((a['timeLimitMinutes'] as int? ?? 15) * 60);

        if (mounted) {
          setState(() {
            _assessmentData = a;
            _questions = questions;
            _secondsRemaining = timeSec > 0 ? timeSec : 900;
            _isLoading = false;
          });
          _startTimer();
        }
        return;
      } else {
        if (mounted) {
          setState(() {
            _errorMessage = res.error ?? 'Failed to load evaluation questions.';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_secondsRemaining <= 1) {
        timer.cancel();
        setState(() => _secondsRemaining = 0);
        _submitEvaluation(autoSubmit: true);
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  String _formatTimer(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _selectOption(String questionId, String optionId) {
    HapticService.selection();
    setState(() {
      _selectedAnswers[questionId] = optionId;
    });
  }

  Future<bool> _onWillPop() async {
    if (_result != null) return true;

    final shouldQuit = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Quit Evaluation?', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        content: const Text(
          'If you exit now, your answers will not be recorded and this evaluation attempt will be cancelled.',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Resume Quiz', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF008A8A))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Quit', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.red)),
          ),
        ],
      ),
    );

    return shouldQuit == true;
  }

  void _confirmSubmit() async {
    HapticService.mediumImpact();
    final answeredCount = _selectedAnswers.length;
    final totalCount = _questions.length;
    final unansweredCount = totalCount - answeredCount;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Submit Evaluation?', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        content: Text(
          unansweredCount > 0
              ? 'You have answered $answeredCount of $totalCount questions ($unansweredCount unanswered). Are you sure you want to finalize and submit?'
              : 'You have answered all $totalCount questions! Are you ready to submit for final grading?',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Review Answers', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          ),
          BouncingButton(
            onTap: () => Navigator.pop(ctx, true),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                'Submit Now 🚀',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      _submitEvaluation();
    }
  }

  Future<void> _submitEvaluation({bool autoSubmit = false}) async {
    if (_isSubmitting) return;

    _timer?.cancel();
    setState(() => _isSubmitting = true);

    try {
      final res = await ApiClient.post(
        Endpoints.submitAssessment(widget.assessmentId),
        data: {'answers': _selectedAnswers},
      );

      if (res.success && res.data is Map) {
        HapticService.heavyImpact();
        if (mounted) {
          setState(() {
            _result = Map<String, dynamic>.from(res.data as Map);
            _isSubmitting = false;
          });
        }
      } else {
        if (mounted) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.error ?? 'Failed to submit quiz attempt.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Submission error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: Text(widget.assessmentTitle, style: AppTypography.headlineMedium.copyWith(fontSize: 16)),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFF00D6D6)),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(title: const Text('Evaluation')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded, size: 48, color: Colors.red),
                const SizedBox(height: 14),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 18),
                BouncingButton(
                  onTap: _fetchAssessmentDetails,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00D6D6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('Try Again', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // If quiz is finished, render Score Summary Card
    if (_result != null) {
      return _buildResultScreen();
    }

    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(title: Text(widget.assessmentTitle)),
        body: const Center(
          child: Text('No questions configured in this assessment yet.'),
        ),
      );
    }

    final currentQuestion = _questions[_currentIndex];
    final qId = currentQuestion['id']?.toString() ?? '';
    final prompt = currentQuestion['prompt']?.toString() ?? '';
    final points = currentQuestion['points'] as int? ?? 10;
    final options = (currentQuestion['options'] as List<dynamic>?) ?? [];
    final selectedOptionId = _selectedAnswers[qId];

    final isUrgentTime = _secondsRemaining < 120;
    final progressPct = (_currentIndex + 1) / _questions.length;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close_rounded, size: 22),
            onPressed: () async {
              if (await _onWillPop() && context.mounted) {
                Navigator.pop(context);
              }
            },
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.assessmentTitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
              ),
              Text(
                'Question ${_currentIndex + 1} of ${_questions.length}',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          actions: [
            // Live Countdown Timer Badge
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isUrgentTime ? const Color(0xFFFEF2F2) : const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isUrgentTime ? const Color(0xFFFCA5A5) : const Color(0xFF86EFAC),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.timer_outlined,
                    size: 14,
                    color: isUrgentTime ? const Color(0xFFDC2626) : const Color(0xFF16A34A),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _formatTimer(_secondsRemaining),
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      color: isUrgentTime ? const Color(0xFFDC2626) : const Color(0xFF16A34A),
                    ),
                  ),
                ],
              ),
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(4),
            child: LinearProgressIndicator(
              value: progressPct,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00D6D6)),
              minHeight: 4,
            ),
          ),
        ),
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Question Box Header Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
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
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'QUESTION ${_currentIndex + 1}',
                                    style: const TextStyle(
                                      color: Color(0xFF008A8A),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 10,
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.bolt_rounded, size: 12, color: Color(0xFFF59E0B)),
                                      const SizedBox(width: 4),
                                      Text(
                                        '+$points PTS',
                                        style: const TextStyle(
                                          color: Color(0xFFD97706),
                                          fontWeight: FontWeight.w800,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Text(
                              prompt,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      const Text(
                        'Select the correct answer:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Multiple Choice Options List
                      for (int i = 0; i < options.length; i++) ...[
                        _buildOptionTile(
                          option: options[i] as Map<String, dynamic>,
                          index: i,
                          questionId: qId,
                          isSelected: selectedOptionId == (options[i]['id']?.toString() ?? ''),
                        ),
                        const SizedBox(height: 10),
                      ],
                    ],
                  ),
                ),
              ),

              // Bottom Navigation & Submit Bar
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: AppColors.borderLight)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, -3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Previous Question Button
                    if (_currentIndex > 0)
                      Expanded(
                        child: BouncingButton(
                          scaleDown: 0.96,
                          onTap: () {
                            HapticService.selection();
                            setState(() => _currentIndex--);
                          },
                          child: Container(
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.surfaceLight,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            alignment: Alignment.center,
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.arrow_back_rounded, size: 18, color: AppColors.textPrimary),
                                SizedBox(width: 6),
                                Text(
                                  'Previous',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                    else
                      const Spacer(),

                    const SizedBox(width: 12),

                    // Next / Submit Button
                    Expanded(
                      flex: 2,
                      child: BouncingButton(
                        scaleDown: 0.96,
                        onTap: () {
                          if (_currentIndex < _questions.length - 1) {
                            HapticService.selection();
                            setState(() => _currentIndex++);
                          } else {
                            _confirmSubmit();
                          }
                        },
                        child: Container(
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentIndex < _questions.length - 1 ? 'Next Question' : 'Submit Evaluation 🚀',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(
                                _currentIndex < _questions.length - 1 ? Icons.arrow_forward_rounded : Icons.check_circle_rounded,
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
      ),
    );
  }

  Widget _buildOptionTile({
    required Map<String, dynamic> option,
    required int index,
    required String questionId,
    required bool isSelected,
  }) {
    final optionId = (option['id'] ?? '').toString();
    final optionText = (option['text'] ?? option['label'] ?? '').toString();
    final optionLetter = String.fromCharCode(65 + index); // A, B, C, D

    return BouncingButton(
      scaleDown: 0.98,
      onTap: () => _selectOption(questionId, optionId),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE6FFFA) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF00D6D6) : AppColors.borderLight,
            width: isSelected ? 2.0 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF00D6D6) : AppColors.surfaceLight,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF00D6D6) : AppColors.borderLight,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                optionLetter,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                optionText,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? const Color(0xFF008A8A) : AppColors.textPrimary,
                  height: 1.35,
                ),
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: Color(0xFF00D6D6), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildResultScreen() {
    final scorePercent = (_result?['scorePercent'] as num?)?.round() ?? 0;
    final isPassed = _result?['isPassed'] == true;
    final correctCount = _result?['correctCount'] as int? ?? 0;
    final totalQ = _result?['totalQuestions'] as int? ?? _questions.length;
    final earnedMarks = _result?['earnedMarks'] as int? ?? 0;
    final totalMarks = _result?['totalPossibleMarks'] as int? ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Evaluation Result'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              // Score Banner Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isPassed
                        ? [const Color(0xFF064E3B), const Color(0xFF0F172A)]
                        : [const Color(0xFF450A0A), const Color(0xFF0F172A)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isPassed ? const Color(0xFF10B981) : Colors.redAccent,
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isPassed
                          ? const Color(0xFF10B981).withValues(alpha: 0.2)
                          : Colors.red.withValues(alpha: 0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Badge: PASSED / RETAKE NEEDED
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: (isPassed ? const Color(0xFF10B981) : Colors.redAccent).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isPassed ? Icons.emoji_events_rounded : Icons.info_outline_rounded,
                            size: 14,
                            color: isPassed ? const Color(0xFF34D399) : Colors.redAccent,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            isPassed ? 'EVALUATION PASSED 🏆' : 'RETAKE RECOMMENDED',
                            style: TextStyle(
                              color: isPassed ? const Color(0xFF34D399) : Colors.redAccent,
                              fontWeight: FontWeight.w900,
                              fontSize: 11,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Big Circular Score Gauge
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF0F172A),
                        border: Border.all(
                          color: isPassed ? const Color(0xFF10B981) : Colors.redAccent,
                          width: 3,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$scorePercent%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 26,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),
                    Text(
                      isPassed ? 'Mastery Verified!' : 'Keep Practicing!',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isPassed
                          ? 'Outstanding work! Your evaluation score has been recorded and added to your course leaderboard.'
                          : 'You need at least ${_assessmentData?['passingScorePercent'] ?? 70}% to pass. Review your lecture notes and retake.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 12, height: 1.4),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Metrics Row Cards
              Row(
                children: [
                  Expanded(
                    child: _buildMetricCard(
                      label: 'Correct Answers',
                      value: '$correctCount / $totalQ',
                      icon: Icons.check_circle_outline_rounded,
                      iconColor: const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildMetricCard(
                      label: 'Marks Earned',
                      value: '$earnedMarks / $totalMarks',
                      icon: Icons.bolt_rounded,
                      iconColor: const Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Action Buttons
              BouncingButton(
                scaleDown: 0.97,
                onTap: () {
                  HapticService.lightTap();
                  Navigator.pop(context);
                },
                child: Container(
                  height: 48,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'Back to Academics Hub',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              TextButton(
                onPressed: () {
                  HapticService.lightTap();
                  setState(() {
                    _result = null;
                    _currentIndex = 0;
                    _selectedAnswers.clear();
                  });
                  _fetchAssessmentDetails();
                },
                child: const Text(
                  'Retake Evaluation',
                  style: TextStyle(color: Color(0xFF008A8A), fontWeight: FontWeight.w800, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String label,
    required String value,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
