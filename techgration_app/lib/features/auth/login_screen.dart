import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../../shared/widgets/custom_input_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _agreedToTerms = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onContinue() async {
    HapticService.mediumImpact();
    setState(() => _errorMessage = null);

    if (!_agreedToTerms) {
      HapticService.heavyImpact();
      setState(() => _errorMessage = 'Please accept the Terms of Service to continue.');
      return;
    }

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || !email.contains('@')) {
      HapticService.heavyImpact();
      setState(() => _errorMessage = 'Please enter a valid student email.');
      return;
    }
    if (password.isEmpty) {
      HapticService.heavyImpact();
      setState(() => _errorMessage = 'Please enter your password.');
      return;
    }

    setState(() => _isLoading = true);

    final res = await ApiClient.post(Endpoints.login, data: {
      'email': email,
      'password': password,
      'requiredRole': 'STUDENT',
    });

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res.success) {
      if (res.data is Map) {
        final data = res.data as Map;
        if (data.containsKey('token')) {
          await StorageService.setSessionToken(data['token'].toString());
        }
        if (data.containsKey('user') && data['user'] is Map) {
          await StorageService.setUserData(Map<String, dynamic>.from(data['user']));
        }
      }
      await HapticService.success();
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      HapticService.heavyImpact();
      setState(() => _errorMessage = res.error ?? 'Invalid email or password.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // Brand Logo Mark
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.3),
                    width: 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(13),
                  child: Image.asset(
                    'assets/images/logo.png',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Title Header
              Text(
                'Student Sign In',
                style: AppTypography.displayLarge.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Enter your student email and password to continue',
                style: AppTypography.bodyLarge.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 32),

              // Student Email Input
              CustomInputField(
                label: 'Student Email',
                hintText: 'student@techgration.live',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: const Icon(
                  Icons.alternate_email_rounded,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
              ),
              const SizedBox(height: 18),

              // Password Input
              CustomInputField(
                label: 'Password',
                hintText: '••••••••',
                controller: _passwordController,
                keyboardType: TextInputType.visiblePassword,
                isPassword: true,
                prefixIcon: const Icon(
                  Icons.lock_outline_rounded,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
              ),

              const SizedBox(height: 24),

              // Custom Terms Checkbox (Screenshot 1)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  BouncingButton(
                    scaleDown: 0.85,
                    onTap: () {
                      HapticService.selection();
                      setState(() => _agreedToTerms = !_agreedToTerms);
                    },
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: _agreedToTerms ? AppColors.accentOrange : Colors.transparent,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: _agreedToTerms ? AppColors.accentOrange : AppColors.borderLight,
                          width: 2,
                        ),
                      ),
                      child: _agreedToTerms
                          ? const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 16,
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontSize: 13,
                          height: 1.35,
                        ),
                        children: const [
                          TextSpan(text: "By checking this box, you agree to TechGration's "),
                          TextSpan(
                            text: 'Terms of Service',
                            style: TextStyle(
                              color: AppColors.accentBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          TextSpan(text: ' and '),
                          TextSpan(
                            text: 'Privacy Policy.',
                            style: TextStyle(
                              color: AppColors.accentBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppColors.error, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // Pitch Black Continue Button (Screenshot 1)
              BouncingButton(
                onTap: _onContinue,
                child: Container(
                  height: 56,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.primaryDark,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: AppColors.buttonShadow,
                  ),
                  child: Center(
                    child: _isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: Colors.white,
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Sign In',
                                style: AppTypography.buttonText,
                              ),
                              const SizedBox(width: 8),
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
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
