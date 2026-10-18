import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/network/api_client.dart';
import '../../core/network/endpoints.dart';
import '../../core/services/haptic_service.dart';
import '../../shared/widgets/bouncing_button.dart';
import 'academics_controller.dart';

class ChampionSwagScreen extends ConsumerStatefulWidget {
  const ChampionSwagScreen({super.key});

  @override
  ConsumerState<ChampionSwagScreen> createState() => _ChampionSwagScreenState();
}

class _ChampionSwagScreenState extends ConsumerState<ChampionSwagScreen> {
  String _activeTab = 'all'; // 'all', 'wearables', 'tech', 'orders'

  final List<Map<String, dynamic>> _catalog = [
    {
      'id': 'techgration-tshirt',
      'title': 'TechGration Developer Signature T-Shirt',
      'subtitle': 'Heavyweight 240 GSM French Terry Cotton',
      'category': 'Apparel & Wearables',
      'retailValue': '₹1,999',
      'assetImage': 'assets/images/techgration-tshirt.png',
      'image': 'https://campus.techgration.live/rewards/techgration-tshirt.png',
      'highlights': [
        '240 GSM 100% Super-combed French Terry Cotton',
        'Tactile 3D Silicon TechGration Monogram Crest on Chest',
        'Engineered for Tech & Growth high-density back artwork',
        'Bio-washed, pre-shrunk fabric with reinforced dual stitching',
      ],
      'specs': [
        {'label': 'Fabric', 'value': '240 GSM French Terry Cotton'},
        {'label': 'Fit', 'value': 'Modern Relaxed Unisex Fit'},
        {'label': 'Crest', 'value': 'Micro-injected Silicone'},
        {'label': 'Wash Care', 'value': 'Machine Wash Cold, Inside Out'},
      ],
      'options': ['L (42")', 'M (40")', 'XL (44")', 'S (38")', 'XXL (46")'],
    },
    {
      'id': 'techgration-cap',
      'title': 'TechGration Signature Athletic Cap',
      'subtitle': 'Structured 6-Panel Studio Showcase',
      'category': 'Apparel & Headwear',
      'retailValue': '₹1,299',
      'assetImage': 'assets/images/techgration-cap.png',
      'image': 'https://campus.techgration.live/rewards/techgration-cap.png',
      'highlights': [
        'Premium 6-Panel Structured Crown with fused buckram',
        '3D Tactile High-Definition Monogram Embroidery',
        'Custom Laser-Engraved Antique Brass Buckle Closure',
        'Internal Moisture-Wicking Performance Sweatband',
      ],
      'specs': [
        {'label': 'Material', 'value': '100% Heavy Brushed Cotton Twill'},
        {'label': 'Panels', 'value': '6 Structured Panels with Eyelets'},
        {'label': 'Closure', 'value': 'Antique Brass Tuck-in Buckle'},
        {'label': 'Sizing', 'value': 'Universal Adjustable (54-62 cm)'},
      ],
      'options': ['Stealth Pitch Black', 'Carbon Heather'],
    },
    {
      'id': 'techgration-sleeve',
      'title': 'TechGration Armor Pro Laptop Sleeve',
      'subtitle': 'Military-Grade 900D Ballistic Nylon',
      'category': 'Tech Gear & Accessories',
      'retailValue': '₹2,499',
      'assetImage': 'assets/images/techgration-sleeve.png',
      'image': 'https://campus.techgration.live/rewards/techgration-sleeve.png',
      'highlights': [
        'Military-Grade 900D Water-Repellent Ballistic Nylon',
        '360-Degree CornerAir Shock Absorbing Perimeter Bumper',
        'Ultra-Soft Velvet Scratch-Proof Interior Lining',
        'Dual Front Expansion Zipper Pockets for Charger & Cables',
      ],
      'specs': [
        {'label': 'Exterior', 'value': '900D Ballistic Cordura Nylon'},
        {'label': 'Interior', 'value': 'Velvet Fleece + High-Density Foam'},
        {'label': 'Zippers', 'value': 'Waterproof YKK Smooth Glide'},
        {'label': 'Water Resistance', 'value': 'IPX3 Splash & Spill Proof'},
      ],
      'options': ['13-14" MacBook / Slim Ultrabook', '15-16" MacBook Pro / Large Laptop'],
    },
    {
      'id': 'boat-earbuds',
      'title': 'boAt Airdopes Pro True Wireless Earbuds',
      'subtitle': '13mm Dynamic Drivers · ENx Quad Mics · 42H Battery',
      'category': 'Audio & Electronics',
      'retailValue': '₹3,990',
      'assetImage': 'assets/images/boat-airdopes.png',
      'image': 'https://campus.techgration.live/rewards/boat-airdopes.png',
      'highlights': [
        '13mm Bionic Drivers tuned for high-fidelity bass and vocal clarity',
        'Quad ENx AI Environmental Noise Cancellation Technology',
        'ASAP Fast Charge: 5 Minutes Charge = 60 Minutes Playback',
        'Beast Mode Low Latency (50ms) for smooth video playback & viva',
      ],
      'specs': [
        {'label': 'Battery Playback', 'value': 'Up to 42 Hours (Earbuds + Case)'},
        {'label': 'Fast Charging', 'value': 'Type-C ASAP Charge (5 min = 60 min)'},
        {'label': 'Bluetooth', 'value': 'Bluetooth v5.3 with IWP Instant Pair'},
        {'label': 'Water Resistance', 'value': 'IPX4 Sweat & Splash Resistance'},
      ],
      'options': ['Active Carbon Black', 'Royal Cobalt Blue', 'Frost White'],
    },
  ];

  Widget _buildSwagImage(Map<String, dynamic> item, {BoxFit fit = BoxFit.cover}) {
    final id = item['id'] as String? ?? '';
    String? asset = item['assetImage'] as String?;
    if (asset == null || asset.isEmpty) {
      if (id == 'techgration-tshirt') {
        asset = 'assets/images/techgration-tshirt.png';
      } else if (id == 'techgration-cap') {
        asset = 'assets/images/techgration-cap.png';
      } else if (id == 'techgration-sleeve') {
        asset = 'assets/images/techgration-sleeve.png';
      } else if (id == 'boat-earbuds') {
        asset = 'assets/images/boat-airdopes.png';
      }
    }

    String? rawUrl = item['image'] as String?;
    String? networkUrl;
    if (rawUrl != null && rawUrl.isNotEmpty) {
      if (rawUrl.startsWith('http')) {
        networkUrl = rawUrl;
      } else if (rawUrl.startsWith('/')) {
        networkUrl = 'https://campus.techgration.live$rawUrl';
      }
    }

    if (asset != null && asset.isNotEmpty) {
      return Image.asset(
        asset,
        fit: fit,
        errorBuilder: (context, error, stackTrace) {
          if (networkUrl != null && networkUrl.isNotEmpty) {
            return Image.network(
              networkUrl,
              fit: fit,
              errorBuilder: (ctx, err, stack) => _buildFallbackIcon(),
            );
          }
          return _buildFallbackIcon();
        },
      );
    }

    if (networkUrl != null && networkUrl.isNotEmpty) {
      return Image.network(
        networkUrl,
        fit: fit,
        errorBuilder: (ctx, err, stack) => _buildFallbackIcon(),
      );
    }

    return _buildFallbackIcon();
  }

  Widget _buildFallbackIcon() {
    return const Center(
      child: Icon(Icons.shopping_bag_outlined, size: 48, color: Color(0xFF008A8A)),
    );
  }

  void _openInspectSheet(Map<String, dynamic> item, bool isEligible) {
    HapticService.selection();
    final highlights = (item['highlights'] as List<dynamic>?) ?? [];
    final specs = (item['specs'] as List<dynamic>?) ?? [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
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
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '🏆 #1 CHAMPION EXCLUSIVE',
                    style: TextStyle(color: Color(0xFFB45309), fontSize: 10, fontWeight: FontWeight.w800),
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 22),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item['title'] as String,
              style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800, fontSize: 19),
            ),
            Text(
              item['subtitle'] as String,
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                physics: const BouncingScrollPhysics(),
                children: [
                  // Product Preview Card
                  Container(
                    height: 220,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: (item['id'] == 'boat-earbuds') ? Colors.white : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Padding(
                      padding: item['id'] == 'boat-earbuds' ? const EdgeInsets.all(16) : EdgeInsets.zero,
                      child: _buildSwagImage(item, fit: BoxFit.contain),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Highlights
                  Text('Product Highlights', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  for (final h in highlights) ...[
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF008A8A)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(h as String, style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary)),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 18),

                  // Material Specs
                  Text('Specifications', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  for (final s in specs) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text((s as Map)['label'] as String, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
                          Text(s['value'] as String, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            BouncingButton(
              onTap: () {
                Navigator.pop(ctx);
                _openClaimSheet(item, isEligible);
              },
              child: Container(
                width: double.infinity,
                height: 50,
                decoration: BoxDecoration(
                  gradient: isEligible
                      ? const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)])
                      : null,
                  color: isEligible ? null : AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(16),
                  border: isEligible ? null : Border.all(color: AppColors.borderLight),
                ),
                alignment: Alignment.center,
                child: Text(
                  isEligible ? 'Claim Free Swag Delivery 📦' : '🔒 Rank #1 Required to Claim',
                  style: TextStyle(
                    color: isEligible ? Colors.white : AppColors.textMuted,
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openClaimSheet(Map<String, dynamic> item, bool isEligible) {
    if (!isEligible) {
      HapticService.heavyImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Locked: Achieve #1 Rank on any course leaderboard to claim this exclusive swag!'),
          backgroundColor: Color(0xFFD97706),
        ),
      );
      return;
    }

    HapticService.selection();
    final rawOptions = item['options'];
    List<String> options = ['Standard'];
    if (rawOptions is List && rawOptions.isNotEmpty) {
      if (rawOptions.first is String) {
        options = rawOptions.map((e) => e.toString()).toList();
      } else if (rawOptions.first is Map) {
        final choices = (rawOptions.first as Map)['choices'];
        if (choices is List && choices.isNotEmpty) {
          options = choices.map((e) => e.toString()).toList();
        }
      }
    }
    String selectedOption = options.first;
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final stateCtrl = TextEditingController();
    final pinCtrl = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          height: MediaQuery.of(context).size.height * 0.88,
          decoration: const BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.only(
            top: 20,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
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
              const SizedBox(height: 16),
              Text(
                'Claim Champion Reward',
                style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800),
              ),
              Text(
                '${item['title']} • Delivered via BlueDart Express Logistics',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 14),
              Expanded(
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // Option Selection
                    Text('Select Size / Variant', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      children: options.map((opt) {
                        final isSel = selectedOption == opt;
                        return ChoiceChip(
                          label: Text(opt),
                          selected: isSel,
                          onSelected: (_) => setSheetState(() => selectedOption = opt),
                          selectedColor: const Color(0xFF00D6D6),
                          backgroundColor: AppColors.surfaceLight,
                          labelStyle: TextStyle(
                            color: isSel ? Colors.white : AppColors.textPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Shipping details
                    Text('Full Delivery Name', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    TextField(controller: nameCtrl, decoration: _inputDecoration('e.g. Gayatri Mohanty')),

                    const SizedBox(height: 10),
                    Text('Mobile Phone', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: _inputDecoration('e.g. 9876543210')),

                    const SizedBox(height: 10),
                    Text('Complete Street Address', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    TextField(controller: addressCtrl, maxLines: 2, decoration: _inputDecoration('House, Street, Area')),

                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('City', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              TextField(controller: cityCtrl, decoration: _inputDecoration('City')),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('State', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              TextField(controller: stateCtrl, decoration: _inputDecoration('State')),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('PIN Code', style: AppTypography.titleMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              TextField(controller: pinCtrl, keyboardType: TextInputType.number, decoration: _inputDecoration('PIN')),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              BouncingButton(
                scaleDown: 0.96,
                onTap: () async {
                  if (isSubmitting) return;
                  if (nameCtrl.text.trim().isEmpty ||
                      phoneCtrl.text.trim().isEmpty ||
                      addressCtrl.text.trim().isEmpty ||
                      cityCtrl.text.trim().isEmpty ||
                      pinCtrl.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please complete all shipping address fields.')),
                    );
                    return;
                  }

                  setSheetState(() => isSubmitting = true);
                  final res = await ApiClient.post(
                    Endpoints.claimReward,
                    data: {
                      'rewardId': item['id'],
                      'selectedOption': selectedOption,
                      'shippingName': nameCtrl.text.trim(),
                      'shippingPhone': phoneCtrl.text.trim(),
                      'shippingAddress': addressCtrl.text.trim(),
                      'shippingCity': cityCtrl.text.trim(),
                      'shippingState': stateCtrl.text.trim().isNotEmpty ? stateCtrl.text.trim() : 'Delhi',
                      'shippingPincode': pinCtrl.text.trim(),
                    },
                  );

                  if (!context.mounted) return;
                  Navigator.pop(ctx);

                  if (res.success) {
                    HapticService.success();
                    ref.read(academicsProvider.notifier).loadAll();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('🎉 ${res.data?['message'] ?? 'Reward claimed! BlueDart tracking generated.'}'),
                        backgroundColor: const Color(0xFF047857),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(res.error ?? 'Failed to submit claim.'),
                        backgroundColor: AppColors.error,
                      ),
                    );
                  }
                },
                child: Container(
                  width: double.infinity,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  alignment: Alignment.center,
                  child: isSubmitting
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                      : const Text(
                          'Confirm & Dispatch Free Swag 🚚',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: AppColors.surfaceLight,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF008A8A), width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final academicsState = ref.watch(academicsProvider);
    final eligibility = academicsState.rewardEligibility ?? {};
    final isEligible = eligibility['isChampion'] as bool? ?? false;
    final claims = academicsState.rewardClaims;

    // Use live catalog from backend if available, mapped with local assets, or fallback to _catalog
    List<Map<String, dynamic>> itemsList = _catalog;
    if (academicsState.rewardCatalog.isNotEmpty) {
      itemsList = academicsState.rewardCatalog.map<Map<String, dynamic>>((raw) {
        final m = Map<String, dynamic>.from(raw as Map);
        final id = m['id'] as String? ?? '';
        if (id == 'techgration-tshirt') {
          m['assetImage'] = 'assets/images/techgration-tshirt.png';
        } else if (id == 'techgration-cap') {
          m['assetImage'] = 'assets/images/techgration-cap.png';
        } else if (id == 'techgration-sleeve') {
          m['assetImage'] = 'assets/images/techgration-sleeve.png';
        } else if (id == 'boat-earbuds') {
          m['assetImage'] = 'assets/images/boat-airdopes.png';
        }
        return m;
      }).toList();
    }

    final filtered = itemsList.where((item) {
      if (_activeTab == 'wearables') {
        return item['category'] == 'Apparel & Wearables' || item['category'] == 'Apparel & Headwear';
      }
      if (_activeTab == 'tech') {
        return item['category'] == 'Tech Gear & Accessories' || item['category'] == 'Audio & Electronics';
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Champion Swag Hub',
          style: AppTypography.headlineLarge.copyWith(fontWeight: FontWeight.w800),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          physics: const BouncingScrollPhysics(),
          children: [
            // Hero Status Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isEligible
                      ? [const Color(0xFF042F2E), const Color(0xFF0F172A)]
                      : [const Color(0xFF1E1B4B), const Color(0xFF0F172A)],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isEligible
                      ? const Color(0xFF14B8A6).withValues(alpha: 0.4)
                      : const Color(0xFFF59E0B).withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.emoji_events_rounded, color: Color(0xFFF59E0B), size: 14),
                        const SizedBox(width: 6),
                        Text(
                          isEligible ? 'CHAMPION STATUS: UNLOCKED 🏆' : 'EXCLUSIVE TO #1 CHAMPIONS',
                          style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.w800, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isEligible ? 'Congratulations, Champion!' : 'Leaderboard Swag Vault',
                    style: AppTypography.headlineLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isEligible
                        ? 'Your #1 rank on the course leaderboard entitles you to claim 1 exclusive piece of official TechGration merchandise delivered to your doorstep.'
                        : 'Official TechGration developer gear is reserved exclusively for students holding the #1 position on their course cohort leaderboard.',
                    style: AppTypography.bodySmall.copyWith(color: Colors.white.withValues(alpha: 0.75), height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Filter Tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  _buildTabChip('All Champion Swag (4)', 'all'),
                  const SizedBox(width: 8),
                  _buildTabChip('Wearables (T-Shirt & Cap)', 'wearables'),
                  const SizedBox(width: 8),
                  _buildTabChip('Tech Gear (Sleeve & Earbuds)', 'tech'),
                  const SizedBox(width: 8),
                  _buildTabChip('My Orders & Tracking (${claims.length})', 'orders'),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Content
            if (_activeTab == 'orders') ...[
              if (claims.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.local_shipping_outlined, size: 40, color: AppColors.textSecondary),
                      const SizedBox(height: 12),
                      Text('No Orders Placed Yet', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        'Claimed rewards and BlueDart tracking details will appear here.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              else
                for (final claim in claims) _buildClaimOrderCard(claim as Map<String, dynamic>),
            ] else ...[
              for (final item in filtered) _buildProductCard(item, isEligible),
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildTabChip(String label, String key) {
    final isSel = _activeTab == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSel,
      onSelected: (_) {
        HapticService.selection();
        setState(() => _activeTab = key);
      },
      selectedColor: AppColors.textPrimary,
      backgroundColor: AppColors.surfaceLight,
      labelStyle: TextStyle(
        color: isSel ? Colors.white : AppColors.textSecondary,
        fontWeight: FontWeight.w700,
        fontSize: 12,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      side: BorderSide(color: isSel ? AppColors.textPrimary : AppColors.borderLight),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> item, bool isEligible) {
    final title = item['title'] as String;
    final subtitle = item['subtitle'] as String;
    final retail = item['retailValue'] as String;
    final category = item['category'] as String;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: AppColors.cardShadow,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Container
          Container(
            height: 205,
            width: double.infinity,
            decoration: BoxDecoration(
              color: (item['id'] == 'boat-earbuds') ? Colors.white : const Color(0xFF0F172A),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Padding(
                    padding: item['id'] == 'boat-earbuds' ? const EdgeInsets.all(14) : EdgeInsets.zero,
                    child: _buildSwagImage(
                      item,
                      fit: item['id'] == 'boat-earbuds' ? BoxFit.contain : BoxFit.cover,
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: const Text(
                      '🏆 #1 Champion Exclusive',
                      style: TextStyle(color: Color(0xFFB45309), fontSize: 10, fontWeight: FontWeight.w800),
                    ),
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
                Text(title, style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, fontSize: 16)),
                const SizedBox(height: 4),
                Text(subtitle, style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          retail,
                          style: const TextStyle(
                            decoration: TextDecoration.lineThrough,
                            color: AppColors.textMuted,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Text(
                          'FREE FOR #1 CHAMPION',
                          style: TextStyle(
                            color: Color(0xFF047857),
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        BouncingButton(
                          scaleDown: 0.94,
                          onTap: () => _openInspectSheet(item, isEligible),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceLight,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.borderLight),
                            ),
                            child: const Text(
                              'Inspect',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        BouncingButton(
                          scaleDown: 0.94,
                          onTap: () => _openClaimSheet(item, isEligible),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: isEligible
                                  ? const LinearGradient(colors: [Color(0xFF00D6D6), Color(0xFF0284C7)])
                                  : null,
                              color: isEligible ? null : AppColors.surfaceLight,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                if (!isEligible) ...[
                                  const Icon(Icons.lock_outline_rounded, size: 13, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                ],
                                Text(
                                  isEligible ? 'Claim' : '#1 Required',
                                  style: TextStyle(
                                    color: isEligible ? Colors.white : AppColors.textMuted,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClaimOrderCard(Map<String, dynamic> claim) {
    final title = claim['rewardTitle'] as String? ?? 'TechGration Swag';
    final tracking = claim['trackingCode'] as String? ?? 'TG-SWAG';
    final courier = claim['courier'] as String? ?? 'BlueDart Express';
    final status = claim['status'] as String? ?? 'APPROVED';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status,
                  style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.w800, fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text('Courier: $courier', style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.qr_code_2_rounded, size: 16, color: Color(0xFF008A8A)),
                const SizedBox(width: 6),
                Text(
                  'Tracking: $tracking',
                  style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w700, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
