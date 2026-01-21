import type { 
  PackRarity, 
  PackReward 
} from '../constants/packs';
import { 
  RARITY_CHANCES, 
  REWARD_TYPES, 
  REWARDS_BY_RARITY, 
} from '../constants/packs';
import { ALL_SHOP_ITEMS } from '../constants/shopItems';

export const rollPackRarity = (): PackRarity => {
  const roll = Math.random();
  let cumulative = 0;
  for (const p of RARITY_CHANCES) {
    cumulative += p.chance;
    if (roll <= cumulative) return p.rarity;
  }
  return 'simple';
};

export const rollRewardType = (): PackReward['type'] => {
  const roll = Math.random();
  let cumulative = 0;
  for (const r of REWARD_TYPES) {
    cumulative += r.chance;
    if (roll <= cumulative) return r.type;
  }
  return 'coins';
};

export const generatePackReward = (
  rarity: PackRarity, 
  inventory: { cardBacks: string[], reactions: string[] }
): PackReward => {
  let type = rollRewardType();
  const rarityRewards = REWARDS_BY_RARITY[rarity];

  if (type === 'fragment') {
    // Determine all available items that the player doesn't fully own
    const availableItems = ALL_SHOP_ITEMS.filter(item => {
      if (item.type === 'cardBack') return !inventory.cardBacks.includes(item.id);
      if (item.type === 'reaction') return !inventory.reactions.includes(item.id);
      return false;
    });

    if (availableItems.length === 0) {
      // If all items are owned, replace fragment rewards with Coins instead
      type = 'coins';
    } else {
      // Pick a random available item (instead of just the cheapest)
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const selectedItem = availableItems[randomIndex];

      return {
        type: 'fragment',
        amount: rarityRewards.fragment.min,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        rarity
      };
    }
  }

  const amountConfig = rarityRewards[type];
  const amount = amountConfig.min;

  return {
    type,
    amount,
    rarity
  };
};
