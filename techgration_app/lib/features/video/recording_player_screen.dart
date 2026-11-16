import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../core/services/storage_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import '../dashboard/student_dashboard_controller.dart';

class ClassMilestone {
  final int timeSeconds;
  final String label;

  const ClassMilestone({required this.timeSeconds, required this.label});
}

class RecordingPlayerScreen extends ConsumerStatefulWidget {
  final String classId;
  final String title;
  final String videoUrl;
  final String? courseTitle;
  final String? instructorName;
  final int? durationMinutes;
  final String? conductedDate;
  final String? description;

  const RecordingPlayerScreen({
    super.key,
    required this.classId,
    required this.title,
    required this.videoUrl,
    this.courseTitle,
    this.instructorName,
    this.durationMinutes,
    this.conductedDate,
    this.description,
  });

  @override
  ConsumerState<RecordingPlayerScreen> createState() => _RecordingPlayerScreenState();
}

class _RecordingPlayerScreenState extends ConsumerState<RecordingPlayerScreen> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  String _errorMessage = '';

  // Controls visibility & auto-hide
  bool _controlsVisible = true;
  Timer? _hideControlsTimer;
  bool _isFullscreen = false;

  // Playback settings
  double _playbackSpeed = 1.0;
  final List<double> _speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  // Scrubbing state
  bool _isScrubbing = false;
  double _scrubPositionSec = 0.0;

  // LMS progress tracking
  bool _hasCompletedBeaconSent = false;
  int _lastBeaconTimeSec = 0;

  // Selected tab below video (0: Chapters, 1: Overview)
  int _activeInfoTab = 0;

  List<ClassMilestone> _milestones = [];

  @override
  void initState() {
    super.initState();
    _initMilestones();
    _initPlayer();
  }

  void _initMilestones() {
    final title = widget.title.toLowerCase();
    if (title.contains('class 6')) {
      _milestones = const [
        ClassMilestone(timeSeconds: 30, label: 'Welcome & Class 5 Recap'),
        ClassMilestone(timeSeconds: 300, label: 'Transformers, Self-Attention & Encoder-Decoder'),
        ClassMilestone(timeSeconds: 1140, label: 'Production AI Pipelines & PyTorch Deployment'),
        ClassMilestone(timeSeconds: 2280, label: 'Live Code Implementation & Loss Optimization'),
        ClassMilestone(timeSeconds: 3120, label: 'Q&A, Doubt Session & Wrap-up'),
      ];
    } else if (title.contains('class 5')) {
      _milestones = const [
        ClassMilestone(timeSeconds: 30, label: 'Welcome & Class 4 Recap'),
        ClassMilestone(timeSeconds: 300, label: 'Advanced Deep Learning Architectures & CNNs'),
        ClassMilestone(timeSeconds: 1080, label: 'Model Fine-Tuning & Hyperparameter Strategies'),
        ClassMilestone(timeSeconds: 2100, label: 'Hands-on Implementation in PyTorch'),
        ClassMilestone(timeSeconds: 2880, label: 'Q&A, Debugging & Doubt Clearing'),
      ];
    } else if (title.contains('class 4')) {
      _milestones = const [
        ClassMilestone(timeSeconds: 30, label: 'Welcome & Class 3 Recap'),
        ClassMilestone(timeSeconds: 300, label: 'Sequence Models & Attention'),
        ClassMilestone(timeSeconds: 1080, label: 'Transformer Mathematics (Q, K, V)'),
        ClassMilestone(timeSeconds: 2280, label: 'Hands-on Code Walkthrough'),
        ClassMilestone(timeSeconds: 3240, label: 'Q&A, Doubt Clearing & Next Steps'),
      ];
    } else if (title.contains('class 3')) {
      _milestones = const [
        ClassMilestone(timeSeconds: 30, label: 'Welcome & Architecture Review'),
        ClassMilestone(timeSeconds: 300, label: 'Multi-Head Attention & Math'),
        ClassMilestone(timeSeconds: 900, label: 'Transformer Coding & PyTorch Setup'),
        ClassMilestone(timeSeconds: 2100, label: 'Live Doubt Clearing & Project Guidance'),
      ];
    } else {
      _milestones = const [
        ClassMilestone(timeSeconds: 30, label: 'Welcome & Cohort Kickoff'),
        ClassMilestone(timeSeconds: 300, label: 'Foundations & Architectural Landscape'),
        ClassMilestone(timeSeconds: 900, label: 'Core Technical Concepts Walkthrough'),
        ClassMilestone(timeSeconds: 2100, label: 'Q&A & Student Mentorship'),
      ];
    }
  }

  Future<void> _initPlayer() async {
    final rawUrl = widget.videoUrl;
    if (rawUrl.isEmpty) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Video URL is not available for this session.';
      });
      return;
    }

    final resolvedUrl = Endpoints.resolveMediaUrl(rawUrl);
    final uri = Uri.parse(resolvedUrl);

    try {
      final controller = VideoPlayerController.networkUrl(uri);

      _controller = controller;
      await controller.initialize();

      if (!mounted) {
        controller.dispose();
        return;
      }

      controller.addListener(_videoListener);

      // Check saved resume position
      final savedPos = StorageService.getSessionToken();
      if (savedPos != null) {
        // Can check saved position from preferences
      }

      setState(() {
        _isInitialized = true;
        _hasError = false;
      });

      // Auto start playback smoothly
      await controller.play();
      _startHideControlsTimer();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _hasError = true;
        _errorMessage = 'Unable to stream recording: $e';
      });
    }
  }

  void _videoListener() {
    if (!mounted || _controller == null) return;

    final val = _controller!.value;
    if (val.hasError) {
      setState(() {
        _hasError = true;
        _errorMessage = val.errorDescription ?? 'Video playback error.';
      });
      return;
    }

    // Check LMS progress tracking (every 20s or on completion)
    final posSec = val.position.inSeconds;
    final durSec = val.duration.inSeconds;

    if (durSec > 0) {
      final isCompleted = (posSec / durSec) >= 0.8;
      if (isCompleted && !_hasCompletedBeaconSent) {
        _sendProgressBeacon(posSec, durSec, completed: true);
      } else if ((posSec - _lastBeaconTimeSec).abs() >= 25) {
        _sendProgressBeacon(posSec, durSec, completed: false);
      }
    }

    setState(() {});
  }

  Future<void> _sendProgressBeacon(int positionSec, int durationSec, {required bool completed}) async {
    _lastBeaconTimeSec = positionSec;
    if (completed) {
      _hasCompletedBeaconSent = true;
    }

    try {
      final res = await ApiClient.post(
        Endpoints.recordingProgress(widget.classId),
        data: {
          'positionSec': positionSec,
          'durationSec': durationSec,
          'completed': completed,
        },
      );

      if (completed && res.success && mounted) {
        HapticService.success();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF0F172A),
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Class session completed! Course progress updated in LMS.',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
              ],
            ),
            duration: Duration(seconds: 4),
          ),
        );
        // Refresh dashboard metrics in background
        ref.read(studentDashboardProvider.notifier).loadDashboard();
      }
    } catch (_) {}
  }

  void _startHideControlsTimer() {
    _hideControlsTimer?.cancel();
    if (_controller != null && _controller!.value.isPlaying && !_isScrubbing) {
      _hideControlsTimer = Timer(const Duration(milliseconds: 3200), () {
        if (mounted && _controller != null && _controller!.value.isPlaying) {
          setState(() => _controlsVisible = false);
        }
      });
    }
  }

  void _toggleControls() {
    setState(() {
      _controlsVisible = !_controlsVisible;
    });
    if (_controlsVisible) {
      _startHideControlsTimer();
    }
  }

  void _togglePlayPause() {
    HapticService.selection();
    if (_controller == null) return;

    if (_controller!.value.isPlaying) {
      _controller!.pause();
      setState(() => _controlsVisible = true);
      _hideControlsTimer?.cancel();
    } else {
      _controller!.play();
      _startHideControlsTimer();
    }
  }

  void _skipSeconds(int seconds) {
    HapticService.lightTap();
    if (_controller == null) return;
    final cur = _controller!.value.position;
    final dur = _controller!.value.duration;
    final target = cur + Duration(seconds: seconds);
    final clamped = target < Duration.zero ? Duration.zero : (target > dur ? dur : target);
    _controller!.seekTo(clamped);
    _startHideControlsTimer();
  }

  void _seekTo(Duration position) {
    if (_controller == null) return;
    _controller!.seekTo(position);
  }

  void _cycleSpeed() {
    HapticService.selection();
    final curIdx = _speeds.indexOf(_playbackSpeed);
    final nextIdx = (curIdx + 1) % _speeds.length;
    final newSpeed = _speeds[nextIdx];

    setState(() {
      _playbackSpeed = newSpeed;
    });

    _controller?.setPlaybackSpeed(newSpeed);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Playback Speed: ${newSpeed}x'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    final s = d.inSeconds.remainder(60);
    String pad(int n) => n.toString().padLeft(2, '0');
    if (h > 0) {
      return '$h:${pad(m)}:${pad(s)}';
    }
    return '${pad(m)}:${pad(s)}';
  }

  void _toggleFullscreen() {
    HapticService.selection();
    setState(() {
      _isFullscreen = !_isFullscreen;
    });

    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
      ]);
      SystemChrome.setEnabledSystemUIMode(
        SystemUiMode.manual,
        overlays: SystemUiOverlay.values,
      );
    }
    _startHideControlsTimer();
  }

  void _openOfflineMp4() async {
    HapticService.mediumImpact();
    final url = Endpoints.resolveMediaUrl(widget.videoUrl);
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  void dispose() {
    _hideControlsTimer?.cancel();
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
      ]);
      SystemChrome.setEnabledSystemUIMode(
        SystemUiMode.manual,
        overlays: SystemUiOverlay.values,
      );
    }
    _controller?.removeListener(_videoListener);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final duration = _controller?.value.duration ?? Duration.zero;
    final position = _controller?.value.position ?? Duration.zero;
    final isPlaying = _controller?.value.isPlaying ?? false;
    final isBuffering = _controller?.value.isBuffering ?? false;

    final videoCanvas = GestureDetector(
      onTap: _toggleControls,
      onDoubleTap: _toggleFullscreen,
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.black,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Native Video Surface
            if (_isInitialized && _controller != null)
              Center(
                child: AspectRatio(
                  aspectRatio: _controller!.value.aspectRatio,
                  child: VideoPlayer(_controller!),
                ),
              )
            else if (_hasError)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Color(0xFFEF4444), size: 40),
                      const SizedBox(height: 10),
                      Text(
                        _errorMessage,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton.icon(
                        onPressed: () {
                          setState(() {
                            _hasError = false;
                            _isInitialized = false;
                          });
                          _initPlayer();
                        },
                        icon: const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Retry'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00D6D6),
                          foregroundColor: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF00D6D6),
                  strokeWidth: 2.8,
                ),
              ),

            // Buffering indicator
            if (isBuffering && !_hasError)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF00D6D6),
                  strokeWidth: 2.5,
                ),
              ),

            // Interactive Player HUD Controls (Fades in/out on tap)
            Positioned.fill(
              child: AnimatedOpacity(
                opacity: _controlsVisible ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 240),
                child: IgnorePointer(
                  ignoring: !_controlsVisible,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.black.withValues(alpha: 0.75),
                          Colors.transparent,
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.85),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        stops: const [0.0, 0.25, 0.7, 1.0],
                      ),
                    ),
                    child: Stack(
                      children: [
                        // Fullscreen Floating Top Bar with Exit Button & Title
                        if (_isFullscreen)
                          Positioned(
                            top: 14,
                            left: 16,
                            right: 16,
                            child: Row(
                              children: [
                                BouncingButton(
                                  key: const Key('exit_fullscreen_button'),
                                  scaleDown: 0.9,
                                  onTap: _toggleFullscreen,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.7),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.fullscreen_exit_rounded, color: Color(0xFF00D6D6), size: 18),
                                        SizedBox(width: 5),
                                        Text(
                                          'Exit Fullscreen',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    widget.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                      shadows: [Shadow(color: Colors.black, blurRadius: 4)],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                      // Center Controls: Skip -10s, Play/Pause, Skip +10s
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Skip -10s
                            IconButton(
                              iconSize: 34,
                              icon: const Icon(Icons.replay_10_rounded, color: Colors.white),
                              onPressed: () => _skipSeconds(-10),
                            ),
                            const SizedBox(width: 24),

                            // Big Play/Pause Action
                            BouncingButton(
                              scaleDown: 0.88,
                              onTap: _togglePlayPause,
                              child: Container(
                                width: 58,
                                height: 58,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF00D6D6),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF00D6D6).withValues(alpha: 0.45),
                                      blurRadius: 18,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                                  color: const Color(0xFF090A0F),
                                  size: 34,
                                ),
                              ),
                            ),
                            const SizedBox(width: 24),

                            // Skip +10s
                            IconButton(
                              iconSize: 34,
                              icon: const Icon(Icons.forward_10_rounded, color: Colors.white),
                              onPressed: () => _skipSeconds(10),
                            ),
                          ],
                        ),
                      ),

                      // Bottom Scrubber Bar & Indicators
                      Positioned(
                        left: 12,
                        right: 12,
                        bottom: 6,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Slider Scrubber
                            SliderTheme(
                              data: SliderTheme.of(context).copyWith(
                                trackHeight: 3.5,
                                activeTrackColor: const Color(0xFF00D6D6),
                                inactiveTrackColor: Colors.white.withValues(alpha: 0.2),
                                thumbColor: Colors.white,
                                thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6.5),
                                overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                                overlayColor: const Color(0xFF00D6D6).withValues(alpha: 0.2),
                              ),
                              child: Slider(
                                min: 0.0,
                                max: duration.inSeconds > 0 ? duration.inSeconds.toDouble() : 1.0,
                                value: _isScrubbing
                                    ? _scrubPositionSec
                                    : position.inSeconds
                                        .toDouble()
                                        .clamp(0.0, duration.inSeconds > 0 ? duration.inSeconds.toDouble() : 1.0),
                                onChangeStart: (val) {
                                  setState(() {
                                    _isScrubbing = true;
                                    _scrubPositionSec = val;
                                  });
                                  _hideControlsTimer?.cancel();
                                },
                                onChanged: (val) {
                                  setState(() {
                                    _scrubPositionSec = val;
                                  });
                                },
                                onChangeEnd: (val) {
                                  setState(() {
                                    _isScrubbing = false;
                                  });
                                  _seekTo(Duration(seconds: val.toInt()));
                                  _startHideControlsTimer();
                                },
                              ),
                            ),

                            // Time Indicators & Speed / Fullscreen Selector Row
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Row(
                                children: [
                                  Text(
                                    '${_formatDuration(position)} / ${_formatDuration(duration)}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const Spacer(),

                                  // Speed Pill
                                  GestureDetector(
                                    onTap: _cycleSpeed,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                                      ),
                                      child: Text(
                                        '${_playbackSpeed}x',
                                        style: const TextStyle(
                                          color: Color(0xFF00D6D6),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Fullscreen Toggle Button
                                  GestureDetector(
                                    key: const Key('fullscreen_toggle_button'),
                                    onTap: _toggleFullscreen,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                                      ),
                                      child: Icon(
                                        _isFullscreen ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded,
                                        color: const Color(0xFF00D6D6),
                                        size: 16,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
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
    );

    return PopScope(
      canPop: !_isFullscreen,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _isFullscreen) {
          _toggleFullscreen();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF090A0F),
        body: SafeArea(
          top: !_isFullscreen,
          bottom: !_isFullscreen,
          left: !_isFullscreen,
          right: !_isFullscreen,
          child: Column(
            children: [
              // 1. Cinema Top Header Bar (1:1 with Web LMS RecordingPlayerModal)
              if (!_isFullscreen) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                    border: Border(
                      bottom: BorderSide(
                        color: Colors.white.withValues(alpha: 0.08),
                        width: 1,
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Close Button
                      BouncingButton(
                        scaleDown: 0.9,
                        onTap: () {
                          HapticService.lightTap();
                          Navigator.pop(context);
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                          ),
                          child: const Icon(
                            Icons.close_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Session Badge & Title Header
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF00D6D6).withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: const Color(0xFF00D6D6).withValues(alpha: 0.4),
                                    ),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.circle, color: Color(0xFF00D6D6), size: 6),
                                      SizedBox(width: 5),
                                      Text(
                                        'TECHGRATION PLAYER',
                                        style: TextStyle(
                                          color: Color(0xFF00D6D6),
                                          fontWeight: FontWeight.w900,
                                          fontSize: 9,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: const Color(0xFF10B981).withValues(alpha: 0.4),
                                    ),
                                  ),
                                  child: const Text(
                                    '1080p Full HD',
                                    style: TextStyle(
                                      color: Color(0xFF34D399),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              widget.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Offline MP4 Button
                      BouncingButton(
                        scaleDown: 0.92,
                        onTap: _openOfflineMp4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.download_rounded, color: Color(0xFF00D6D6), size: 15),
                              SizedBox(width: 4),
                              Text(
                                'MP4',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Fullscreen Button in Header
                      BouncingButton(
                        key: const Key('header_fullscreen_button'),
                        scaleDown: 0.92,
                        onTap: _toggleFullscreen,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00D6D6).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF00D6D6).withValues(alpha: 0.4)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.fullscreen_rounded, color: Color(0xFF00D6D6), size: 16),
                              SizedBox(width: 4),
                              Text(
                                'Fullscreen',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // 2. Video View Canvas
              if (_isFullscreen)
                Expanded(child: videoCanvas)
              else
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: videoCanvas,
                ),

              // 3. Tab Switcher (Chapters vs Overview)
              if (!_isFullscreen) ...[
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B).withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            HapticService.selection();
                            setState(() => _activeInfoTab = 0);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _activeInfoTab == 0 ? const Color(0xFF00D6D6) : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.auto_awesome_rounded,
                                  size: 14,
                                  color: _activeInfoTab == 0 ? Colors.black : Colors.white70,
                                ),
                                SizedBox(width: 6),
                                Text(
                                  'Chapters & Milestones',
                                  style: TextStyle(
                                    color: _activeInfoTab == 0 ? Colors.black : Colors.white70,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            HapticService.selection();
                            setState(() => _activeInfoTab = 1);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _activeInfoTab == 1 ? const Color(0xFF00D6D6) : Colors.transparent,
                              borderRadius: BorderRadius.circular(9),
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.info_outline_rounded,
                                  size: 14,
                                  color: _activeInfoTab == 1 ? Colors.black : Colors.white70,
                                ),
                                SizedBox(width: 6),
                                Text(
                                  'Session Details',
                                  style: TextStyle(
                                    color: _activeInfoTab == 1 ? Colors.black : Colors.white70,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // 4. Tab Content Area
                Expanded(
                  child: _activeInfoTab == 0 ? _buildMilestonesList(position) : _buildSessionDetails(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMilestonesList(Duration currentPosition) {
    final curSec = currentPosition.inSeconds;

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      physics: const BouncingScrollPhysics(),
      itemCount: _milestones.length,
      itemBuilder: (context, index) {
        final m = _milestones[index];
        final isPassed = curSec >= m.timeSeconds;
        final isCurrent = index < _milestones.length - 1
            ? (curSec >= m.timeSeconds && curSec < _milestones[index + 1].timeSeconds)
            : curSec >= m.timeSeconds;

        final timeStr = _formatDuration(Duration(seconds: m.timeSeconds));

        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: isCurrent
                ? const Color(0xFF00D6D6).withValues(alpha: 0.12)
                : const Color(0xFF1E293B).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isCurrent
                  ? const Color(0xFF00D6D6).withValues(alpha: 0.5)
                  : Colors.white.withValues(alpha: 0.06),
            ),
          ),
          child: ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
            leading: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isCurrent
                    ? const Color(0xFF00D6D6)
                    : (isPassed ? const Color(0xFF10B981).withValues(alpha: 0.2) : Colors.white.withValues(alpha: 0.08)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                timeStr,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: isCurrent
                      ? Colors.black
                      : (isPassed ? const Color(0xFF34D399) : Colors.white70),
                ),
              ),
            ),
            title: Text(
              m.label,
              style: TextStyle(
                color: isCurrent ? const Color(0xFF00D6D6) : Colors.white,
                fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
                fontSize: 12.5,
              ),
            ),
            trailing: isCurrent
                ? const Icon(Icons.volume_up_rounded, color: Color(0xFF00D6D6), size: 18)
                : const Icon(Icons.play_arrow_rounded, color: Colors.white38, size: 18),
            onTap: () {
              HapticService.selection();
              _seekTo(Duration(seconds: m.timeSeconds));
              _controller?.play();
            },
          ),
        );
      },
    );
  }

  Widget _buildSessionDetails() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      physics: const BouncingScrollPhysics(),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.45),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.courseTitle ?? 'Artificial Intelligence & Modern Deep Learning Systems',
                style: const TextStyle(
                  color: Color(0xFF00D6D6),
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                widget.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.person_outline_rounded, color: Colors.white60, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    'Instructor: ${widget.instructorName ?? "Vineet Sir"}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              if (widget.conductedDate != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded, color: Colors.white60, size: 14),
                    const SizedBox(width: 6),
                    Text(
                      widget.conductedDate!,
                      style: const TextStyle(color: Colors.white60, fontSize: 11),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B).withValues(alpha: 0.45),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Class Description & Study Notes',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
              ),
              const SizedBox(height: 8),
              Text(
                widget.description ??
                    'Live lecture session covering practical architectures, implementation pipelines, mathematical formulations, and interactive Q&A. Watch at least 80% of the session to automatically mark attendance and advance your curriculum completion rate.',
                style: const TextStyle(color: Colors.white70, height: 1.45, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
