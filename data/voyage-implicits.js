/**
 * Voyage implicit modifiers (19).
 * Source: https://www.poewiki.net/wiki/List_of_chart_mods#Voyage_implicit_modifiers
 * Raw dump: research/poewiki-dump.md
 *
 * scope: "voyage" -> applies to every area of the Voyage, regardless of position.
 *
 * `textWiki` is kept verbatim (the wiki - and probably the game - spells it "Qauntity");
 * `text` is the cleaned-up string used in the UI.
 */
export const VOYAGE_IMPLICITS = [
  { id: 'MapDeepwaterChartVoyageFlaskQuality', ilvl: 68, weight: 100, category: 'quality', short: '20% Q Flasks', text: 'Flasks found in all Voyage Areas have 100% chance to have 20% Quality', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageFriendlyJelly', ilvl: 1, weight: 1000, category: 'misc', short: 'Friendly Jellyfish', text: 'All Voyage Areas contain Friendly Jellyfish', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageIncreasedMagicMonsters', ilvl: 46, weight: 700, category: 'density', short: '25% Magic mobs', text: '25% increased number of Magic Monsters in all Voyage Areas', stack: 'sum', numeric: { min: 25, max: 25, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageIncreasedRareMonsters', ilvl: 46, weight: 700, category: 'density', short: '25% Rare mobs', text: '25% increased number of Rare Monsters in all Voyage Areas', stack: 'sum', numeric: { min: 25, max: 25, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageMinimumMagicMonsters', ilvl: 68, weight: 50, category: 'density', short: 'Monsters at least Magic', text: 'Monsters in all Voyage Areas are at least Magic', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageMonstersEssenced', ilvl: 68, weight: 50, category: 'essence', short: 'Natives Essenced', text: 'Rare monsters that are natural inhabitants of all Voyage Areas are imprisoned by Essences', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageMonstersPossessed', ilvl: 46, weight: 50, category: 'density', short: 'Rares Possessed', text: '100% chance for Rare Monsters in all Voyage Areas to be Possessed', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageNoEquipmentDrops', ilvl: 68, weight: 10, category: 'loot', short: 'No Equipment drops', text: 'Monsters in all Voyage Areas cannot drop Equipment, Flasks or Tinctures', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyagePackSize1', ilvl: 1, weight: 750, category: 'density', short: '5% Pack Size', text: '5% increased Pack Size in all Voyage Areas', stack: 'sum', numeric: { min: 5, max: 5, unit: '%' } },
  { id: 'MapDeepwaterChartVoyagePackSize2', ilvl: 68, weight: 500, category: 'density', short: '7% Pack Size', text: '7% increased Pack Size in all Voyage Areas', stack: 'sum', numeric: { min: 7, max: 7, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageQuantity1', ilvl: 1, weight: 750, category: 'loot', short: '8% Quantity', text: '8% increased Quantity of Items found in all Voyage Areas', textWiki: '8% increased Qauntity of Items found in all Voyage Areas', stack: 'sum', numeric: { min: 8, max: 8, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageQuantity2', ilvl: 68, weight: 500, category: 'loot', short: '10% Quantity', text: '10% increased Quantity of Items found in all Voyage Areas', textWiki: '10% increased Qauntity of Items found in all Voyage Areas', stack: 'sum', numeric: { min: 10, max: 10, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageRareFracture', ilvl: 68, weight: 50, category: 'loot', short: '50% Rare Fracture', text: 'Rare Monsters in all Voyage Areas have 50% chance to Fracture on death', stack: 'flag' },
  { id: 'MapDeepwaterChartVoyageRarity1', ilvl: 1, weight: 750, category: 'loot', short: '7% Rarity', text: '7% increased Rarity of Items found in all Voyage Areas', stack: 'sum', numeric: { min: 7, max: 7, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageRarity2', ilvl: 68, weight: 500, category: 'loot', short: '9% Rarity', text: '9% increased Rarity of Items found in all Voyage Areas', stack: 'sum', numeric: { min: 9, max: 9, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageResourceFound1', ilvl: 1, weight: 750, category: 'currency', short: '15% Sulphur', text: "15% increased Dead Man's Sulphur found in all Voyage Areas", stack: 'sum', numeric: { min: 15, max: 15, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageResourceFound2', ilvl: 46, weight: 500, category: 'currency', short: '20% Sulphur', text: "20% increased Dead Man's Sulphur found in all Voyage Areas", stack: 'sum', numeric: { min: 20, max: 20, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageResourceFound3', ilvl: 68, weight: 300, category: 'currency', short: '25% Sulphur', text: "25% increased Dead Man's Sulphur found in all Voyage Areas", stack: 'sum', numeric: { min: 25, max: 25, unit: '%' } },
  { id: 'MapDeepwaterChartVoyageSoulEater', ilvl: 1, weight: 400, category: 'misc', short: 'Soul Eater', text: 'Players in all Voyage Areas have Soul Eater', stack: 'flag' },
].map((m) => ({ ...m, scope: 'voyage' }));
