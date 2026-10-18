import 'package:flutter_test/flutter_test.dart';
import 'package:techgration_app/main.dart';

void main() {
  testWidgets('TechGration Student App loads successfully smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const TechGrationStudentApp());
    expect(find.byType(TechGrationStudentApp), findsOneWidget);
  });
}
