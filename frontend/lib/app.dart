import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/home_screen.dart';
import 'screens/sign_in_screen.dart';
import 'state/auth_controller.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tuma-Me',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF2B59FF),
      ),
      home: Consumer<AuthController>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return auth.isAuthed ? const HomeScreen() : const SignInScreen();
        },
      ),
    );
  }
}

