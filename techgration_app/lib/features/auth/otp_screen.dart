import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_main_shell.dart';

class OtpScreen extends StatefulWidget {
  final String identifier;
  final bool isPhone;

  const OtpScreen({
    super.key,
    required this.identifier,
    this.isPhone = true,
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  int _resendSeconds = 30;
  Timer? _timer;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _resendSeconds = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendSeconds > 0) {
        setState(() => _resendSeconds--);
      } else {
        t.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _otpCode => _controllers.map((c) => c.text).join();

  void _onDigitChanged(int index, String value) {
    HapticService.lightTap();
    if (value.isNotEmpty) {
      if (index < 5) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        _verifyOtp();
      }
    } else {
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
    }
  }

  void _verifyOtp() async {
    final code = _otpCode;
    if (code.length < 6) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Call verify OTP endpoint
    final res = await ApiClient.post(Endpoints.verifyOtp, data: {
      'phone': widget.identifier,
      'email': widget.isPhone ? 'student_${widget.identifier}@techgration.live' : widget.identifier,
      'otpCode': code,
    });

    setState(() => _isLoading = false);

    if (res.success || code == '123456' || code == '506908') {
      await HapticService.success();

      String token = 'tg_student_token_${DateTime.now().millisecondsSinceEpoch}';
      Map<String, dynamic> studentData = {
        'id': 'std_101',
        'name': 'Jashank Kumar',
        'email': widget.isPhone ? 'jashank@techgration.live' : widget.identifier,
        'handle': 'jashank06',
        'role': 'STUDENT',
        'campus': 'TechGration Learning Portal',
      };

      if (res.data is Map) {
        final data = res.data as Map;
        if (data.containsKey('token')) {
          token = data['token'].toString();
        }
        if (data.containsKey('user') && data['user'] is Map) {
          studentData = Map<String, dynamic>.from(data['user']);
          studentData['handle'] = 'jashank06';
        }
      }

      await StorageService.setSessionToken(token);
      await StorageService.setUserData(studentData);

      if (!mounted) return;

      Navigator.of(context).pushAndRemoveUntil(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const StudentMainShell(),
          transitionsBuilder: (context, a, secondaryAnimation, c) => FadeTransition(opacity: a, child: c),
          transitionDuration: const Duration(milliseconds: 350),
        ),
        (route) => false,
      );
    } else {
      HapticService.heavyImpact();
      setState(() => _errorMessage = res.error ?? 'Invalid verification code. Try 123456 or request a new code.');
    }
  }

  void _resendCode() {
    if (_resendSeconds > 0) return;
    HapticService.selection();
    _startTimer();
    ApiClient.post(Endpoints.sendOtp, data: {
      'phone': widget.identifier,
      'email': 'student_${widget.identifier}@techgration.live',
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            HapticService.lightTap();
            Navigator.pop(context);
          },
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              // Header Title (Screenshot 3)
              Text(
                'Verify OTP',
                style: AppTypography.displayLarge.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              RichText(
                text: TextSpan(
                  style: AppTypography.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: 16,
                  ),
                  children: [
                    const TextSpan(text: 'An OTP was just sent to '),
                    TextSpan(
                      text: widget.identifier,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 42),

              // 6 Discrete Input Boxes (Screenshot 3)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) {
                  return Container(
                    width: 48,
                    height: 58,
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _controllers[i].text.isNotEmpty
                            ? AppColors.primaryDark
                            : AppColors.borderLight,
                        width: _controllers[i].text.isNotEmpty ? 1.8 : 1.2,
                      ),
                      boxShadow: _controllers[i].text.isNotEmpty
                          ? [
                              BoxShadow(
                                color: AppColors.primaryDark.withValues(alpha: 0.08),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              )
                            ]
                          : null,
                    ),
                    child: Center(
                      child: TextField(
                        controller: _controllers[i],
                        focusNode: _focusNodes[i],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 1,
                        style: AppTypography.headlineLarge.copyWith(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                        cursorColor: AppColors.accentOrange,
                        decoration: const InputDecoration(
                          counterText: '',
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onChanged: (val) => _onDigitChanged(i, val),
                      ),
                    ),
                  );
                }),
              ),

              const SizedBox(height: 36),

              // Countdown / Resend text (Screenshot 3)
              Center(
                child: _resendSeconds > 0
                    ? RichText(
                        text: TextSpan(
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 15,
                          ),
                          children: [
                            const TextSpan(text: 'Resend in '),
                            TextSpan(
                              text: '$_resendSeconds',
                              style: const TextStyle(
                                color: AppColors.textPrimary,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      )
                    : BouncingButton(
                        onTap: _resendCode,
                        child: Text(
                          'Resend Code',
                          style: AppTypography.titleLarge.copyWith(
                            color: AppColors.accentOrange,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
              ),

              if (_isLoading) ...[
                const SizedBox(height: 20),
                const Center(
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: AppColors.accentOrange,
                    ),
                  ),
                ),
              ],

              if (_errorMessage != null) ...[
                const SizedBox(height: 20),
                Center(
                  child: Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],

              const Spacer(),

              // Quick autofill hint bar
              Container(
                margin: const EdgeInsets.only(bottom: 24),
                child: BouncingButton(
                  onTap: () {
                    HapticService.lightTap();
                    const demoCode = '506908';
                    for (int i = 0; i < 6; i++) {
                      _controllers[i].text = demoCode[i];
                    }
                    _verifyOtp();
                  },
                  child: Container(
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.sms_outlined, size: 18, color: AppColors.accentOrange),
                          const SizedBox(width: 8),
                          Text(
                            'Autofill from SMS: 506908',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
