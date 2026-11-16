import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';

class StudentChatScreen extends StatefulWidget {
  final String? initialCourseId;
  final String? teacherName;

  const StudentChatScreen({
    super.key,
    this.initialCourseId,
    this.teacherName,
  });

  @override
  State<StudentChatScreen> createState() => _StudentChatScreenState();
}

class _StudentChatScreenState extends State<StudentChatScreen> {
  bool _isLoading = true;
  String? _conversationId;
  String _teacherDisplayName = 'Faculty Mentor';
  String _courseTitle = 'Course Support';

  List<Map<String, dynamic>> _messages = [];
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _pollingTimer;
  bool _isSending = false;

  String? _myUserId;

  @override
  void initState() {
    super.initState();
    final user = StorageService.getUserData();
    _myUserId = user?['id']?.toString();
    _initChat();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initChat() async {
    setState(() => _isLoading = true);

    try {
      // 1. Fetch conversations
      final res = await ApiClient.get(Endpoints.chatConversations);
      if (res.success && res.data is Map) {
        final convs = (res.data['conversations'] as List<dynamic>?) ?? [];
        if (convs.isNotEmpty) {
          final first = convs.first as Map<String, dynamic>;
          _conversationId = first['id']?.toString();
          _teacherDisplayName = (first['teacher']?['name'] as String?) ?? widget.teacherName ?? 'Faculty Mentor';
          _courseTitle = (first['course']?['title'] as String?) ?? 'TechGration Learning Track';
        } else {
          // Create conversation if none exists
          final createRes = await ApiClient.post(
            Endpoints.chatConversations,
            data: {
              if (widget.initialCourseId != null) 'courseId': widget.initialCourseId,
            },
          );
          if (createRes.success && createRes.data is Map && createRes.data['conversation'] != null) {
            final newConv = createRes.data['conversation'] as Map<String, dynamic>;
            _conversationId = newConv['id']?.toString();
            _teacherDisplayName = (newConv['teacher']?['name'] as String?) ?? widget.teacherName ?? 'Faculty Mentor';
            _courseTitle = (newConv['course']?['title'] as String?) ?? 'TechGration Learning Track';
          }
        }
      }
    } catch (_) {}

    if (_conversationId != null) {
      await _fetchMessages(initial: true);
      _startPolling();
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted && _conversationId != null) {
        _fetchMessages(initial: false);
      }
    });
  }

  Future<void> _fetchMessages({bool initial = false}) async {
    if (_conversationId == null) return;

    try {
      final res = await ApiClient.get(Endpoints.chatMessages(_conversationId!));
      if (res.success && res.data is Map && res.data['messages'] != null) {
        final raw = (res.data['messages'] as List<dynamic>?) ?? [];
        final parsed = raw.map((m) => Map<String, dynamic>.from(m as Map)).toList();

        if (mounted) {
          final shouldScroll = initial || parsed.length != _messages.length;
          setState(() {
            _messages = parsed;
          });
          if (shouldScroll) {
            _scrollToBottom();
          }
        }
      }
    } catch (_) {}
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _conversationId == null || _isSending) return;

    HapticService.lightTap();
    _textController.clear();
    setState(() => _isSending = true);

    // Optimistic UI append
    final tempMsg = {
      'id': 'temp_${DateTime.now().millisecondsSinceEpoch}',
      'senderId': _myUserId,
      'senderRole': 'STUDENT',
      'text': text,
      'createdAt': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(tempMsg);
    });
    _scrollToBottom();

    try {
      final res = await ApiClient.post(
        Endpoints.chatMessages(_conversationId!),
        data: {'text': text},
      );

      if (res.success) {
        _fetchMessages(initial: false);
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () {
            HapticService.lightTap();
            Navigator.pop(context);
          },
        ),
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                ),
              ),
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _teacherDisplayName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                  ),
                  Text(
                    _courseTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 10, color: Color(0xFF008A8A), fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              children: [
                CircleAvatar(radius: 3, backgroundColor: Color(0xFF10B981)),
                SizedBox(width: 5),
                Text(
                  'ONLINE',
                  style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w900, fontSize: 9),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Messages Scroll View
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: Color(0xFF00D6D6)),
                    )
                  : _messages.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.chat_bubble_outline_rounded,
                                      color: Color(0xFF008A8A), size: 30),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Ask Faculty Directly',
                                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Get personalized guidance, code architecture reviews, and homework mentoring from your assigned course faculty.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          itemCount: _messages.length,
                          itemBuilder: (context, index) {
                            final m = _messages[index];
                            final senderRole = (m['senderRole'] as String?)?.toUpperCase() ?? 'STUDENT';
                            final isMe = senderRole == 'STUDENT';
                            final text = (m['text'] as String?) ?? '';

                            return Align(
                              alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                constraints: BoxConstraints(
                                  maxWidth: MediaQuery.of(context).size.width * 0.78,
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  gradient: isMe
                                      ? const LinearGradient(
                                          colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                                        )
                                      : null,
                                  color: isMe ? null : Colors.white,
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(18),
                                    topRight: const Radius.circular(18),
                                    bottomLeft: Radius.circular(isMe ? 18 : 4),
                                    bottomRight: Radius.circular(isMe ? 4 : 18),
                                  ),
                                  border: isMe ? null : Border.all(color: AppColors.borderLight),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.03),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      text,
                                      style: TextStyle(
                                        color: isMe ? Colors.white : AppColors.textPrimary,
                                        fontSize: 14,
                                        height: 1.35,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isMe ? 'You' : _teacherDisplayName,
                                      style: TextStyle(
                                        color: isMe ? Colors.white.withValues(alpha: 0.7) : AppColors.textMuted,
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),

            // Chat Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: AppColors.borderLight)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _textController,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: const InputDecoration(
                          hintText: 'Ask faculty a question...',
                          hintStyle: TextStyle(fontSize: 13, color: AppColors.textMuted),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  BouncingButton(
                    scaleDown: 0.88,
                    onTap: _sendMessage,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [Color(0xFF00D6D6), Color(0xFF0284C7)],
                        ),
                      ),
                      child: const Center(
                        child: Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
