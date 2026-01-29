import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'services/auth_api.dart';
import 'services/token_store.dart';
import 'state/auth_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final auth = AuthController(
    api: AuthApi(),
    tokenStore: TokenStore(),
  );

  // Try to restore session from saved token.
  await auth.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
      ],
      child: const App(),
    ),
  );
}

