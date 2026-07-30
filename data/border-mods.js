/**
 * Border modifiers (13) - the randomised "Corruption Currents" around the Voyage Board perimeter.
 * Source: https://www.poewiki.net/wiki/Voyage#List_of_border_modifiers
 *
 * The wiki does not expose internal names for these, so ids are our own (`border_*`)
 * and must stay stable - saved layouts reference them.
 *
 * scope: "border" -> applies to the single cell the segment touches.
 */
export const BORDER_MODS = [
  { id: 'border_currency', category: 'currency', short: '100% more Currency', text: '100% more Currency found in adjacent Areas', stack: 'sum', numeric: { min: 100, max: 100, unit: '%' } },
  { id: 'border_rarity', category: 'loot', short: '100% more Rarity', text: '100% more Rarity of Items found in adjacent Areas', stack: 'sum', numeric: { min: 100, max: 100, unit: '%' } },
  { id: 'border_sea_beasts', category: 'packs', short: '+12 Sea Beast packs', text: 'Adjacent Areas contain (12) additional packs of Sea Beasts', stack: 'sum', numeric: { min: 12, max: 12, unit: 'count' } },
  { id: 'border_crabs', category: 'packs', short: '+8 Crab packs', text: 'Adjacent Areas contain (8) additional packs of Crabs', stack: 'sum', numeric: { min: 8, max: 8, unit: 'count' } },
  { id: 'border_golden_lanterns', category: 'misc', short: '+4 Golden Lantern', text: 'Adjacent Areas contain (4) additional Golden Lanterns', stack: 'sum', numeric: { min: 4, max: 4, unit: 'count' } },
  { id: 'border_altars', category: 'misc', short: '+2 Altars', text: 'Adjacent Areas contain (2) Alters to the Goddess', stack: 'sum', numeric: { min: 2, max: 2, unit: 'count' } },
  { id: 'border_treasure_anchors', category: 'misc', short: '+2 Treasure Anchor', text: 'Adjacent Areas contain (2) additional Treasure Anchors', stack: 'sum', numeric: { min: 2, max: 2, unit: 'count' } },
  { id: 'border_pirates_locker', category: 'misc', short: "Pirate's Locker", text: "Adjacent Areas contain a lost Pirate's Locker", stack: 'flag' },
  { id: 'border_rare_monsters', category: 'density', short: '75/100% Rare mobs', text: '(75/100)% increased number of Rare Monsters in adjacent Areas', stack: 'flag' },
  { id: 'border_min_magic', category: 'density', short: 'Monsters at least Magic', text: 'Monsters in adjacent Areas are at least Magic', stack: 'flag' },
  { id: 'border_free_lanterns', category: 'misc', short: 'Free Lanterns', text: 'Placing Lanterns does not reduce your Lantern count in adjacent Areas', stack: 'flag' },
  { id: 'border_experience', category: 'misc', short: '100% Experience', text: 'Players in adjacent Areas gain 100% increased Experience', stack: 'sum', numeric: { min: 100, max: 100, unit: '%' } },
  { id: 'border_exalted', category: 'currency', short: '+1 Exalt on Rares', text: 'Rare Monsters in adjacent Areas drop an additional Exalted Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
].map((m) => ({ ...m, scope: 'border' }));
