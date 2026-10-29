import 'package:flutter/material.dart';

class CourseImage extends StatelessWidget {
  final String? imageUrl;
  final String courseTitle;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  const CourseImage({
    super.key,
    required this.imageUrl,
    required this.courseTitle,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
  });

  String _resolveUrl(String raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    if (raw.startsWith('/')) {
      return 'https://campus.techgration.live$raw';
    }
    return raw;
  }

  String get _fallbackAsset {
    final lower = courseTitle.toLowerCase();
    if (lower.contains('iot') || lower.contains('robot')) {
      return 'assets/images/iot_robotics.png';
    }
    if (lower.contains('cyber') || lower.contains('security') || lower.contains('ethical hacking')) {
      return 'assets/images/cybersecurity_course.png';
    }
    if (lower.contains('app development') || lower.contains('mobile')) {
      return 'assets/images/mobile_course.png';
    }
    if (lower.contains('machine learning') && !lower.contains('deep learning')) {
      return 'assets/images/ml_course.jpg';
    }
    if (lower.contains('analytics')) {
      return 'assets/images/data_analytics.png';
    }
    return 'assets/images/ai_course.png';
  }

  @override
  Widget build(BuildContext context) {
    final rawUrl = imageUrl?.trim() ?? '';
    final resolved = rawUrl.isNotEmpty ? _resolveUrl(rawUrl) : null;

    Widget imageWidget;

    if (resolved != null && resolved.startsWith('http')) {
      imageWidget = Image.network(
        resolved,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return _buildShimmerPlaceholder();
        },
        errorBuilder: (context, error, stackTrace) {
          return _buildAssetFallback();
        },
      );
    } else {
      imageWidget = _buildAssetFallback();
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }

  Widget _buildAssetFallback() {
    return Image.asset(
      _fallbackAsset,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return _buildBrandedGradient();
      },
    );
  }

  Widget _buildShimmerPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF0F172A),
            const Color(0xFF1E293B),
            const Color(0xFF0F172A),
          ],
        ),
      ),
      child: const Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: Color(0xFF00D6D6),
          ),
        ),
      ),
    );
  }

  Widget _buildBrandedGradient() {
    return Container(
      width: width,
      height: height,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF042F2E), Color(0xFF0F172A)],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.school_rounded, color: Color(0xFF00D6D6), size: 28),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                courseTitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
