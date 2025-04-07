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
    int clubsCount = 0; // נשתמש בזה בשביל הקבוצה

    for (var card in collected) {
      // אס
      if (card.rank == 'A') {
        score += 1;
      }

      // נסיך
      if (card.rank == 'J') {
        score += 1;
      }

      // 10 יהלום
      if (card.rank == '10' && card.suit == 'DIAMONDS') {
        score += 3;
      }

      // 2 תלתן
      if (card.rank == '2' && card.suit == 'CLUBS') {
        score += 2;
      }

      // ספירה של כל התלתנים (בשביל החישוב הקבוצתי)
      if (card.suit == 'CLUBS') {
        clubsCount++;
      }
    }

    // החזרת הסקור + ספירת תלתנים (אם אתה צריך את זה לשיקול קבוצתי מחוץ לפונקציה)
    return score;
  }

}
