/**
 * Border modifiers (65) - the randomised "Corruption Currents" around the Voyage Board perimeter.
 *
 * Source: poewiki.net Cargo `mods` table, ids `DeepwaterBorder*` (domain 40), pulled via
 *   /w/api.php?action=cargoquery&tables=mods&where=mods.id LIKE "DeepwaterBorder%"
 *
 * IMPORTANT: do NOT rebuild this list from the "List of border modifiers" section of the Voyage
 * wiki page. That section is hand-written and lists only 13 of these, with values that do not
 * match the game (e.g. it claims "(12) additional packs of Sea Beasts" when the pool actually has
 * 8/12/16 as three separate mods). The Cargo table is generated from game data and is complete.
 *
 * Ids are the real internal mod names, so saved layouts stay stable across data updates.
 * scope: "border" -> applies to the single cell the segment touches.
 */
export const BORDER_MODS = [
  // ---------------------------------------------------------------- monster packs
  { id: 'DeepwaterBorderAdditionalCrabs1', category: 'packs', short: '+8 Crab packs', text: 'Adjacent Areas contain 8 additional packs of Crabs', stack: 'sum', numeric: { min: 8, max: 8, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalCrabs2', category: 'packs', short: '+12 Crab packs', text: 'Adjacent Areas contain 12 additional packs of Crabs', stack: 'sum', numeric: { min: 12, max: 12, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalCrabs3', category: 'packs', short: '+16 Crab packs', text: 'Adjacent Areas contain 16 additional packs of Crabs', stack: 'sum', numeric: { min: 16, max: 16, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalDrowned1', category: 'packs', short: '+8 Drowned packs', text: 'Adjacent Areas contain 8 additional packs of the Drowned', stack: 'sum', numeric: { min: 8, max: 8, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalDrowned2', category: 'packs', short: '+12 Drowned packs', text: 'Adjacent Areas contain 12 additional packs of the Drowned', stack: 'sum', numeric: { min: 12, max: 12, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalDrowned3', category: 'packs', short: '+16 Drowned packs', text: 'Adjacent Areas contain 16 additional packs of the Drowned', stack: 'sum', numeric: { min: 16, max: 16, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalSeaBeasts1', category: 'packs', short: '+8 Sea Beast packs', text: 'Adjacent Areas contain 8 additional packs of Sea Beasts', stack: 'sum', numeric: { min: 8, max: 8, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalSeaBeasts2', category: 'packs', short: '+12 Sea Beast packs', text: 'Adjacent Areas contain 12 additional packs of Sea Beasts', stack: 'sum', numeric: { min: 12, max: 12, unit: 'count' } },
  { id: 'DeepwaterBorderAdditionalSeaBeasts3', category: 'packs', short: '+16 Sea Beast packs', text: 'Adjacent Areas contain 16 additional packs of Sea Beasts', stack: 'sum', numeric: { min: 16, max: 16, unit: 'count' } },

  // ---------------------------------------------------------------- monster density / difficulty
  { id: 'DeepwaterBorderIncreasedRareMonsters1', category: 'density', short: '50% Rare mobs', text: '50% increased number of Rare Monsters in adjacent Areas', stack: 'sum', numeric: { min: 50, max: 50, unit: '%' } },
  { id: 'DeepwaterBorderIncreasedRareMonsters2', category: 'density', short: '75% Rare mobs', text: '75% increased number of Rare Monsters in adjacent Areas', stack: 'sum', numeric: { min: 75, max: 75, unit: '%' } },
  { id: 'DeepwaterBorderIncreasedRareMonsters3', category: 'density', short: '100% Rare mobs', text: '100% increased number of Rare Monsters in adjacent Areas', stack: 'sum', numeric: { min: 100, max: 100, unit: '%' } },
  { id: 'DeepwaterBorderRareMonstersPerConnection1', category: 'density', short: '50% Rare / połączenie', text: '50% increased number of Rare monsters in adjacent Areas per connection', stack: 'flag' },
  { id: 'DeepwaterBorderRareMonstersPerConnection2', category: 'density', short: '75% Rare / połączenie', text: '75% increased number of Rare monsters in adjacent Areas per connection', stack: 'flag' },
  { id: 'DeepwaterBorderPackSize1', category: 'density', short: '16% Pack Size', text: '16% increased Pack Size in adjacent Areas', stack: 'sum', numeric: { min: 16, max: 16, unit: '%' } },
  { id: 'DeepwaterBorderPackSize2', category: 'density', short: '24% Pack Size', text: '24% increased Pack Size in adjacent Areas', stack: 'sum', numeric: { min: 24, max: 24, unit: '%' } },
  { id: 'DeepwaterBorderPackSize3', category: 'density', short: '32% Pack Size', text: '32% increased Pack Size in adjacent Areas', stack: 'sum', numeric: { min: 32, max: 32, unit: '%' } },
  { id: 'DeepwaterBorderMonstersAtLeastMagic', category: 'density', short: 'Monsters at least Magic', text: 'Monsters in adjacent Areas are at least Magic', stack: 'flag' },
  { id: 'DeepwaterBorderMagicMonsterMods1', category: 'density', short: 'Magic mobs +1 mod', text: 'Magic Monsters in adjacent Areas have an additional modifier', stack: 'flag' },
  {
    id: 'DeepwaterBorderMagicMonsterMods2',
    category: 'density',
    short: 'Magic mobs +mody (T2)',
    // The wiki's Cargo row for this mod has an empty stat_text; only its id is known.
    text: 'Mocniejszy wariant „Magic Monsters in adjacent Areas have an additional modifier" — wiki nie podaje jego treści',
    stack: 'flag',
    incomplete: true,
  },

  // ---------------------------------------------------------------- bosses / encounters
  { id: 'DeepwaterBorderCrabMiniboss', category: 'boss', short: 'Captainsbane', text: 'Adjacent Areas contain Captainsbane', stack: 'flag' },
  { id: 'DeepwaterBorderGiantOctopus', category: 'boss', short: 'Filthscrabble', text: 'Adjacent Areas contain Filthscrabble', stack: 'flag' },
  { id: 'DeepwaterBorderPiratePack', category: 'boss', short: 'Brinerot raiding party', text: 'Adjacent Areas contain a Brinerot raiding party', stack: 'flag' },

  // ---------------------------------------------------------------- currency
  { id: 'DeepwaterBorderMoreCurrency1', category: 'currency', short: '50% more Currency', text: '50% more Currency found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreCurrency2', category: 'currency', short: '75% more Currency', text: '75% more Currency found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreCurrency3', category: 'currency', short: '100% more Currency', text: '100% more Currency found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreScarabs1', category: 'currency', short: '50% more Scarabs', text: '50% more Scarabs found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreScarabs2', category: 'currency', short: '75% more Scarabs', text: '75% more Scarabs found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreScarabs3', category: 'currency', short: '100% more Scarabs', text: '100% more Scarabs found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderCurrencyToStackedDecks', category: 'currency', short: 'Currency to Stacked Decks', text: 'Basic Currency items dropped by Monsters in adjacent Areas will instead drop as Stacked Decks', stack: 'flag' },
  { id: 'DeepwaterBorderEquipmentToGold1', category: 'currency', short: '25% gear to Gold', text: '25% of Equipment dropped by monsters in adjacent Areas is converted to Gold', stack: 'flag' },
  { id: 'DeepwaterBorderEquipmentToGold2', category: 'currency', short: '50% gear to Gold', text: '50% of Equipment dropped by monsters in adjacent Areas is converted to Gold', stack: 'flag' },
  { id: 'DeepwaterBorderSulphurDrops', category: 'currency', short: 'Rares: Sulphur', text: "Rare Monsters in adjacent Areas drop Dead Man's Sulphur", stack: 'flag' },

  // ---------------------------------------------------------------- currency from rare monsters
  { id: 'DeepwaterBorderRareMonsterAncient', category: 'currency', short: 'Rares: +1 Ancient Orb', text: 'Rare Monsters in adjacent Areas drop an additional Ancient Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterAnnulment', category: 'currency', short: 'Rares: +1 Annulment', text: 'Rare Monsters in adjacent Areas drop an additional Orb of Annulment', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterBlessed', category: 'currency', short: 'Rares: +1 Blessed Orb', text: 'Rare Monsters in adjacent Areas drop an additional Blessed Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterChaos', category: 'currency', short: 'Rares: +1 Chaos Orb', text: 'Rare Monsters in adjacent Areas drop an additional Chaos Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterChromatic', category: 'currency', short: 'Rares: +1 Chromatic', text: 'Rare Monsters in adjacent Areas drop an additional Chromatic Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterDivine', category: 'currency', short: 'Rares: +1 Divine Orb', text: 'Rare Monsters in adjacent Areas drop an additional Divine Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterExalted', category: 'currency', short: 'Rares: +1 Exalted Orb', text: 'Rare Monsters in adjacent Areas drop an additional Exalted Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterGemcutters', category: 'currency', short: "Rares: +1 Gemcutter's", text: "Rare Monsters in adjacent Areas drop an additional Gemcutter's Prism", stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterRegal', category: 'currency', short: 'Rares: +1 Regal Orb', text: 'Rare Monsters in adjacent Areas drop an additional Regal Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterRegret', category: 'currency', short: 'Rares: +1 Regret', text: 'Rare Monsters in adjacent Areas drop an additional Orb of Regret', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterScarab', category: 'currency', short: 'Rares: +1 Scarab', text: 'Rare Monsters in adjacent Areas drop an additional Scarab', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },
  { id: 'DeepwaterBorderRareMonsterVaal', category: 'currency', short: 'Rares: +1 Vaal Orb', text: 'Rare Monsters in adjacent Areas drop an additional Vaal Orb', stack: 'sum', numeric: { min: 1, max: 1, unit: 'count' } },

  // ---------------------------------------------------------------- loot
  { id: 'DeepwaterBorderMoreRarity1', category: 'loot', short: '50% more Rarity', text: '50% more Rarity of Items found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreRarity2', category: 'loot', short: '75% more Rarity', text: '75% more Rarity of Items found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderMoreRarity3', category: 'loot', short: '100% more Rarity', text: '100% more Rarity of Items found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderQuantityPerConnection1', category: 'loot', short: '120% Quant, -50%/poł.', text: '50% reduced quantity of items found in adjacent Areas per connection\n120% increased Quantity of Items found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderQuantityPerConnection2', category: 'loot', short: '180% Quant, -50%/poł.', text: '50% reduced quantity of items found in adjacent Areas per connection\n180% increased Quantity of Items found in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderRareMonsterSupport', category: 'loot', short: 'Rares: 20% Support Gem', text: 'Rare Monsters in adjacent Areas have 20% chance to drop a Support Gem', stack: 'flag' },

  // ---------------------------------------------------------------- chart / area effects
  { id: 'DeepwaterBorderChartEffect1', category: 'chart', short: '40% explicit magnitude', text: 'Adjacent Areas have 40% increased explicit modifier magnitudes', stack: 'sum', numeric: { min: 40, max: 40, unit: '%' } },
  { id: 'DeepwaterBorderChartEffect2', category: 'chart', short: '60% explicit magnitude', text: 'Adjacent Areas have 60% increased explicit modifier magnitudes', stack: 'sum', numeric: { min: 60, max: 60, unit: '%' } },
  { id: 'DeepwaterBorderChartEffect3', category: 'chart', short: '80% explicit magnitude', text: 'Adjacent Areas have 80% increased explicit modifier magnitudes', stack: 'sum', numeric: { min: 80, max: 80, unit: '%' } },
  { id: 'DeepwaterBorderChanceToNotConsumeChart1', category: 'chart', short: '30% chart nie znika', text: 'Adjacent Charts have 30% chance to not be consumed when beginning a Voyage', stack: 'flag' },
  { id: 'DeepwaterBorderChanceToNotConsumeChart2', category: 'chart', short: '50% chart nie znika', text: 'Adjacent Charts have 50% chance to not be consumed when beginning a Voyage', stack: 'flag' },

  // ---------------------------------------------------------------- misc
  { id: 'DeepwaterBorderExpGain1', category: 'misc', short: '100% Experience', text: 'Players in adjacent Areas gain 100% increased Experience', stack: 'sum', numeric: { min: 100, max: 100, unit: '%' } },
  { id: 'DeepwaterBorderExpGain2', category: 'misc', short: '150% Experience', text: 'Players in adjacent Areas gain 150% increased Experience', stack: 'sum', numeric: { min: 150, max: 150, unit: '%' } },
  { id: 'DeepwaterBorderExpGain3', category: 'misc', short: '200% Experience', text: 'Players in adjacent Areas gain 200% increased Experience', stack: 'sum', numeric: { min: 200, max: 200, unit: '%' } },
  { id: 'DeepwaterBorderGoldenLanterns', category: 'misc', short: '+4 Golden Lantern', text: 'Adjacent Areas contain 4 additional Golden Lanterns', stack: 'sum', numeric: { min: 4, max: 4, unit: 'count' } },
  { id: 'DeepwaterBorderInfiniteLanterns', category: 'misc', short: 'Free Lanterns', text: 'Placing Lanterns does not reduce your Lantern count in adjacent Areas', stack: 'flag' },
  { id: 'DeepwaterBorderIzaroObject', category: 'misc', short: '+2 Altars', text: 'Adjacent Areas contain 2 Altars to the Goddess', stack: 'sum', numeric: { min: 2, max: 2, unit: 'count' } },
  { id: 'DeepwaterBorderRandomDucatChest', category: 'misc', short: "Pirate's Locker", text: "Adjacent Areas contain a lost Pirate's Locker", stack: 'flag' },
  { id: 'DeepwaterBorderTreasureAnchors1', category: 'misc', short: '+2 Treasure Anchor', text: 'Adjacent Areas contain 2 additional Treasure Anchors', stack: 'sum', numeric: { min: 2, max: 2, unit: 'count' } },
  { id: 'DeepwaterBorderTreasureAnchors2', category: 'misc', short: '+4 Treasure Anchor', text: 'Adjacent Areas contain 4 additional Treasure Anchors', stack: 'sum', numeric: { min: 4, max: 4, unit: 'count' } },

  // Deliberately omitted: DeepwaterBorderTreasureAnchorsHardMode. It is the Hard Mode variant of
  // TreasureAnchors1 with byte-identical text, so listing it would give two indistinguishable
  // options in the picker.
].map((m) => ({ ...m, scope: 'border' }));
