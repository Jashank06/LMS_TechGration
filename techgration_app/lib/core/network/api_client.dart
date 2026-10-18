import 'package:dio/dio.dart';
import '../services/storage_service.dart';
import 'endpoints.dart';

class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.statusCode,
  });
}

class ApiClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: Endpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  )..interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = StorageService.getSessionToken();
          if (token != null && token.isNotEmpty) {
            // Attach session cookie and Bearer authorization
            options.headers['Cookie'] = 'tg_session=$token';
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) async {
          final cookies = response.headers['set-cookie'];
          if (cookies != null) {
            for (final cookie in cookies) {
              if (cookie.contains('tg_session=')) {
                final token = cookie.split('tg_session=')[1].split(';')[0];
                if (token.isNotEmpty) {
                  await StorageService.setSessionToken(token);
                }
              }
            }
          }
          return handler.next(response);
        },
        onError: (DioException error, handler) {
          return handler.next(error);
        },
      ),
    );

  static Dio get dio => _dio;

  static Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse<T>(
        success: true,
        data: response.data as T?,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      final message = _extractErrorMessage(e);
      return ApiResponse<T>(
        success: false,
        error: message,
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      return ApiResponse<T>(success: false, error: e.toString());
    }
  }

  static Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return ApiResponse<T>(
        success: true,
        data: response.data as T?,
        statusCode: response.statusCode,
      );
    } on DioException catch (e) {
      final message = _extractErrorMessage(e);
      return ApiResponse<T>(
        success: false,
        error: message,
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      return ApiResponse<T>(success: false, error: e.toString());
    }
  }

  static String _extractErrorMessage(DioException e) {
    if (e.response?.data is Map) {
      final map = e.response!.data as Map;
      if (map.containsKey('error')) return map['error'].toString();
      if (map.containsKey('message')) return map['message'].toString();
    }
    if (e.response?.statusCode == 413) {
      return 'The selected photo is too large for the network gateway. Please select a smaller photo.';
    }
    if (e.response?.statusCode == 401) {
      return 'Session expired. Please sign in again.';
    }
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Check your internet connection.';
      case DioExceptionType.connectionError:
        return 'Could not connect to the campus server.';
      default:
        return e.message ?? 'An unexpected error occurred.';
    }
  }
}
