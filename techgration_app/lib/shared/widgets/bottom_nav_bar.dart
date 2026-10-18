import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/services/haptic_service.dart';

class BottomNavBarItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int? badgeCount;

  const BottomNavBarItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.badgeCount,
  });
}

class TechGrationBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final int pendingAssignmentsCount;

  const TechGrationBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.pendingAssignmentsCount = 0,
  });

  List<BottomNavBarItem> get _items => [
        const BottomNavBarItem(
          icon: Icons.dashboard_outlined,
          activeIcon: Icons.dashboard_rounded,
          label: 'Dashboard',
        ),
        const BottomNavBarItem(
          icon: Icons.menu_book_outlined,
          activeIcon: Icons.menu_book_rounded,
          label: 'Courses',
        ),
        const BottomNavBarItem(
          icon: Icons.videocam_outlined,
          activeIcon: Icons.videocam_rounded,
          label: 'Live',
        ),
        BottomNavBarItem(
          icon: Icons.assignment_outlined,
          activeIcon: Icons.assignment_turned_in_rounded,
          label: 'Assignments',
          badgeCount: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : null,
        ),
        const BottomNavBarItem(
          icon: Icons.school_outlined,
          activeIcon: Icons.school_rounded,
          label: 'Academics',
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final items = _items;
    final screenWidth = MediaQuery.of(context).size.width;
    final itemWidth = (screenWidth - 24) / items.length;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.background,
        border: const Border(
          top: BorderSide(
            color: AppColors.borderLight,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Container(
          height: 66,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Stack(
            alignment: Alignment.centerLeft,
            children: [
              // Gliding Soft Cyan/Teal Ambient Pill Indicator (Matching LMS Brand)
              AnimatedPositioned(
                duration: const Duration(milliseconds: 320),
                curve: Curves.easeOutBack,
                left: currentIndex * itemWidth + (itemWidth - 48) / 2,
                top: 6,
                child: Container(
                  width: 48,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00D6D6).withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),

              // Interactive Nav Items Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(items.length, (index) {
                  final item = items[index];
                  final isSelected = index == currentIndex;

                  return Expanded(
                    child: InkWell(
                      onTap: () {
                        if (index != currentIndex) {
                          HapticService.selection();
                          onTap(index);
                        }
                      },
                      splashColor: Colors.transparent,
                      highlightColor: Colors.transparent,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 260),
                                curve: Curves.easeOutBack,
                                transform: Matrix4.diagonal3Values(
                                  isSelected ? 1.15 : 1.0,
                                  isSelected ? 1.15 : 1.0,
                                  1.0,
                                )..setTranslationRaw(0.0, isSelected ? -2.0 : 0.0, 0.0),
                                child: Icon(
                                  isSelected ? item.activeIcon : item.icon,
                                  size: 23,
                                  color: isSelected ? const Color(0xFF008A8A) : AppColors.textSecondary,
                                ),
                              ),
                              if (item.badgeCount != null)
                                Positioned(
                                  top: -4,
                                  right: -8,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFF59E0B),
                                      shape: BoxShape.circle,
                                    ),
                                    constraints: const BoxConstraints(
                                      minWidth: 16,
                                      minHeight: 16,
                                    ),
                                    child: Center(
                                      child: Text(
                                        '${item.badgeCount}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w900,
                                          height: 1.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 200),
                            style: AppTypography.bodySmall.copyWith(
                              fontSize: 11,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                              color: isSelected ? const Color(0xFF008A8A) : AppColors.textSecondary,
                            ),
                            child: Text(item.label),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
