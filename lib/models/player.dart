import 'card.dart';

class Player {
  final String name;
  List<GameCard> hand = [];  // רשימה של קלפים ביד
  List<GameCard> collected = [];  // רשימה של קלפים שנלקחו (הקופה הפרטית)

  Player({required this.name});

  // הוספת קלף ליד השחקן
  void addCardToHand(GameCard card) {
    hand.add(card);
  }

  // הוספת קלף לקופה של השחקן
  void collectCards(GameCard card) {  // שינינו את שם הפונקציה
    collected.add(card);
  }

  // השחקן משחק קלף
  GameCard playCard() {
    if (hand.isNotEmpty) {
      return hand.removeAt(0);  // מחזירים את הקלף הראשון שנמצא ביד
    }
    throw Exception('אין יותר קלפים ביד');
  }

  // חישוב הניקוד של השחקן
  int calculateScore() {
    int score = 0;
    for (var card in collected) {
      score += card.getValue(); // שינינו כדי להשתמש בפונקציה חדשה ב-GameCard
    }
    return score;
  }
}
