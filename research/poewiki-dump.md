# Surowy dump z poewiki.net — Voyage / chart mods

Pobrane: 2026-07-30, przez wbudowaną przeglądarkę (WebFetch nie działa — poewiki jest za Anubisem,
zwraca "Access Denied"). Źródła:

- https://www.poewiki.net/wiki/Voyage
- https://www.poewiki.net/wiki/List_of_chart_mods

Ten plik jest źródłem prawdy dla `data/*.json`. Nie kasować — ponowne pobranie wymaga przeglądarki.

---

## Mechanika (cytaty z wiki)

- Voyage Board to siatka **3x3**. 9 ukończonych chartów.
- Każdy segment obrzeża ("**2 per corner, 1 per middle edge**") daje **losowy border modifier**
  działający na przylegające obszary. Rerollowane przy każdym Voyage; ręczny reroll za 3000x
  Dead Man's Sulphur, cena podwaja się przy każdym kolejnym.
- Tutorial Voyage (Maiden Voyage): tylko 4 charty, border modifiers wyłączone.
- Charty mają **określone kształty kafelków**; orientację obraca się **PPM (RMB)**.
- **Wszystkie postawione charty muszą mieć poprawne połączenia**; zerwane połączenie pokazuje
  czerwony wskaźnik na krawędzi chartu i blokuje rozpoczęcie Voyage.
- Poziom obszaru Voyage = średnia area level 9 chartów **+10**, maks. do najwyższego użytego area level.
- Chart, który został wyeksplorowany normalnie (Fathomless Depths), dostaje **implicit**:
  albo **Adjacent Modifier** (działa na wszystkie przylegające obszary), albo
  **Voyage Modifier** (działa na całe Voyage).
- Voyage: jeden portal, jedno podejście. Minimapa w pełni odkryta. Domyślnie maks. 65 Allflame
  Lanterns (25 w tutorialu).

---

## Border modifiers — pełna pula (66), z Cargo

> **Uwaga: sekcja „List of border modifiers" na stronie Voyage jest niekompletna i nieaktualna.**
> Jest pisana ręcznie i wymienia tylko **13** modów, w dodatku z wartościami, których nie ma w grze
> (np. „(12) additional packs of Sea Beasts", podczas gdy w danych są trzy osobne mody 8/12/16).
> Nie generuj z niej `data/border-mods.js`.
>
> Prawdziwe źródło to tabela Cargo `mods`, id `DeepwaterBorder*`, domain 40. Zapytanie
> (uruchamiane z konsoli na dowolnej stronie poewiki, bo Anubis blokuje dostęp z zewnątrz):
>
> ```js
> fetch('/w/api.php?action=cargoquery&tables=mods&fields=' +
>   encodeURIComponent('mods.id=mid,mods.stat_text_raw=raw') +
>   '&where=' + encodeURIComponent('mods.id LIKE "DeepwaterBorder%"') +
>   '&limit=500&order_by=' + encodeURIComponent('mods.id') + '&format=json')
>   .then(r => r.json())
> ```
>
> Tym samym sposobem potwierdzono, że listy chartów są kompletne:
> `MapDeepwaterChartAdjacent%` → 43, `MapDeepwaterChartVoyage%` → 19. Żadna inna pula
> `Deepwater*` (Altar / Hazard / Sword / Tattoo) nie zasila obrzeża.

Stan na 2026-07-30, `id || stat_text_raw`:

```
DeepwaterBorderAdditionalCrabs1              || Adjacent Areas contain 8 additional packs of Crabs
DeepwaterBorderAdditionalCrabs2              || Adjacent Areas contain 12 additional packs of Crabs
DeepwaterBorderAdditionalCrabs3              || Adjacent Areas contain 16 additional packs of Crabs
DeepwaterBorderAdditionalDrowned1            || Adjacent Areas contain 8 additional packs of the Drowned
DeepwaterBorderAdditionalDrowned2            || Adjacent Areas contain 12 additional packs of the Drowned
DeepwaterBorderAdditionalDrowned3            || Adjacent Areas contain 16 additional packs of the Drowned
DeepwaterBorderAdditionalSeaBeasts1          || Adjacent Areas contain 8 additional packs of Sea Beasts
DeepwaterBorderAdditionalSeaBeasts2          || Adjacent Areas contain 12 additional packs of Sea Beasts
DeepwaterBorderAdditionalSeaBeasts3          || Adjacent Areas contain 16 additional packs of Sea Beasts
DeepwaterBorderChanceToNotConsumeChart1      || Adjacent Charts have 30% chance to not be consumed when beginning a Voyage
DeepwaterBorderChanceToNotConsumeChart2      || Adjacent Charts have 50% chance to not be consumed when beginning a Voyage
DeepwaterBorderChartEffect1                  || Adjacent Areas have 40% increased explicit modifier magnitudes
DeepwaterBorderChartEffect2                  || Adjacent Areas have 60% increased explicit modifier magnitudes
DeepwaterBorderChartEffect3                  || Adjacent Areas have 80% increased explicit modifier magnitudes
DeepwaterBorderCrabMiniboss                  || Adjacent Areas contain Captainsbane
DeepwaterBorderCurrencyToStackedDecks        || Basic Currency items dropped by Monsters in adjacent Areas will instead drop as Stacked Decks
DeepwaterBorderEquipmentToGold1              || 25% of Equipment dropped by monsters in adjacent Areas is converted to Gold
DeepwaterBorderEquipmentToGold2              || 50% of Equipment dropped by monsters in adjacent Areas is converted to Gold
DeepwaterBorderExpGain1                      || Players in adjacent Areas gain 100% increased Experience
DeepwaterBorderExpGain2                      || Players in adjacent Areas gain 150% increased Experience
DeepwaterBorderExpGain3                      || Players in adjacent Areas gain 200% increased Experience
DeepwaterBorderGiantOctopus                  || Adjacent Areas contain Filthscrabble
DeepwaterBorderGoldenLanterns                || Adjacent Areas contain 4 additional Golden Lanterns
DeepwaterBorderIncreasedRareMonsters1        || 50% increased number of Rare Monsters in adjacent Areas
DeepwaterBorderIncreasedRareMonsters2        || 75% increased number of Rare Monsters in adjacent Areas
DeepwaterBorderIncreasedRareMonsters3        || 100% increased number of Rare Monsters in adjacent Areas
DeepwaterBorderInfiniteLanterns              || Placing Lanterns does not reduce your Lantern count in adjacent Areas
DeepwaterBorderIzaroObject                   || Adjacent Areas contain 2 Altars to the Goddess
DeepwaterBorderMagicMonsterMods1             || Magic Monsters in adjacent Areas have an additional modifier
DeepwaterBorderMagicMonsterMods2             || (BRAK TREŚCI W WIKI — stat_text jest null)
DeepwaterBorderMonstersAtLeastMagic          || Monsters in adjacent Areas are at least Magic
DeepwaterBorderMoreCurrency1                 || 50% more Currency found in adjacent Areas
DeepwaterBorderMoreCurrency2                 || 75% more Currency found in adjacent Areas
DeepwaterBorderMoreCurrency3                 || 100% more Currency found in adjacent Areas
DeepwaterBorderMoreRarity1                   || 50% more Rarity of Items found in adjacent Areas
DeepwaterBorderMoreRarity2                   || 75% more Rarity of Items found in adjacent Areas
DeepwaterBorderMoreRarity3                   || 100% more Rarity of Items found in adjacent Areas
DeepwaterBorderMoreScarabs1                  || 50% more Scarabs found in adjacent Areas
DeepwaterBorderMoreScarabs2                  || 75% more Scarabs found in adjacent Areas
DeepwaterBorderMoreScarabs3                  || 100% more Scarabs found in adjacent Areas
DeepwaterBorderPackSize1                     || 16% increased Pack Size in adjacent Areas
DeepwaterBorderPackSize2                     || 24% increased Pack Size in adjacent Areas
DeepwaterBorderPackSize3                     || 32% increased Pack Size in adjacent Areas
DeepwaterBorderPiratePack                    || Adjacent Areas contain a Brinerot raiding party
DeepwaterBorderQuantityPerConnection1        || 50% reduced quantity of items found in adjacent Areas per connection
                                             || 120% increased Quantity of Items found in adjacent Areas
DeepwaterBorderQuantityPerConnection2        || 50% reduced quantity of items found in adjacent Areas per connection
                                             || 180% increased Quantity of Items found in adjacent Areas
DeepwaterBorderRandomDucatChest              || Adjacent Areas contain a lost Pirate's Locker
DeepwaterBorderRareMonsterAncient            || Rare Monsters in adjacent Areas drop an additional Ancient Orb
DeepwaterBorderRareMonsterAnnulment          || Rare Monsters in adjacent Areas drop an additional Orb of Annulment
DeepwaterBorderRareMonsterBlessed            || Rare Monsters in adjacent Areas drop an additional Blessed Orb
DeepwaterBorderRareMonsterChaos              || Rare Monsters in adjacent Areas drop an additional Chaos Orb
DeepwaterBorderRareMonsterChromatic          || Rare Monsters in adjacent Areas drop an additional Chromatic Orb
DeepwaterBorderRareMonsterDivine             || Rare Monsters in adjacent Areas drop an additional Divine Orb
DeepwaterBorderRareMonsterExalted            || Rare Monsters in adjacent Areas drop an additional Exalted Orb
DeepwaterBorderRareMonsterGemcutters         || Rare Monsters in adjacent Areas drop an additional Gemcutter's Prism
DeepwaterBorderRareMonsterRegal              || Rare Monsters in adjacent Areas drop an additional Regal Orb
DeepwaterBorderRareMonsterRegret             || Rare Monsters in adjacent Areas drop an additional Orb of Regret
DeepwaterBorderRareMonsterScarab             || Rare Monsters in adjacent Areas drop an additional Scarab
DeepwaterBorderRareMonsterSupport            || Rare Monsters in adjacent Areas have 20% chance to drop a Support Gem
DeepwaterBorderRareMonsterVaal               || Rare Monsters in adjacent Areas drop an additional Vaal Orb
DeepwaterBorderRareMonstersPerConnection1    || 50% increased number of Rare monsters in adjacent Areas per connection
DeepwaterBorderRareMonstersPerConnection2    || 75% increased number of Rare monsters in adjacent Areas per connection
DeepwaterBorderSulphurDrops                  || Rare Monsters in adjacent Areas drop Dead Man's Sulphur
DeepwaterBorderTreasureAnchors1              || Adjacent Areas contain 2 additional Treasure Anchors
DeepwaterBorderTreasureAnchors2              || Adjacent Areas contain 4 additional Treasure Anchors
DeepwaterBorderTreasureAnchorsHardMode       || Adjacent Areas contain 2 additional Treasure Anchors
```

Dwie pozycje nie trafiły do `data/border-mods.js` (stąd 65, nie 66):

- **`DeepwaterBorderTreasureAnchorsHardMode`** — wariant Hard Mode o identycznej treści co
  `TreasureAnchors1`; w liście wyboru dałby dwie nierozróżnialne pozycje.
- **`DeepwaterBorderMagicMonsterMods2`** — jest w `data/`, ale z zastrzeżeniem: wiki ma dla niego
  **pusty `stat_text`**, więc treść jest nieznana. Po sąsiedzie (`...Mods1` = „have an additional
  modifier") to prawie na pewno mocniejszy wariant, ale nie zgadujemy — pozycja jest oznaczona
  `incomplete: true`. **Do uzupełnienia z innego źródła.**

### Czego wiki NIE ma (a pojawia się w grze)

Nic — screenshoty z gry (Sulphur na rzadkich, Chaos Orb, 8 packów Sea Beasts, 30% chance to not
consume, 40% explicit magnitudes, 50% more Currency, quantity per connection, 16% Pack Size)
**wszystkie** znalazły się w powyższej puli. Niekompletna była tylko ręcznie pisana sekcja na
stronie Voyage, nie dane.

### Stara, ręcznie pisana lista z wiki (13) — zachowana dla kontekstu

```
100% more Currency found in adjacent Areas
100% more Rarity of Items found in adjacent Areas
Adjacent Areas contain (12) additional packs of Sea Beasts
Adjacent Areas contain (8) additional packs of Crabs
Adjacent Areas contain (4) additional Golden Lanterns
Adjacent Areas contain (2) Alters to the Goddess
Adjacent Areas contain (2) additional Treasure Anchors
Adjacent Areas contain a lost Pirate's Locker
(75/100)% increased number of Rare Monsters in adjacent Areas
Monsters in adjacent Areas are at least Magic
Placing Lanterns does not reduce your Lantern count in adjacent Areas
Players in adjacent Areas gain 100% increased Experience
Rare Monsters in adjacent Areas drop an additional Exalted Orb
```

---

## Adjacent implicit modifiers (43)

Format: `Name | ilvl | Stat | Spawn weight`

```
MapDeepwaterChartAdjacentArcanistBox1            |  1 | Adjacent Areas contain 2 additional Arcanist's Strongboxes                                  | 300
MapDeepwaterChartAdjacentArcanistBox2            | 68 | Adjacent Areas contain 3 additional Arcanist's Strongboxes                                  | 150
MapDeepwaterChartAdjacentBarrels1                |  1 | Adjacent Areas contain (12-15) additional Clusters of Barrels                                | 700
MapDeepwaterChartAdjacentBarrels2                | 68 | Adjacent Areas contain (16-20) additional Clusters of Barrels                                | 700
MapDeepwaterChartAdjacentCorrupted               | 68 | Atziri's Influence                                                                           | 100
MapDeepwaterChartAdjacentCrabPacks1              |  1 | Adjacent Areas contain (8-10) additional packs of Crabs                                      | 500
MapDeepwaterChartAdjacentCrabPacks2              | 68 | Adjacent Areas contain (11-14) additional packs of Crabs                                     | 500
MapDeepwaterChartAdjacentDivinerBox1             | 46 | Adjacent Areas contain 2 additional Diviner's Strongboxes                                    | 200
MapDeepwaterChartAdjacentDivinerBox2             | 68 | Adjacent Areas contain 3 additional Diviner's Strongboxes                                    | 100
MapDeepwaterChartAdjacentEssence1                |  1 | Adjacent Areas contain (1-2) additional Imprisoned Monsters                                  | 1000
MapDeepwaterChartAdjacentEssence2                | 46 | Adjacent Areas contain (2-4) additional Imprisoned Monsters                                  | 700
MapDeepwaterChartAdjacentEssence3                | 68 | Adjacent Areas contain 5 additional Imprisoned Monsters                                      | 100
MapDeepwaterChartAdjacentFish                    | 68 | Adjacent Areas contain highly prized and exotic Fish                                         | 1
MapDeepwaterChartAdjacentFractured               | 68 | Items dropped in adjacent Areas have 2% chance to be Fractured                               | 100
MapDeepwaterChartAdjacentGoldConvert1            |  1 | 40% of Equipment dropped by monsters in adjacent Areas is converted to Gold                  | 300
MapDeepwaterChartAdjacentGoldConvert2            | 46 | 80% of Equipment dropped by monsters in adjacent Areas is converted to Gold                  | 100
MapDeepwaterChartAdjacentGoldenLanterns          |  1 | Adjacent Areas contain 4 additional Golden Lanterns                                          | 500
MapDeepwaterChartAdjacentIncreasedMagicMonsters1 | 46 | 30% increased number of Magic Monsters in adjacent Areas                                     | 1000
MapDeepwaterChartAdjacentIncreasedMagicMonsters2 | 68 | 60% increased number of Magic Monsters in adjacent Areas                                     | 300
MapDeepwaterChartAdjacentIncreasedRareMonsters1  | 46 | 30% increased number of Rare Monsters in adjacent Areas                                      | 1000
MapDeepwaterChartAdjacentIncreasedRareMonsters2  | 68 | 60% increased number of Rare Monsters in adjacent Areas                                      | 300
MapDeepwaterChartAdjacentLostMessage1            | 68 | Adjacent Areas contain an additional Message in a Bottle                                     | 100
MapDeepwaterChartAdjacentLostMessage2            | 68 | Adjacent Areas contain 2 additional Messages in Bottles                                      | 50
MapDeepwaterChartAdjacentOctopusPacks1           |  1 | Adjacent Areas contains (8-10) additional packs of Octopi                                    | 500
MapDeepwaterChartAdjacentOctopusPacks2           | 68 | Adjacent Areas contains (11-14) additional packs of Octopi                                   | 500
MapDeepwaterChartAdjacentOperativeBox1           | 68 | Adjacent Areas contain 2 additional Operative's Strongboxes                                  | 300
MapDeepwaterChartAdjacentOperativeBox2           | 78 | Adjacent Areas contain 3 additional Operative's Strongboxes                                  | 150
MapDeepwaterChartAdjacentPantheon                | 68 | Rare Monsters in adjacent Areas will have a Pantheon Modifier                                | 300
MapDeepwaterChartAdjacentStarfish1               | 46 | Adjacent Areas contains (4-5) additional Giant Starfish                                      | 500
MapDeepwaterChartAdjacentStarfish2               | 68 | Adjacent Areas contains (6-7) additional Giant Starfish                                      | 300
MapDeepwaterChartAdjacentStrongboxes1            |  1 | Adjacent Areas contains an additional Strongbox                                              | 1000
MapDeepwaterChartAdjacentStrongboxes2            | 46 | Adjacent Areas contain (2-4) additional Strongboxes                                          | 700
MapDeepwaterChartAdjacentStrongboxes3            | 68 | Adjacent Areas contain 5 additional Strongboxes                                              | 100
MapDeepwaterChartAdjacentTormentCages1           | 46 | Adjacent Areas contain an additional cage of Tormented Spirits                               | 700
MapDeepwaterChartAdjacentTormentCages2           | 68 | Adjacent Areas contain 2 additional cages of Tormented Spirits                               | 350
MapDeepwaterChartAdjacentUniqueAmulet1           |  1 | Amulets dropped in adjacent Areas have 10% chance to instead drop as a Unique Amulet         | 300
MapDeepwaterChartAdjacentUniqueAmulet2           | 47 | Amulets dropped in adjacent Areas have 20% chance to instead drop as a Unique Amulet         | 150
MapDeepwaterChartAdjacentUniqueBelt1             |  1 | Belts dropped in adjacent Areas have 10% chance to instead drop as a Unique Belt             | 300
MapDeepwaterChartAdjacentUniqueBelt2             | 47 | Belts dropped in adjacent Areas have 20% chance to instead drop as a Unique Belt             | 150
MapDeepwaterChartAdjacentUniqueRing1             |  1 | Rings dropped in adjacent Areas have 10% chance to instead drop as a Unique Ring             | 300
MapDeepwaterChartAdjacentUniqueRing2             | 47 | Rings dropped in adjacent Areas have 20% chance to instead drop as a Unique Ring             | 150
MapDeepwaterChartAdjacentWisps1                  | 68 | Monsters have a chance to be Empowered by 2000 Wildwood Wisps                                | 300
MapDeepwaterChartAdjacentWisps2                  | 68 | Monsters have a chance to be Empowered by 4000 Wildwood Wisps                                | 150
```

Uwagi:
- `MapDeepwaterChartAdjacentCorrupted` ma stat "Atziri's Influence" — brak słowa "adjacent" w treści,
  ale należy do listy adjacent. Tak samo `...Wisps1/2` ("Monsters have a chance to be Empowered by
  N Wildwood Wisps"). Przy parsowaniu zakresu działania **nie polegać na treści tekstu**, tylko na
  przynależności do listy.

---

## Voyage implicit modifiers (19)

```
MapDeepwaterChartVoyageFlaskQuality            | 68 | Flasks found in all Voyage Areas have 100% chance to have 20% Quality                        | 100
MapDeepwaterChartVoyageFriendlyJelly           |  1 | All Voyage Areas contain Friendly Jellyfish                                                  | 1000
MapDeepwaterChartVoyageIncreasedMagicMonsters  | 46 | 25% increased number of Magic Monsters in all Voyage Areas                                   | 700
MapDeepwaterChartVoyageIncreasedRareMonsters   | 46 | 25% increased number of Rare Monsters in all Voyage Areas                                    | 700
MapDeepwaterChartVoyageMinimumMagicMonsters    | 68 | Monsters in all Voyage Areas are at least Magic                                              | 50
MapDeepwaterChartVoyageMonstersEssenced        | 68 | Rare monsters that are natural inhabitants of all Voyage Areas are imprisoned by Essences    | 50
MapDeepwaterChartVoyageMonstersPossessed       | 46 | 100% chance for Rare Monsters in all Voyage Areas to be Possessed                            | 50
MapDeepwaterChartVoyageNoEquipmentDrops        | 68 | Monsters in all Voyage Areas cannot drop Equipment, Flasks or Tinctures                      | 10
MapDeepwaterChartVoyagePackSize1               |  1 | 5% increased Pack Size in all Voyage Areas                                                   | 750
MapDeepwaterChartVoyagePackSize2               | 68 | 7% increased Pack Size in all Voyage Areas                                                   | 500
MapDeepwaterChartVoyageQuantity1               |  1 | 8% increased Qauntity of Items found in all Voyage Areas                                     | 750
MapDeepwaterChartVoyageQuantity2               | 68 | 10% increased Qauntity of Items found in all Voyage Areas                                    | 500
MapDeepwaterChartVoyageRareFracture            | 68 | Rare Monsters in all Voyage Areas have 50% chance to Fracture on death                       | 50
MapDeepwaterChartVoyageRarity1                 |  1 | 7% increased Rarity of Items found in all Voyage Areas                                       | 750
MapDeepwaterChartVoyageRarity2                 | 68 | 9% increased Rarity of Items found in all Voyage Areas                                       | 500
MapDeepwaterChartVoyageResourceFound1          |  1 | 15% increased Dead Man's Sulphur found in all Voyage Areas                                   | 750
MapDeepwaterChartVoyageResourceFound2          | 46 | 20% increased Dead Man's Sulphur found in all Voyage Areas                                   | 500
MapDeepwaterChartVoyageResourceFound3          | 68 | 25% increased Dead Man's Sulphur found in all Voyage Areas                                   | 300
MapDeepwaterChartVoyageSoulEater               |  1 | Players in all Voyage Areas have Soul Eater                                                  | 400
```

Uwaga: "Qauntity" to literówka **w źródle na wiki** (prawdopodobnie też w grze). W `data/*.json`
trzymamy `textWiki` 1:1 z wiki + `text` z poprawioną pisownią do wyświetlania.

---

## Explicit modifiers (NIE w zakresie MVP)

Strona `List_of_chart_mods` ma też sekcję "Explicit modifiers" (prefixy/suffixy typu Profane,
Freezing, Savage, Fecund, Armoured, Resistant, Oppressive, Buffered, Fleet, Splitting, Hexproof,
Hexwarded, Impervious, Unstoppable, Unwavering, Chaining, Burning, Shocking...). Użytkownik
wyraźnie zaznaczył, że interesują nas **tylko implicity**. Explicity → backlog (Faza 10).
