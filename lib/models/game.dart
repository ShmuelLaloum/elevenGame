import 'dart:math';
import 'player.dart';
import 'card.dart';

class Game {
  List<Player> players;
  List<GameCard> deck = [];
  List<GameCard> tableCards = [];
  int currentPlayerIndex = 0;

  Game(this.players) {
    initializeDeck();
    dealCards();
  }

  /// יצירת החפיסה ומערבוב שלה
  void initializeDeck() {
    List<String> suits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
    List<String> ranks = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];

    deck.clear();
    for (var suit in suits) {
      for (var rank in ranks) {
        deck.add(GameCard(rank: rank, suit: suit));
      }
    }
    deck.shuffle();
  }

  /// שליפת קלף מהחפיסה
  GameCard drawCard() {
    return deck.isNotEmpty ? deck.removeLast() : throw Exception('אין יותר קלפים בחפיסה');
  }

  /// חלוקת 4 קלפים לכל שחקן ו-4 קלפים לשולחן
  void dealCards() {
    for (var player in players) {
      player.hand = List.generate(4, (_) => drawCard());
    }
    for (int i = 0; i < 4; i++) {
      tableCards.add(drawCard());
    }
  }

  /// משחקים קלף מהיד
  void playCard(Player player, GameCard playedCard) {
    if (!player.hand.contains(playedCard)) {
      throw Exception("השחקן לא מחזיק את הקלף הזה!");
    }

    player.hand.remove(playedCard);
    List<GameCard> takenCards = [];

    if (playedCard.rank == 'JACK') {
      // נסיך לוקח את כל הקלפים מהשולחן (חוץ ממלכים ומלכות)
      takenCards = tableCards.where((card) => card.rank != 'KING' && card.rank != 'QUEEN').toList();
    } else if (playedCard.rank == 'QUEEN') {
      // מלכה לוקחת מלכה
      takenCards = tableCards.where((card) => card.rank == 'QUEEN').toList();
    } else if (playedCard.rank == 'KING') {
      // מלך לוקח מלך
      takenCards = tableCards.where((card) => card.rank == 'KING').toList();
    } else {
      // קלפים שמשלימים ל-11
      takenCards = findCardsThatSumTo11(playedCard);
    }

    if (takenCards.isNotEmpty) {
      player.collected.addAll(takenCards);
      tableCards.removeWhere((card) => takenCards.contains(card));
      player.collected.add(playedCard); // הקלף ששוחק מתווסף לאוסף השחקן
    } else {
      tableCards.add(playedCard);
    }
  }

  /// פונקציה שמוצאת קלפים שיוצרים סכום 11 עם הקלף ששוחק
  List<GameCard> findCardsThatSumTo11(GameCard playedCard) {
    int playedValue = getCardValue(playedCard);
    List<GameCard> possibleCombination = [];

    for (var card in tableCards) {
      if (getCardValue(card) + playedValue == 11) {
        possibleCombination.add(card);
      }
    }
    return possibleCombination;
  }

  /// המרת ערך קלף למספר
  int getCardValue(GameCard card) {
    Map<String, int> values = {
      'ACE': 1,
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'JACK': 0, // נסיך לא נחשב במספרים
      'QUEEN': 0, // מלכה לא נחשבת במספרים
      'KING': 0 // מלך לא נחשב במספרים
    };
    return values[card.rank] ?? 0;
  }

  /// מעבר תור לשחקן הבא
  void nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }
}