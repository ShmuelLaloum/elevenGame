import 'package:flutter/material.dart';
import 'game_screen.dart';

class LobbyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ברוך הבא למשחק הקלפים!!!')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GameScreen(numPlayers: 2),
                  ),
                );
              },
              child: Text('משחק 1 על 1'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GameScreen(numPlayers: 4),
                  ),
                );
              },
              child: Text('משחק 2 על 2'),
            ),
          ],
        ),
      ),
    );
  }
}