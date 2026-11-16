import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';

class CommunityFeedScreen extends StatefulWidget {
  const CommunityFeedScreen({super.key});

  @override
  State<CommunityFeedScreen> createState() => _CommunityFeedScreenState();
}

class _CommunityFeedScreenState extends State<CommunityFeedScreen> {
  bool _isLoading = true;
  String _selectedCategory = 'ALL';
  List<Map<String, dynamic>> _posts = [];
  String? _myUserId;

  final List<Map<String, String>> _categories = [
    {'key': 'ALL', 'label': 'All Updates'},
    {'key': 'ANNOUNCEMENT', 'label': 'Announcements'},
    {'key': 'SCHEDULE', 'label': 'Schedule'},
    {'key': 'EVENT', 'label': 'Events'},
    {'key': 'RESOURCE', 'label': 'Resources'},
  ];

  @override
  void initState() {
    super.initState();
    final user = StorageService.getUserData();
    _myUserId = user?['id']?.toString();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    setState(() => _isLoading = true);

    try {
      final query = _selectedCategory != 'ALL' ? '?category=$_selectedCategory' : '';
      final res = await ApiClient.get('${Endpoints.communityPosts}$query');

      if (res.success && res.data is Map && res.data['posts'] != null) {
        final raw = (res.data['posts'] as List<dynamic>?) ?? [];
        if (mounted) {
          setState(() {
            _posts = raw.map((p) => Map<String, dynamic>.from(p as Map)).toList();
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _onCategorySelected(String key) {
    if (_selectedCategory == key) return;
    HapticService.selection();
    setState(() => _selectedCategory = key);
    _fetchPosts();
  }

  Future<void> _toggleReaction(String postId, String emoji) async {
    HapticService.lightTap();

    // Optimistically toggle reaction locally
    setState(() {
      final index = _posts.indexWhere((p) => p['id'] == postId);
      if (index != -1 && _myUserId != null) {
        final p = Map<String, dynamic>.from(_posts[index]);
        final reactions = Map<String, dynamic>.from(p['reactions'] as Map? ?? {});
        final userList = List<String>.from((reactions[emoji] as List<dynamic>?) ?? []);

        if (userList.contains(_myUserId)) {
          userList.remove(_myUserId);
        } else {
          userList.add(_myUserId!);
        }
        reactions[emoji] = userList;
        p['reactions'] = reactions;
        _posts[index] = p;
      }
    });

    try {
      await ApiClient.post(
        Endpoints.communityReaction(postId),
        data: {'emoji': emoji},
      );
    } catch (_) {}
  }

  void _openActionUrl(String? url) async {
    if (url == null || url.isEmpty) return;
    HapticService.mediumImpact();
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Community & Notice Board',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () {
            HapticService.lightTap();
            Navigator.pop(context);
          },
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF00D6D6),
          onRefresh: _fetchPosts,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            children: [
              // Hero Banner Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.35)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00D6D6).withValues(alpha: 0.1),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00D6D6).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.campaign_rounded, color: Color(0xFF2DD4BF), size: 14),
                          SizedBox(width: 6),
                          Text(
                            'OFFICIAL COHORT DISPATCH',
                            style: TextStyle(
                              color: Color(0xFF2DD4BF),
                              fontWeight: FontWeight.w900,
                              fontSize: 10,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Community Announcements',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Live cohort updates, masterclass notifications, project hackathon briefs, and important admissions notices.',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.75),
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Horizontal Category Filter Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: _categories.map((cat) {
                    final isSel = _selectedCategory == cat['key'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: BouncingButton(
                        scaleDown: 0.94,
                        onTap: () => _onCategorySelected(cat['key']!),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFF00D6D6) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel ? const Color(0xFF00D6D6) : AppColors.borderLight,
                            ),
                          ),
                          child: Text(
                            cat['label']!,
                            style: TextStyle(
                              color: isSel ? Colors.white : AppColors.textPrimary,
                              fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 18),

              if (_isLoading) ...[
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 60),
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFF00D6D6)),
                  ),
                ),
              ] else if (_posts.isEmpty) ...[
                // Authentic Empty State
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D6D6).withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.mark_chat_read_outlined, color: Color(0xFF008A8A), size: 28),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'No Notices in this Category',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'There are currently no active announcements matching this filter. Switch categories or check back later.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // Render List of Posts
                for (final post in _posts) ...[
                  _buildPostCard(post),
                  const SizedBox(height: 14),
                ],
              ],

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPostCard(Map<String, dynamic> post) {
    final postId = (post['id'] ?? '').toString();
    final title = (post['title'] as String?) ?? 'Notice';
    final content = (post['content'] as String?) ?? '';
    final category = (post['category'] as String?) ?? 'GENERAL';
    final isPinned = post['isPinned'] == true;
    final authorName = (post['authorName'] as String?) ?? (post['author']?['name'] as String?) ?? 'Faculty Desk';
    final authorRole = (post['authorRole'] as String?) ?? (post['author']?['role'] as String?) ?? 'ADMIN';
    final bannerUrl = post['bannerUrl'] as String?;
    final actionUrl = post['actionUrl'] as String?;
    final actionLabel = (post['actionLabel'] as String?) ?? 'Learn More';
    final reactions = Map<String, dynamic>.from(post['reactions'] as Map? ?? {});

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isPinned ? const Color(0xFF00D6D6).withValues(alpha: 0.6) : AppColors.borderLight,
          width: isPinned ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Pinned Bar
          if (isPinned)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: const BoxDecoration(
                color: Color(0xFFE6FFFA),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.push_pin_rounded, size: 14, color: Color(0xFF008A8A)),
                  SizedBox(width: 6),
                  Text(
                    'PINNED ANNOUNCEMENT',
                    style: TextStyle(
                      color: Color(0xFF008A8A),
                      fontWeight: FontWeight.w900,
                      fontSize: 10,
                      letterSpacing: 0.6,
                    ),
                  ),
                ],
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Author & Category Row
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                        ),
                      ),
                      child: const Icon(Icons.school_rounded, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            authorName,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                          Text(
                            authorRole.toUpperCase(),
                            style: const TextStyle(fontSize: 9.5, color: Color(0xFF008A8A), fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        category,
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Post Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),

                // Post Content
                Text(
                  content,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.45,
                  ),
                ),

                // Optional Banner
                if (bannerUrl != null && bannerUrl.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(
                      bannerUrl,
                      width: double.infinity,
                      height: 180,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                    ),
                  ),
                ],

                // Optional Action Button
                if (actionUrl != null && actionUrl.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  BouncingButton(
                    scaleDown: 0.97,
                    onTap: () => _openActionUrl(actionUrl),
                    child: Container(
                      height: 40,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            actionLabel,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 14),
                        ],
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 14),
                const Divider(color: AppColors.divider, height: 1),
                const SizedBox(height: 10),

                // Reaction Counters Row
                Row(
                  children: [
                    _buildEmojiButton(postId, '👍', reactions['👍']),
                    const SizedBox(width: 8),
                    _buildEmojiButton(postId, '❤️', reactions['❤️']),
                    const SizedBox(width: 8),
                    _buildEmojiButton(postId, '🚀', reactions['🚀']),
                    const SizedBox(width: 8),
                    _buildEmojiButton(postId, '🔥', reactions['🔥']),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmojiButton(String postId, String emoji, dynamic users) {
    final userList = List<String>.from((users as List<dynamic>?) ?? []);
    final count = userList.length;
    final hasReacted = _myUserId != null && userList.contains(_myUserId);

    return BouncingButton(
      scaleDown: 0.9,
      onTap: () => _toggleReaction(postId, emoji),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: hasReacted ? const Color(0xFFE6FFFA) : AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: hasReacted ? const Color(0xFF00D6D6) : AppColors.borderLight,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 14)),
            if (count > 0) ...[
              const SizedBox(width: 4),
              Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: hasReacted ? const Color(0xFF008A8A) : AppColors.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
