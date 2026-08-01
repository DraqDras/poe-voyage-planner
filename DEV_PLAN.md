# Voyage Planner — dev plan

Narzędzie webowe do planowania Voyage Board z ligi **Curse of the Allflame** (PoE 1, 3.29).
Publikowane jako publiczne repo + GitHub Pages.

- Robocza nazwa repo: `poe-voyage-planner`
- Katalog roboczy: `C:\Users\draq1\My_PROJECTS\VoyagePlanner`
- Dane źródłowe: [research/poewiki-dump.md](research/poewiki-dump.md) (43 adjacent implicity,
  19 voyage implicitów, 65 border modów — już pobrane, nie trzeba scrape'ować ponownie)

---

## 0. Status realizacji (2026-07-30)

**MVP zrealizowany i opublikowany.** Fazy 0-9 zamknięte, 67 testów jednostkowych przechodzi.

Odstępstwa od pierwotnego planu, świadome:

| Plan | Realizacja | Dlaczego |
|---|---|---|
| dane w `data/*.json` | `data/*.js` (moduły ES eksportujące tablice) | `fetch()` JSON-a nie działa przez `file://`, a moduły importują się identycznie w przeglądarce i w testach Node — bez asercji importu |
| testy na Vitest | wbudowany `node --test` | zero zależności, brak `node_modules` w repo |
| — | dodane `tools/serve.mjs` | moduły ES wymagają serwera; 40 linii bez zależności zamiast instruowania „zainstaluj serve" |
| autosave w v1.1 | zrobiony w MVP | wyszło na ~20 linii i ratuje planszę po odświeżeniu |

Wciąż w backlogu (Faza 10): share przez URL, eksport PNG, i18n PL/EN, explicity chartów.

### Zmiana po pierwszym feedbacku (2026-07-30, iteracja 2)

**Osobna zakładka „Podsumowanie" usunięta.** Wymagała przełączania widoku, żeby odpowiedzieć na
pytanie, które zadaje się patrząc na planszę. Zamiast tego **każdy kafelek wypisuje wprost
dziedziczone mody** — własny implicit jasną kropką, dziedziczone ciemniejszą (zielona = Adjacent,
żółta = Voyage), ze wskazaniem pola źródłowego. Border mody celowo **nie** trafiają do kafelka:
narożniki łapią po dwa i przy 4-6 dziedziczonych modach kafelek zrobiłby się nieczytelny —
pełna rozpiska z borderami i stackami została w panelu *Area Modifiers*.

Przy okazji usunięte: `js/ui/summaryView.js`, style podsumowania, `glyphOf()` (używany tylko tam),
`ui.view` ze store'a.

### Korekta danych (2026-07-30, iteracja 5)

**Pula border modów liczy 66, nie 13.** Sekcja „List of border modifiers" na stronie Voyage jest
pisana ręcznie i była niekompletna — brakowało m.in. wszystkich orbów na rzadkich potworach,
Pack Size, explicit magnitudes, „chart nie znika", packów the Drowned, Scarabów i minibossów;
podane wartości też się nie zgadzały z grą. Prawdziwe źródło to tabela Cargo `mods`
(`id LIKE "DeepwaterBorder%"`, domain 40) — zapytanie zapisane w `research/poewiki-dump.md`.

Tym samym sposobem potwierdzono, że listy chartów są kompletne (43 + 19), więc poprawka dotyczy
wyłącznie obrzeża. Ponieważ id-ki borderów były nasze własne (`border_*`), doszła migracja
`schemaVersion` 1 → 2 mapująca stare id na prawdziwe. Picker borderów i implicitów dostał
wyszukiwarkę i grupowanie — 65 pozycji w płaskiej liście było nie do przejrzenia.

---

## 1. Zakres (co narzędzie ma robić)

| # | Funkcja | Priorytet |
|---|---|---|
| F1 | Siatka 3x3, wstawianie chartów o 5 kształtach, obrót o 90° (PPM) lub wybór orientacji z listy | MVP |
| F2 | Walidacja połączeń między chartami (czerwony marker na zerwanej krawędzi) | MVP |
| F3 | 12 slotów border, ręczny wybór moda z listy wiki dla każdego slotu | MVP |
| F4 | Panel implicitów po prawej + drag & drop na kafelek w siatce | MVP |
| F5 | Podświetlanie na zielono zasięgu moda (sąsiedzi / całe Voyage) | MVP |
| F6 | Podgląd „co działa na którym polu" | MVP |
| F7 | Zapis / odczyt layoutu do JSON | MVP |
| F8 | Panel "Area Modifiers" (lewa strona, jak w grze) dla zaznaczonego pola | MVP |
| F9 | Autosave w localStorage + share przez URL | v1.1 |
| F10 | Eksport planszy do PNG | v1.1 |
| F11 | PL/EN i18n | v1.1 |
| F12 | Explicity chartów (prefixy/sufiksy) | backlog |

**Poza zakresem:** logowanie, backend, integracja z API GGG, symulacja dropów/EV.
To ma być czyste narzędzie do układania planszy offline.

---

## 2. Model domenowy — kluczowe ustalenia

### 2.1 Kształty chartów = 4-bitowa maska krawędzi

Każdy chart to kwadrat z połączeniami na krawędziach N/E/S/W. Wszystkie 5 kształtów z grafiki
to po prostu podzbiory zbioru `{N,E,S,W}`:

| Kształt | Liczba krawędzi | Rotacje | Maski |
|---|---|---|---|
| `DEAD_END` (ślepy zaułek) | 1 | 4 | `N`, `E`, `S`, `W` |
| `STRAIGHT` (prosta) | 2 przeciwległe | 2 | `NS`, `EW` |
| `CORNER` (zakręt) | 2 sąsiednie | 4 | `NE`, `ES`, `SW`, `WN` |
| `TEE` (trójnóg) | 3 | 4 | `NES`, `ESW`, `SWN`, `WNE` |
| `CROSS` (skrzyżowanie) | 4 | 1 | `NESW` |

**Konsekwencja:** wszystkie 15 możliwych orientacji to po prostu 15 niepustych podzbiorów 4 bitów.
Stan kafelka to jeden `uint8` (`N=1, E=2, S=4, W=8`). Kształt i rotację **wyliczamy** z maski, nie
przechowujemy osobno. Obrót o 90° = `rotl4(mask)`. To eliminuje całą klasę bugów typu
"rotacja niezgodna z kształtem".

To zarazem załatwia oba warianty UI, o które prosiłeś: PPM obraca maskę, a lista orientacji
to wygenerowane 15 pozycji (albo 5 kształtów × dozwolone rotacje).

### 2.2 Walidacja połączeń

W siatce 3x3 jest **12 wewnętrznych krawędzi** (6 pionowych + 6 poziomych).
Krawędź jest **poprawna**, gdy oba przylegające kafelki mają zgodny bit: albo oba otwarte
(połączenie), albo oba zamknięte (ściana). Niezgodność → czerwony marker + blokada "Begin Voyage".

Wiki: *"All placed charts must have valid connections to each other; broken connections will show
a red indicator on the edge of the chart, and prevent beginning the Voyage."*

Krawędzie zewnętrzne (12 sztuk na obrzeżu planszy) — patrz decyzja **D2** niżej.

### 2.3 Border (obrzeże)

Wiki: *"Each of the segments (**2 per corner, 1 per middle edge**)"*. Interpretacja: na każdą
stronę planszy przypadają 3 segmenty (po jednym przy każdej z 3 komórek tej strony), czyli
**12 slotów borderowych**. Mapowanie segment → komórka:

- komórki narożne (0, 2, 6, 8) — dotykają **2 segmentów**
- komórki krawędziowe (1, 3, 5, 7) — dotykają **1 segmentu**
- komórka środkowa (4) — **0 segmentów**

Suma: 4×2 + 4×1 = 12 ✔ — zgadza się z liczbą segmentów widocznych na screenie z gry.

Border mod działa na "adjacent Areas" = tę jedną komórkę, przy której leży segment.
Border mody są w grze losowe (rerollowane za Dead Man's Sulphur), więc w planerze **gracz wybiera
je ręcznie z listy 13** — dokładnie tak, jak prosiłeś, żeby odwzorować to, co wypadło w grze.

### 2.4 Zasięg implicitów

- `scope: "adjacent"` → 4 ortogonalni sąsiedzi kafelka (patrz decyzja **D1**)
- `scope: "voyage"` → wszystkie 9 pól

**Ważne przy parsowaniu:** nie da się wyznaczyć zasięgu z treści moda. `Atziri's Influence`
i `Monsters have a chance to be Empowered by 2000 Wildwood Wisps` są na liście *adjacent*, mimo
że nie zawierają słowa "adjacent". Zasięg bierzemy **wyłącznie z przynależności do listy** w danych.

### 2.5 Area level

`voyageLevel = min(max(areaLevels), floor(avg(areaLevels)) + 10)` — wiki: *"area level equal to
the average area levels of the nine charts used + 10, up to the highest area level used"*.
Do potwierdzenia czy to `floor` czy `round` (D4).

---

## 3. Stack

**Rekomendacja: vanilla HTML + CSS + JS (ES modules), zero build stepu.**

Uzasadnienie:
- `LeagueBingo` w tym samym workspace to dokładnie ten model (jeden `index.html`, deploy = push)
  i działa. Spójność między Twoimi narzędziami.
- GitHub Pages bez CI: wypychasz i strona żyje. Żadnego `dist/`, żadnego `node_modules` w repo.
- Cała logika (maski, walidacja, agregacja modów) to czysta arytmetyka — React nic tu nie kupuje.
- Drag & drop na 9 polach i ~75 modach nie wymaga wirtualnego DOM-u.

Różnica względem LeagueBingo: **nie jeden plik**, tylko podział na moduły ES + dane w JSON.
26 KB monolitu było OK dla bingo; tutaj będzie ~3-4× więcej kodu i musi być testowalne.

Alternatywa, jeśli wolisz: Vite + React + TypeScript. Daje typy dla schematu JSON i wygodniejszy
stan, kosztem build stepu i workflow GitHub Actions do deployu. Powiedz, jeśli mam przełączyć plan.

Testy: **Vitest** (albo `node --test`) na warstwie `core/` — bez DOM-u, czysta logika.
Jedyna zależność dev. Reszta: zero runtime dependencies.

---

## 4. Struktura repo

```
poe-voyage-planner/
├─ index.html                  # shell aplikacji
├─ css/
│  ├─ theme.css                # zmienne, paleta PoE/Allflame (na wzór LeagueBingo)
│  ├─ board.css                # siatka, kafelki, markery połączeń
│  └─ panels.css               # panel modów, area modifiers, summary
├─ js/
│  ├─ core/                    # czysta logika, zero DOM — tu jadą testy
│  │  ├─ shapes.js             # maski krawędzi, rotacja, nazwy kształtów
│  │  ├─ board.js              # model planszy 3x3, komórki, indeksy, sąsiedztwo
│  │  ├─ borders.js            # 12 slotów, mapowanie segment ↔ komórka
│  │  ├─ validate.js           # walidacja 12 krawędzi wewnętrznych
│  │  ├─ resolve.js            # agregacja: co działa na którym polu
│  │  ├─ level.js              # wyliczanie area level Voyage
│  │  └─ serialize.js          # zapis/odczyt/migracja JSON
│  ├─ ui/
│  │  ├─ boardView.js          # render siatki (SVG kafelki), PPM = obrót
│  │  ├─ modPanel.js           # lista implicitów + szukajka + drag source
│  │  ├─ borderPanel.js        # edytor 12 slotów borderowych
│  │  ├─ areaPanel.js          # lewy panel "Area Modifiers" dla zaznaczonego pola
│  │  ├─ summaryView.js        # tabela / macierz podsumowania
│  │  ├─ dnd.js                # drag & drop + highlight zasięgu
│  │  └─ ioControls.js         # zapisz/wczytaj JSON, clear board
│  ├─ state.js                 # pojedynczy store + subskrypcje (pub/sub, ~50 linii)
│  └─ main.js                  # bootstrap
├─ data/
│  ├─ adjacent-implicits.json  # 43 pozycje
│  ├─ voyage-implicits.json    # 19 pozycji
│  ├─ border-mods.json         # 13 pozycji
│  └─ shapes.json              # metadane kształtów + ikony SVG
├─ test/
│  ├─ shapes.test.js
│  ├─ validate.test.js
│  ├─ resolve.test.js
│  └─ serialize.test.js
├─ research/
│  └─ poewiki-dump.md          # ← już gotowe
├─ README.md
├─ LICENSE                     # MIT
└─ .github/workflows/test.yml  # vitest na PR
```

---

## 5. Schemat JSON zapisu

```jsonc
{
  "schemaVersion": 1,
  "app": "poe-voyage-planner",
  "savedAt": "2026-07-30T18:20:00.000Z",
  "name": "Strongbox farm",
  "settings": {
    "adjacency": "orthogonal",      // "orthogonal" | "connected"
    "openEdgesAllowed": true        // czy połączenie wychodzące poza planszę jest OK
  },
  "cells": [
    {
      "i": 0,                        // 0..8, wiersz-major (0=lewy górny)
      "mask": 7,                     // bitmask N=1 E=2 S=4 W=8  → tu N+E+S = TEE
      "label": "Lost Ruins",         // opcjonalna nazwa chartu
      "areaLevel": 83,
      "implicit": "MapDeepwaterChartAdjacentStrongboxes2"   // id lub null
    }
    // ... 9 wpisów; puste pole = { "i": n, "mask": 0, "implicit": null }
  ],
  "borders": [
    { "slot": "N-0", "modId": "border_more_currency" },
    { "slot": "N-1", "modId": null }
    // ... 12 slotów: N-0..N-2, E-0..E-2, S-0..S-2, W-0..W-2
  ]
}
```

Zasady:
- `schemaVersion` od pierwszego commita — migracje `serialize.js` przy zmianach.
- Zapisujemy **tylko id modów**, nie ich treść. Teksty żyją w `data/*.json` i mogą być poprawiane
  (wiki ma literówkę "Qauntity") bez psucia starych zapisów.
- Wczytanie nieznanego `modId` → mod pokazany jako "unknown (id)" zamiast wywalenia całego pliku.
- Walidacja przy imporcie: kształt struktury, zakres `mask` 0-15, `i` 0-8 unikalne, dokładnie
  12 slotów border. Błędy → czytelny komunikat, nie stack trace.

---

## 6. UI / layout

Trzy kolumny, na wzór ekranu z gry:

```
┌────────────────┬──────────────────────────┬─────────────────────┐
│ AREA MODIFIERS │      VOYAGE BOARD 3x3    │   IMPLICIT MODS     │
│                │                          │                     │
│ dla zaznaczo-  │  ┌──┬──┬──┐              │ [ szukaj...      ]  │
│ nego pola:     │  │  │  │  │  + 12 slotów │ [Adjacent][Voyage]  │
│ · własny       │  ├──┼──┼──┤    border    │                     │
│ · od sąsiadów  │  │  │  │  │    wokół     │ ▸ Strongboxes (3)   │
│ · od borderów  │  ├──┼──┼──┤              │ ▸ Essence (3)       │
│ · voyage-wide  │  │  │  │  │              │ ▸ Unique items (6)  │
│                │  └──┴──┴──┘              │ ...  (drag źródło)  │
│ area level: 83 │  [Wyczyść] [Zapisz JSON] │                     │
└────────────────┴──────────────────────────┴─────────────────────┘
              [ Plansza | Podsumowanie ]  ← przełącznik widoku
```

**Kafelek** rysowany jako inline SVG: tło + grube linie od środka do otwartych krawędzi
(dokładnie jak na Twojej drugiej grafice). Na krawędziach markery:
zielony = poprawne połączenie, czerwony = zerwane, szary = ściana-ściana.

**Interakcje:**
- LPM na pustym polu → paleta kształtów (5 ikon), wybór wstawia kafelek
- PPM na kafelku → obrót 90° (`mask = rotl4(mask)`), `contextmenu` z `preventDefault`
- Shift+PPM → obrót w drugą stronę
- Klawiatura: strzałki = nawigacja po polach, `R` = obrót, `Delete` = usuń kafelek,
  `1-5` = wstaw kształt (dostępność + szybkość)
- Drag moda z prawego panelu → drop na kafelek; kafelek musi istnieć (drop na puste = odrzucone
  z tooltipem "najpierw postaw chart")
- Alternatywa dla drag&drop (mobile/a11y): klik na mod → klik na pole

**Podświetlanie zasięgu (F5):**
- hover/drag moda `scope: adjacent` → 4 ortogonalni sąsiedzi na zielono
- hover/drag moda `scope: voyage` → wszystkie 9 pól na zielono
- hover na kafelku z już przypisanym implicitem → to samo, dla jego moda
- hover na slocie border → jego jedna komórka na zielono

### 6.1 Widok podsumowania (F6)

Przełącznik u dołu. Dwa komponenty:

**a) Macierz 3x3 "kto na kogo wpływa"** — każdy chart dostaje stały kolor z palety (9 kolorów).
Na każdym polu pasek kropek w kolorach chartów, których mod tam sięga + ikonka globu dla
voyage-wide + ikonka kotwicy dla borderów. Od razu widać, że np. pole środkowe łapie 4 adjacenty.

**b) Tabela szczegółowa** — 9 wierszy:

| Pole | Chart | Kształt | Własny implicit | Od sąsiadów | Od borderów | Voyage-wide |
|---|---|---|---|---|---|---|
| A1 | Lost Ruins (83) | ┳ | +2-4 Strongbox (adj) | +5 Imprisoned, 30% Magic | 100% more Currency | 5% Pack Size, 7% Rarity |

Skróty w komórkach (`+2-4 Strongbox`), pełny tekst w tooltipie. Plus sekcja "Voyage-wide"
zbiorczo nad tabelą, bo to samo dotyczy każdego pola.

**c) Agregacja** — jeśli ten sam mod trafia na pole dwa razy (np. dwa sąsiednie charty mają
`Strongboxes2`), pokazujemy `×2` i sumę tam, gdzie mod jest liczbowy. Sumujemy tylko to, co
bezpiecznie sumowalne (`increased`/`additional`); mody typu `Monsters are at least Magic`
pokazujemy jako flagę.

---

## 7. Plan realizacji — fazy

Szacunki to robocze godziny, nie dni kalendarzowe.

### Faza 0 — setup (~1 h)
- `git init`, repo publiczne na GitHubie, MIT, `.gitignore`
- szkielet katalogów, pusty `index.html`, `theme.css` przeniesiony konceptualnie z LeagueBingo
- GitHub Pages z brancha `main` (root)
- **DoD:** pusta strona działa na `*.github.io`

### Faza 1 — dane (~2 h)
- transkrypcja `research/poewiki-dump.md` → `data/adjacent-implicits.json`,
  `data/voyage-implicits.json`, `data/border-mods.json`
- struktura wpisu:
  ```jsonc
  {
    "id": "MapDeepwaterChartAdjacentStrongboxes2",
    "scope": "adjacent",
    "ilvl": 46,
    "weight": 700,
    "textWiki": "Adjacent Areas contain (2-4) additional Strongboxes",
    "text": "Adjacent Areas contain (2-4) additional Strongboxes",
    "short": "+2-4 Strongbox",
    "category": "strongbox",
    "numeric": { "min": 2, "max": 4, "unit": "count" }
  }
  ```
- `category` do grupowania w panelu: `strongbox`, `essence`, `packs`, `unique`, `currency`,
  `monster-density`, `quality`, `misc`
- `short` — ręcznie, ~75 pozycji, to jest ta nudna część
- border mody dostają własne id (`border_*`), bo wiki nie podaje ich nazw wewnętrznych
- **DoD:** JSON-y walidne, liczności 43/19/13, skrypt `test/data.test.js` sprawdza unikalność id

### Faza 2 — core engine (~4 h)
- `shapes.js`: maski, `rotate(mask, steps)`, `shapeOf(mask)`, `orientationsOf(shape)`
- `board.js`: 9 komórek, `neighbors(i)`, `edgesBetween(i, j)`
- `borders.js`: 12 slotów, `cellOfSlot(slot)`, `slotsOfCell(i)`
- `validate.js`: 12 krawędzi wewnętrznych → lista `{a, b, side, ok}`
- `resolve.js`: `resolve(state) → { perCell: [{ own, fromNeighbors, fromBorders }], voyageWide }`
- `level.js`
- **DoD:** testy jednostkowe zielone, w tym: obrót 4× wraca do oryginału; `CROSS` niezmienny;
  plansza z samych `CROSS` waliduje się w 100%; `STRAIGHT` obok `DEAD_END` łapie konflikt

### Faza 3 — siatka i kafelki (~5 h)
- SVG kafelków generowane z maski (jedna funkcja, nie 15 plików)
- klik → paleta kształtów; PPM → obrót; Delete → usuń
- markery krawędzi zielone/czerwone/szare
- baner "Nie można rozpocząć Voyage: N zerwanych połączeń"
- **DoD:** można ręcznie ułożyć planszę z drugiego obrazka i zobaczyć poprawne/błędne krawędzie

### Faza 4 — panel modów + drag & drop (~5 h)
- lista z `data/*.json`, zakładki Adjacent / Voyage, szukajka po tekście, grupowanie po `category`
- HTML5 drag & drop + fallback klik-klik
- drop → przypisanie implicitu do kafelka (jeden implicit na chart, zgodnie z mechaniką)
- badge z modem na kafelku + `×` do zdjęcia
- **DoD:** mod przeciągnięty na kafelek zostaje po odświeżeniu widoku

### Faza 5 — podświetlanie zasięgu (~2 h)
- klasa `.affected` (zielona poświata) sterowana z `resolve.js`
- reakcja na: hover moda w panelu, przeciąganie, hover kafelka, hover slotu border
- **DoD:** hover moda voyage-wide zieleni całą planszę; adjacent zieleni dokładnie sąsiadów

### Faza 6 — border editor (~3 h)
- 12 klikalnych segmentów wokół planszy (2 na róg, 1 na środek boku)
- klik → dropdown/modal z 13 border modami + "brak"
- ikonka + skrót na segmencie, tooltip z pełnym tekstem
- **DoD:** ustawiony border widoczny w panelu Area Modifiers przypisanej komórki

### Faza 7 — Area Modifiers + podsumowanie (~5 h)
- lewy panel: dla zaznaczonego pola pełna rozpiska (własne / sąsiedzi / border / voyage) + area level
- widok podsumowania: macierz kolorów + tabela + agregacja `×N`
- przełącznik Plansza ⇄ Podsumowanie
- **DoD:** ręcznie zweryfikowany przypadek: 9 chartów, każdy z modem, liczby w tabeli się zgadzają

### Faza 8 — zapis/odczyt JSON (~3 h)
- `Zapisz JSON` → download `voyage-<nazwa>-<data>.json`
- `Wczytaj JSON` → file input + drag&drop pliku na stronę
- walidacja + migracje wersji + czytelne błędy
- autosave do localStorage (F9, przy okazji — to 20 linii)
- **DoD:** round-trip: zapis → clear board → wczytanie → identyczny stan

### Faza 9 — polish i publikacja (~4 h)
- stylizacja pod klimat Allflame (pergamin/morska zieleń, jak na screenie z gry)
- responsywność: na wąskim ekranie kolumny układają się pionowo
- a11y: focus ring, obsługa klawiatury, `aria-label` na kafelkach
- README z opisem, screenem i linkiem do Pages
- **DoD:** narzędzie działa na telefonie, README kompletne, Pages żyje

**Razem MVP: ~34 h.**

### Faza 10 — backlog (po MVP)
- share przez URL (stan → LZ-string → hash) — jeden link zamiast pliku
- eksport planszy do PNG (canvas, jak w LeagueBingo)
- i18n PL/EN (teksty modów zostają po angielsku — tak się o nich mówi w grze)
- explicity chartów (prefixy/sufiksy z `List_of_chart_mods`)
- presety / biblioteka zapisanych layoutów w localStorage
- tryb "co by było gdyby": porównanie dwóch layoutów obok siebie

---

## 8. Decyzje do potwierdzenia

Domyślne odpowiedzi są już w planie — jeśli któraś Ci nie pasuje, powiedz przed Fazą 2, bo dotykają
`core/`.

**D1 — czym jest "adjacent"?** Wiki mówi tylko "adjacent Areas". Dwie interpretacje:
(a) 4 ortogonalni sąsiedzi niezależnie od połączeń, (b) tylko sąsiedzi faktycznie **połączeni**
ścieżką kafelków. Skoro gra i tak wymaga poprawnych połączeń wszędzie, w praktyce różnica jest
niewielka, ale nie zerowa (ściana-ściana to poprawne połączenie, a nie przejście).
→ **Domyślnie (a) ortogonalne**, z przełącznikiem w ustawieniach na (b). Do zweryfikowania w grze.

**D2 — połączenia wychodzące poza planszę.** Czy chart na krawędzi może mieć otwarte połączenie
skierowane na zewnątrz planszy? Na screenie z gry ramka planszy wygląda na "ścianę".
→ **Domyślnie dozwolone** (tylko ostrzeżenie, nie błąd), z przełącznikiem `openEdgesAllowed`.
Jeśli w grze to blokuje Voyage, zmieniamy default na `false` — jedna linijka.

**D3 — mapowanie 12 segmentów border.** "2 per corner, 1 per middle edge" czytam jako 3 segmenty
na bok planszy, każdy przy jednej komórce. Zgadza się z liczbą segmentów na screenie.
→ Jeśli w grze segment narożny wpływa na **dwie** komórki, zmiana jest w `borders.js` i nic więcej.

**D4 — area level.** `avg + 10` zaokrąglane w dół czy do najbliższej? → **Domyślnie `floor`.**

**D5 — stack.** Vanilla ES modules (rekomendacja) vs Vite + React + TS. → patrz sekcja 3.

---

## 9. Ryzyka

| Ryzyko | Wpływ | Mitygacja |
|---|---|---|
| poewiki za Anubisem — WebFetch/curl nie działa | brak automatycznego odświeżania danych | dane commitowane statycznie w `data/`; dump w `research/` |
| Liga jest świeża (3.29), wiki oznaczona jako niekompletna | mody/wartości mogą się zmienić | `schemaVersion` + id-based zapis; aktualizacja = edycja JSON-a |
| Nieznane dokładne reguły adjacency/border | zły wynik podsumowania | D1-D3 jako przełączniki w `settings`, nie hardkod |
| Drag & drop na mobile | funkcja nieużywalna na telefonie | fallback klik-klik od Fazy 4, nie doklejany później |
| ~75 modów do ręcznego skrócenia (`short`) | nudna, podatna na błędy robota | generowane pół-automatycznie + test sprawdzający, że każdy mod ma `short` |

---

## 10. Następny krok

Po akceptacji planu (i ewentualnej korekcie D1-D5) startujemy od **Fazy 0 + 1** — repo, szkielet
i przepisanie dumpu na `data/*.json`. To najbardziej mechaniczna część i odblokowuje całą resztę.
