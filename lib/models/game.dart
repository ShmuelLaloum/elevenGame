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

    while (tableCards.length < 4 && deck.isNotEmpty) {
      GameCard card = drawCard();
      if (card.rank == 'JACK') {
        // דוחפים את הג'ק לסוף החפיסה
        deck.insert(0, card);
      } else {
        tableCards.add(card);
      }
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

  bool allHandsEmpty() {
    return players.every((player) => player.hand.isEmpty);
  }

  bool dealNewRoundIfNeeded() {
    bool allHandsEmpty = players.every((p) => p.hand.isEmpty);
    if (allHandsEmpty && deck.isNotEmpty) {
      // אם כל הידיים ריקות והקופה לא ריקה, מחלקים קלפים מחדש
      dealCards();
      return false; // המשחק ממשיך
    } else if (allHandsEmpty && deck.isEmpty) {
      // אם כל הידיים ריקות ואין יותר קלפים, המשחק נגמר
      return true;
    }
    return false; // סיבוב עוד לא נגמר
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

  Map<String, int> calculatePoints() {
    int team1Points = 0;
    int team2Points = 0;

    List<GameCard> team1Cards = [];
    List<GameCard> team2Cards = [];

    if (players.length >= 2) {
      team1Cards.addAll(players[0].collected);
      team2Cards.addAll(players[1].collected);
    }
    if (players.length >= 4) {
      team1Cards.addAll(players[2].collected);
      team2Cards.addAll(players[3].collected);
    }

    // ניקוד רגיל
    for (var card in team1Cards) {
      if (card.suit == 'DIAMONDS' && card.rank == '10') team1Points += 3;
      if (card.suit == 'CLUBS' && card.rank == '2') team1Points += 2;
      if (card.rank == 'ACE') team1Points += 1;
      if (card.rank == 'JACK') team1Points += 1;
    }

    for (var card in team2Cards) {
      if (card.suit == 'DIAMONDS' && card.rank == '10') team2Points += 3;
      if (card.suit == 'CLUBS' && card.rank == '2') team2Points += 2;
      if (card.rank == 'ACE') team2Points += 1;
      if (card.rank == 'JACK') team2Points += 1;
    }

    // ספירת תלתנים
    int team1Clubs = team1Cards.where((c) => c.suit == 'CLUBS').length;
    int team2Clubs = team2Cards.where((c) => c.suit == 'CLUBS').length;

    if (team1Clubs > team2Clubs) {
      team1Points += 7;
    } else if (team2Clubs > team1Clubs) {
      team2Points += 7;
    }

    return {
      'team1': team1Points,
      'team2': team2Points,
    };
  }


  int getPointsForCards(List<GameCard> cards) {
    int points = 0;
    int clubsCount = 0;

    for (var card in cards) {
      if (card.suit == 'DIAMONDS' && card.rank == '10') {
        points += 3;
      } else if (card.suit == 'CLUBS' && card.rank == '2') {
        points += 2;
      } else if (card.rank == 'ACE') {
        points += 1;
      } else if (card.rank == 'JACK') {
        points += 1;
      }

      if (card.suit == 'CLUBS') {
        clubsCount++;
      }
    }

    if (clubsCount >= 7) {
      points += 7;
    }

    return points;
  }

}