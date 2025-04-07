import 'package:flutter/material.dart';
import '../models/game.dart';
import '../models/player.dart';
import '../models/card.dart';

class GameScreen extends StatefulWidget {
  final int numPlayers;
  GameScreen({required this.numPlayers});

  @override
  _GameScreenState createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late Game game;
  GameCard? selectedHandCard;
  List<GameCard> selectedTableCards = [];
  String errorMessage = '';

  @override
  void initState() {
    super.initState();
    List<Player> players = List.generate(
      widget.numPlayers,
          (index) => Player(name: 'שחקן ${index + 1}'),
    );
    game = Game(players);
  }

  void selectHandCard(GameCard card) {
    if (!game.players[game.currentPlayerIndex].hand.contains(card)) return;

    setState(() {
      if (selectedHandCard == card) {
        selectedHandCard = null;
      } else {
        selectedHandCard = card;
      }
      errorMessage = '';
    });
  }

  void toggleTableCard(GameCard card) {
    setState(() {
      if (selectedTableCards.contains(card)) {
        selectedTableCards.remove(card);
      } else {
        selectedTableCards.add(card);
      }
      errorMessage = '';
    });
  }

  void confirmMove() {
    final currentPlayer = game.players[game.currentPlayerIndex];

    if (selectedHandCard == null) {
      setState(() {
        errorMessage = 'בחר קלף מהיד קודם';
      });
      return;
    }
    final playedCard = selectedHandCard!;
    if (!currentPlayer.hand.contains(playedCard)) {
      setState(() {
        errorMessage = 'הקלף הזה לא ביד של השחקן הנוכחי';
      });
      return;
    }
    final total = game.getCardValue(playedCard) + selectedTableCards.fold(0, (sum, c) => sum + game.getCardValue(c));

    bool isValidMove = false;
    bool shouldStayOnTable = true;

    if (playedCard.rank == 'JACK') {
      final taken = game.tableCards.where((c) => c.rank != 'KING' && c.rank != 'QUEEN').toList();
      if (taken.isNotEmpty) {
        currentPlayer.collected.addAll(taken);
        game.tableCards.removeWhere((c) => taken.contains(c));
        isValidMove = true;
        shouldStayOnTable = false;
      }
    } else if (playedCard.rank == 'QUEEN') {
      final queensOnTable = game.tableCards.where((c) => c.rank == 'QUEEN').toList();
      if (queensOnTable.length == 3) {
        currentPlayer.collected.addAll(queensOnTable);
        game.tableCards.removeWhere((c) => queensOnTable.contains(c));
        isValidMove = true;
        shouldStayOnTable = false;
      } else if (queensOnTable.length >= 1) {
        // רגיל – לוקחת רק מלכה אחת
        final taken = [queensOnTable.first];
        currentPlayer.collected.addAll(taken);
        game.tableCards.removeWhere((c) => taken.contains(c));
        isValidMove = true;
        shouldStayOnTable = false;
      }
    } else if (playedCard.rank == 'KING') {
      final kingsOnTable = game.tableCards.where((c) => c.rank == 'KING').toList();
      if (kingsOnTable.length == 3) {
        // אם יש בדיוק 3 מלכים – לוקחים את כולם
        currentPlayer.collected.addAll(kingsOnTable);
        game.tableCards.removeWhere((c) => kingsOnTable.contains(c));
        isValidMove = true;
        shouldStayOnTable = false;
      } else if (kingsOnTable.length >= 1) {
        // לוקחים רק מלך אחד
        final taken = [kingsOnTable.first];
        currentPlayer.collected.addAll(taken);
        game.tableCards.removeWhere((c) => taken.contains(c));
        isValidMove = true;
        shouldStayOnTable = false;
      }
    }
    else if (total == 11 && selectedTableCards.isNotEmpty) {
      currentPlayer.collected.addAll(selectedTableCards);
      game.tableCards.removeWhere((c) => selectedTableCards.contains(c));
      isValidMove = true;
      shouldStayOnTable = false;
    } else {
      final autoTake = game.tableCards.firstWhere(
            (c) => game.getCardValue(c) + game.getCardValue(playedCard) == 11,
        orElse: () => GameCard(rank: '', suit: ''),
      );
      if (autoTake.rank.isNotEmpty) {
        currentPlayer.collected.add(autoTake);
        game.tableCards.remove(autoTake);
        isValidMove = true;
        shouldStayOnTable = false;
      }
    }

    if (isValidMove) {
      currentPlayer.collected.add(playedCard);
    } else if (shouldStayOnTable) {
      game.tableCards.add(playedCard);
    }

    currentPlayer.hand.removeWhere((c) => c == playedCard);

    setState(() {
      selectedHandCard = null;
      selectedTableCards.clear();
      errorMessage = (!isValidMove && !shouldStayOnTable) ? 'הבחירה לא חוקית. נסה שוב.' : '';
      game.nextPlayer();
      bool isGameOver = game.dealNewRoundIfNeeded();
      if (isGameOver) {
        showEndOfRoundDialog();
      }
    });
  }

  Widget buildCard(GameCard card, {bool selected = false, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        margin: EdgeInsets.all(2),
        padding: EdgeInsets.all(4),
        width: 40,
        height: 18,
        decoration: BoxDecoration(
          color: selected ? Colors.amber : Colors.white,
          border: Border.all(color: Colors.black),
          borderRadius: BorderRadius.circular(6),
        ),
        transform: selected ? Matrix4.translationValues(0, -6, 0) : Matrix4.identity(),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text('${card.rank} ${card.suit}', style: TextStyle(fontSize: 8)),
        ),
      ),
    );
  }

  int getTeamCollectedCount(int team) {
    if (team == 1) {
      return game.players[0].collected.length + (game.players.length > 2 ? game.players[2].collected.length : 0);
    } else {
      return game.players[1].collected.length + (game.players.length > 3 ? game.players[3].collected.length : 0);
    }
  }

  int getTeamClubsCount(int team) {
    List<GameCard> all = [];
    if (team == 1) {
      all = [...game.players[0].collected];
      if (game.players.length > 2) all.addAll(game.players[2].collected);
    } else {
      all = [...game.players[1].collected];
      if (game.players.length > 3) all.addAll(game.players[3].collected);
    }
    return all.where((card) => card.suit == 'CLUBS').length;
  }

  Widget buildTeamStats(int team) {
    return Column(
      children: [
        Text('קבוצה $team'),
        Text('קלפים: ${getTeamCollectedCount(team)}'),
        Text('תלתנים: ${getTeamClubsCount(team)}')
      ],
    );
  }

  Widget buildPlayerArea(Player player, bool isBottom) {
    bool isCurrent = game.players[game.currentPlayerIndex] == player;
    return Column(
      children: [
        Text(player.name + (isCurrent ? ' (התור שלך)' : '')),
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 2,
          runSpacing: 2,
          children: player.hand.map((card) {
            bool isSelected = selectedHandCard == card;
            return buildCard(
              card,
              selected: isSelected,
              onTap: isCurrent ? () => selectHandCard(card) : null,
            );
          }).toList(),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPlayers = game.players.take(2).toList();
    final bottomPlayers = game.players.skip(2).toList();

    return Scaffold(
      appBar: AppBar(title: Text('משחק קלפים')),
      body: SafeArea(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: topPlayers.map((p) => Expanded(child: buildPlayerArea(p, false))).toList(),
            ),
            Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [buildTeamStats(1), buildTeamStats(2)],
            ),
            SizedBox(height: 6),
            Text('קלפים על השולחן', style: TextStyle(fontSize: 14)),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 4,
              runSpacing: 4,
              children: game.tableCards.map((card) {
                bool isSelected = selectedTableCards.contains(card);
                return buildCard(
                  card,
                  selected: isSelected,
                  onTap: () => toggleTableCard(card),
                );
              }).toList(),
            ),
            SizedBox(height: 8),
            Text('תור של: ${game.players[game.currentPlayerIndex].name}'),
            ElevatedButton(
              onPressed: confirmMove,
              child: Text('אשר בחירה'),
            ),
            if (errorMessage.isNotEmpty) Text(errorMessage, style: TextStyle(color: Colors.red)),
            Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: bottomPlayers.map((p) => Expanded(child: buildPlayerArea(p, true))).toList(),
            ),
          ],
        ),
      ),
    );
  }

  void showEndOfRoundDialog() {
    final scores = game.calculatePoints();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("סיום סיבוב!"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("קבוצה 1 קיבלה: ${scores['team1']} נקודות"),
            Text("קבוצה 2 קיבלה: ${scores['team2']} נקודות"),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // אפשר לאתחל משחק חדש או לחזור למסך הראשי
            },
            child: Text("אוקיי"),
          ),
        ],
      ),
    );
  }

}
