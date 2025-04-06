import 'package:flutter/material.dart';
import 'screens/lobby_screen.dart'; // הוספת מסך הלובי

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'משחק קלפים',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: LobbyScreen(), // מסך הלובי ייפתח ראשון
    );
  }
}
