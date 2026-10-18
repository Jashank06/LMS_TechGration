import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:dio/dio.dart' as dio;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class ProfileSettingsScreen extends ConsumerStatefulWidget {
  const ProfileSettingsScreen({super.key});

  @override
  ConsumerState<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends ConsumerState<ProfileSettingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _headlineController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();

  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _isLoadingProfile = false;
  bool _isSavingProfile = false;
  bool _isSavingPassword = false;
  bool _isUploadingAvatar = false;
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _populateUserData();
    _loadProfileFromServer();
  }

  void _populateUserData([Map<String, dynamic>? data]) {
    final userData = data ?? StorageService.getUserData() ?? {};
    final profile = (userData['profile'] is Map) ? userData['profile'] as Map<String, dynamic> : null;

    if (userData['name'] != null && (userData['name'] as String).isNotEmpty) {
      _nameController.text = userData['name'] as String;
    }
    if (userData['email'] != null && (userData['email'] as String).isNotEmpty) {
      _emailController.text = userData['email'] as String;
    }
    final phone = profile?['phone'] ?? userData['phone'];
    if (phone != null) {
      _phoneController.text = phone.toString();
    }
    final headline = profile?['headline'] ?? userData['headline'];
    if (headline != null) {
      _headlineController.text = headline.toString();
    }
    final bio = profile?['bio'] ?? userData['bio'];
    if (bio != null) {
      _bioController.text = bio.toString();
    }
  }

  Future<void> _loadProfileFromServer() async {
    setState(() => _isLoadingProfile = true);
    final res = await ApiClient.get(Endpoints.profile);
    if (!mounted) return;
    setState(() => _isLoadingProfile = false);

    if (res.success && res.data is Map) {
      final data = res.data as Map<String, dynamic>;
      final user = data['user'] as Map<String, dynamic>?;
      if (user != null) {
        _populateUserData(user);
        await StorageService.setUserData(user);
        ref.read(studentDashboardProvider.notifier).loadDashboard();
      }
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _headlineController.dispose();
    _bioController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name')),
      );
      return;
    }

    setState(() => _isSavingProfile = true);
    HapticService.selection();

    final res = await ApiClient.post(
      Endpoints.profile,
      data: {
        'name': name,
        'phone': _phoneController.text.trim(),
        'headline': _headlineController.text.trim(),
        'bio': _bioController.text.trim(),
      },
    );

    setState(() => _isSavingProfile = false);

    if (res.success && res.data is Map) {
      final updatedUser = res.data['user'] as Map<String, dynamic>?;
      if (updatedUser != null) {
        _populateUserData(updatedUser);
        await StorageService.setUserData(updatedUser);
      }
      ref.read(studentDashboardProvider.notifier).loadDashboard();
      HapticService.success();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated and synced with Atlas! 🚀'),
          backgroundColor: Color(0xFF047857),
        ),
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res.error ?? 'Failed to update profile'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _changePassword() async {
    if (_currentPasswordController.text.isEmpty || _newPasswordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter current and new passwords')),
      );
      return;
    }

    if (_newPasswordController.text.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New password must be at least 8 characters long')),
      );
      return;
    }

    if (_newPasswordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }

    setState(() => _isSavingPassword = true);
    HapticService.selection();

    final res = await ApiClient.post(
      Endpoints.updatePassword,
      data: {
        'currentPassword': _currentPasswordController.text,
        'newPassword': _newPasswordController.text,
      },
    );

    setState(() => _isSavingPassword = false);

    if (res.success) {
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      HapticService.success();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password changed successfully! 🔐'),
          backgroundColor: Color(0xFF047857),
        ),
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res.error ?? 'Failed to change password'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _pickAndUploadAvatar(ImageSource source) async {
    Navigator.of(context, rootNavigator: true).pop();
    HapticService.selection();

    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      setState(() => _isUploadingAvatar = true);
      HapticService.mediumImpact();

      final rawBytes = await pickedFile.readAsBytes();
      Uint8List uploadBytes = rawBytes;
      String uploadFileName = 'avatar.png';

      // Downscale to 400x400 square avatar using dart:ui (guarantees ~50-150KB payload, avoiding Nginx 413 limits)
      try {
        final codec = await ui.instantiateImageCodec(
          rawBytes,
          targetWidth: 400,
          targetHeight: 400,
        );
        final frame = await codec.getNextFrame();
        final byteData = await frame.image.toByteData(format: ui.ImageByteFormat.png);
        if (byteData != null) {
          uploadBytes = byteData.buffer.asUint8List();
        }
      } catch (_) {
        // Fallback to rawBytes if codec fails
      }

      final formData = dio.FormData.fromMap({
        'file': dio.MultipartFile.fromBytes(
          uploadBytes,
          filename: uploadFileName,
        ),
      });

      final res = await ApiClient.post(Endpoints.avatar, data: formData);

      setState(() => _isUploadingAvatar = false);

      if (res.success && res.data is Map) {
        final data = res.data as Map;
        final avatarUrl = data['avatarUrl'] as String?;
        final updatedUser = data['user'] as Map<String, dynamic>?;

        if (updatedUser != null) {
          await StorageService.setUserData(updatedUser);
        } else if (avatarUrl != null) {
          final cached = StorageService.getUserData() ?? {};
          cached['avatarUrl'] = avatarUrl;
          if (cached['profile'] is Map) {
            cached['profile']['avatarUrl'] = avatarUrl;
          }
          await StorageService.setUserData(cached);
        }

        await ref.read(studentDashboardProvider.notifier).loadDashboard();
        HapticService.success();

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile photo updated successfully! ✨'),
            backgroundColor: Color(0xFF047857),
          ),
        );
      } else {
        HapticService.heavyImpact();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res.error ?? 'Failed to upload photo'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      setState(() => _isUploadingAvatar = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error selecting image: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _removeAvatar() async {
    Navigator.of(context, rootNavigator: true).pop();
    HapticService.selection();

    setState(() => _isUploadingAvatar = true);
    final res = await ApiClient.dio.delete(Endpoints.avatar);
    setState(() => _isUploadingAvatar = false);

    if (res.statusCode == 200) {
      final cached = StorageService.getUserData() ?? {};
      cached['avatarUrl'] = null;
      if (cached['profile'] is Map) {
        cached['profile']['avatarUrl'] = null;
      }
      await StorageService.setUserData(cached);
      await ref.read(studentDashboardProvider.notifier).loadDashboard();
      HapticService.success();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile photo removed'),
          backgroundColor: Color(0xFF047857),
        ),
      );
    }
  }

  void _showAvatarPickerSheet(String? currentAvatarUrl) {
    HapticService.lightTap();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Profile Photo',
                style: AppTypography.headlineLarge.copyWith(
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Upload a photo from your camera or files',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: Color(0xFF00D6D6), size: 22),
                ),
                title: const Text('Take Photo', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                subtitle: const Text('Use your device camera', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                onTap: () => _pickAndUploadAvatar(ImageSource.camera),
              ),
              const Divider(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: Color(0xFF0284C7), size: 22),
                ),
                title: const Text('Choose from Gallery / Files', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                subtitle: const Text('Select a JPG or PNG from storage', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                onTap: () => _pickAndUploadAvatar(ImageSource.gallery),
              ),
              if (currentAvatarUrl != null && currentAvatarUrl.isNotEmpty) ...[
                const Divider(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.delete_outline_rounded, color: Color(0xFFDC2626), size: 22),
                  ),
                  title: const Text('Remove Photo', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(0xFFDC2626))),
                  subtitle: const Text('Revert to initial avatar', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  onTap: _removeAvatar,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (name.isNotEmpty) {
      return name.substring(0, name.length >= 2 ? 2 : 1).toUpperCase();
    }
    return 'TG';
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(studentDashboardProvider);
    final user = dashboardState.user ?? StorageService.getUserData() ?? {};
    final studentName = user['name'] as String? ?? 'Student';
    final studentEmail = user['email'] as String? ?? 'student@techgration.live';
    final avatarUrl = (user['profile']?['avatarUrl'] ?? user['avatarUrl']) as String?;
    final initials = _getInitials(studentName);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Profile & Settings',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        centerTitle: false,
        bottom: _isLoadingProfile
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(
                  minHeight: 2,
                  color: Color(0xFF00D6D6),
                  backgroundColor: Colors.transparent,
                ),
              )
            : null,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          physics: const BouncingScrollPhysics(),
          children: [
            // Student Identity Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => _showAvatarPickerSheet(avatarUrl),
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          width: 68,
                          height: 68,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFF00D6D6).withValues(alpha: 0.35),
                              width: 2,
                            ),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                            ),
                          ),
                          child: ClipOval(
                            child: _isUploadingAvatar
                                ? const Center(
                                    child: SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.4,
                                        color: Colors.white,
                                      ),
                                    ),
                                  )
                                : (avatarUrl != null && avatarUrl.isNotEmpty)
                                    ? Image.network(
                                        avatarUrl,
                                        width: 68,
                                        height: 68,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Center(
                                          child: Text(
                                            initials,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w900,
                                              fontSize: 22,
                                            ),
                                          ),
                                        ),
                                      )
                                    : Center(
                                        child: Text(
                                          initials,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w900,
                                            fontSize: 22,
                                          ),
                                        ),
                                      ),
                          ),
                        ),
                        // Online green indicator dot
                        Positioned(
                          top: 1,
                          right: 1,
                          child: Container(
                            width: 14,
                            height: 14,
                            decoration: BoxDecoration(
                              color: const Color(0xFF22C55E),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                        // Camera Edit Badge
                        Positioned(
                          bottom: -2,
                          right: -2,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00D6D6),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.2),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.camera_alt_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          studentName,
                          style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w900, fontSize: 18),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          studentEmail,
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'STUDENT PORTAL • ACTIVE',
                            style: TextStyle(color: Color(0xFF008A8A), fontWeight: FontWeight.w800, fontSize: 9),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tabs Header
            Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                tabs: const [
                  Tab(text: 'General Profile'),
                  Tab(text: 'Security & Auth'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Tab Content
            SizedBox(
              height: 560,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildProfileTab(),
                  _buildSecurityTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadOnlyEmailField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Email Address', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified_rounded, size: 12, color: Color(0xFF10B981)),
                  SizedBox(width: 4),
                  Text('Verified Primary', style: TextStyle(color: Color(0xFF047857), fontSize: 10, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _emailController,
          enabled: false,
          decoration: InputDecoration(
            hintText: 'student@techgration.live',
            prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF008A8A), size: 19),
            filled: true,
            fillColor: const Color(0xFFF1F5F9),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
            disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
          ),
          style: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildProfileTab() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
        _buildInputField(label: 'Full Legal Name', controller: _nameController, hint: 'e.g. Gayatri Mohanty', icon: Icons.person_outline_rounded),
        const SizedBox(height: 14),
        _buildReadOnlyEmailField(),
        const SizedBox(height: 14),
        _buildInputField(label: 'Phone Number', controller: _phoneController, hint: 'e.g. +91 9876543210', icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
        const SizedBox(height: 14),
        _buildInputField(label: 'Professional Headline', controller: _headlineController, hint: 'e.g. AI & FullStack Architect', icon: Icons.work_outline_rounded),
        const SizedBox(height: 14),
        _buildInputField(label: 'Bio & Engineering Goals', controller: _bioController, hint: 'Tell mentors about your background...', icon: Icons.description_outlined, maxLines: 3),
        const SizedBox(height: 22),
        BouncingButton(
          scaleDown: 0.96,
          onTap: () {
            if (!_isSavingProfile) _saveProfile();
          },
          child: Container(
            width: double.infinity,
            height: 50,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: _isSavingProfile
                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                : const Text('Save Profile Changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityTab() {
    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
        _buildPasswordField(label: 'Current Password', controller: _currentPasswordController, obscure: _obscureCurrent, onToggle: () => setState(() => _obscureCurrent = !_obscureCurrent)),
        const SizedBox(height: 14),
        _buildPasswordField(label: 'New Password', controller: _newPasswordController, obscure: _obscureNew, onToggle: () => setState(() => _obscureNew = !_obscureNew)),
        const SizedBox(height: 14),
        _buildPasswordField(label: 'Confirm New Password', controller: _confirmPasswordController, obscure: _obscureConfirm, onToggle: () => setState(() => _obscureConfirm = !_obscureConfirm)),
        const SizedBox(height: 22),
        BouncingButton(
          scaleDown: 0.96,
          onTap: () {
            if (!_isSavingPassword) _changePassword();
          },
          child: Container(
            width: double.infinity,
            height: 50,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: _isSavingPassword
                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                : const Text('Update Password', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
          ),
        ),
      ],
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: const Color(0xFF008A8A), size: 19),
            filled: true,
            fillColor: AppColors.surfaceLight,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF008A8A), width: 1.5)),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordField({
    required String label,
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback onToggle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          decoration: InputDecoration(
            hintText: '••••••••',
            prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF008A8A), size: 19),
            suffixIcon: IconButton(
              icon: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 19, color: AppColors.textSecondary),
              onPressed: onToggle,
            ),
            filled: true,
            fillColor: AppColors.surfaceLight,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.borderLight)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF008A8A), width: 1.5)),
          ),
        ),
      ],
    );
  }
}
