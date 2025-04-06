class GameCard {
  final String rank;
  final String suit;

  GameCard({required this.rank, required this.suit});

  // החזרת הערך של הקלף
  int getValue() {
    if (rank == 'A') return 1;
    if (rank == 'J' || rank == 'Q' || rank == 'K') return 10;
    return int.tryParse(rank) ?? 0;
  }
}