# Voyage Planner

Planer **Voyage Board** z ligi *Curse of the Allflame* (Path of Exile 3.29).
Układasz 9 chartów na siatce 3×3, przypisujesz im implicity, ustawiasz border mody z obrzeża
i od razu widzisz, co działa na które pole.

**➡️ [Otwórz narzędzie](https://draqdras.github.io/poe-voyage-planner/)**

---

## Co potrafi

- **Siatka 3×3 z kształtami chartów** — ślepy zaułek, prosta, zakręt, trójnóg, skrzyżowanie.
  Wszystkie 15 orientacji do wyboru z listy, albo obrót o 90° prawym przyciskiem myszy.
- **Walidacja połączeń** — zielone znaczniki na krawędziach, gdzie ścieżki się łączą, czerwone tam,
  gdzie jedna strona jest otwarta, a druga to ściana. Voyage nie wystartuje z zerwanym połączeniem.
- **62 implicity chartów** (43 adjacent + 19 voyage) z wiki, z wyszukiwarką i grupowaniem po kategorii.
  Przeciągasz mod na chart albo klikasz mod → klikasz pole.
- **Podświetlanie zasięgu** — mod adjacent zieleni czterech sąsiadów, mod voyage całą planszę.
- **13 border modów** na 12 slotach obrzeża — w grze są losowe, tutaj wybierasz te, które Ci wypadły.
- **Podsumowanie** — macierz „kto na kogo wpływa" z kolorami chartów + tabela szczegółowa
  z rozbiciem na własny implicit / sąsiadów / obrzeże, ze zliczaniem stacków (`×2`, `×4-8`).
- **Area level Voyage** liczony wg wiki: `średnia + 10`, obcięte do najwyższego użytego poziomu.
- **Zapis i odczyt JSON** — plik z layoutem do odtworzenia później; autosave w przeglądarce
  między sesjami; upuszczenie `.json` na stronę też go wczytuje.

## Skróty klawiszowe

| Klawisz | Działanie |
|---|---|
| klik na puste pole | wybór kształtu chartu |
| `PPM` / `Shift`+`PPM` | obrót o 90° w prawo / w lewo |
| `R` / `Shift`+`R` | to samo z klawiatury |
| `1`–`5` | wstaw kształt (ślepy zaułek → skrzyżowanie) |
| `Delete` | usuń chart z pola |
| strzałki | nawigacja po polach |
| `Esc` | anuluj wybrany mod / zamknij okno |

## Uruchomienie lokalnie

Aplikacja nie ma build stepu — to czysty HTML/CSS/JS na modułach ES. Modułów nie da się jednak
załadować przez `file://`, więc potrzebny jest dowolny serwer statyczny:

```bash
node tools/serve.mjs
```

Potem <http://localhost:4173>.

Testy (bez żadnych zależności, wbudowany runner Node ≥18):

```bash
npm test
```

## Struktura

```
index.html          shell aplikacji
css/                theme / board / panels
js/core/            czysta logika, zero DOM — tu celują testy
  shapes.js         maski krawędzi, rotacja, klasyfikacja kształtów
  board.js          siatka 3x3, sąsiedztwo, 12 krawędzi wewnętrznych
  borders.js        12 slotów obrzeża i ich mapowanie na pola
  validate.js       walidacja połączeń
  resolve.js        agregacja: co działa na którym polu
  level.js          area level Voyage
  serialize.js      zapis/odczyt/migracja JSON
js/ui/              widoki (board, panele, podsumowanie, picker, I/O)
data/               modyfikatory z wiki jako moduły ES
test/               67 testów jednostkowych
research/           surowy dump z poewiki (źródło dla data/)
```

### Dlaczego kształt to jedna liczba

Chart ma otwarcie na zerowej lub większej liczbie z czterech krawędzi — i to jest cała jego
geometria. Pięć kształtów z gry to po prostu niepuste podzbiory `{N,E,S,W}`, czyli 15 orientacji,
czyli 4 bity. Kształt i rotację **wyliczamy** z maski zamiast trzymać obok niej, a obrót o 90°
to rotacja bitów. Dzięki temu nie da się doprowadzić stanu do „rotacji niezgodnej z kształtem".

## Format zapisu

```jsonc
{
  "schemaVersion": 1,
  "app": "poe-voyage-planner",
  "savedAt": "2026-07-30T18:20:00.000Z",
  "name": "Strongbox farm",
  "settings": { "adjacency": "orthogonal", "openEdgesAllowed": true },
  "cells": [
    { "i": 0, "mask": 6, "label": "Lost Ruins", "areaLevel": 83,
      "implicit": "MapDeepwaterChartAdjacentStrongboxes2" }
  ],
  "borders": [ { "slot": "N-0", "modId": "border_currency" } ]
}
```

Zapisywane są **tylko identyfikatory modów**, nie ich treść — dzięki temu poprawka literówki
w `data/` nie psuje starych plików. Nieznany identyfikator (np. z nowszego patcha) wczytuje się
jako `? id` zamiast wywalać cały plik.

## Niepewności w mechanice

Wiki nie precyzuje trzech rzeczy, więc są one **przełącznikami**, a nie zaszytymi założeniami:

- **Czym jest „adjacent"** — domyślnie czterej ortogonalni sąsiedzi. Przełącznik
  *„tylko połączeni sąsiedzi"* zawęża to do pól faktycznie połączonych otwartym przejściem.
- **Wyjścia ścieżki poza planszę** — domyślnie ostrzeżenie. Przełącznik zmienia je w błąd
  blokujący start.
- **Mapowanie 12 segmentów obrzeża** — wiki mówi „2 per corner, 1 per middle edge", co czytamy
  jako 3 segmenty na bok planszy, każdy przy jednym polu (narożniki łapią po 2, krawędzie po 1,
  środek 0). Zgadza się z liczbą segmentów widocznych w grze.

Jeśli któreś z tych założeń rozjedzie się z grą — [zgłoś issue](https://github.com/DraqDras/poe-voyage-planner/issues).

## Dane

Wszystkie modyfikatory pochodzą z [poewiki.net](https://www.poewiki.net/wiki/Voyage)
([Voyage](https://www.poewiki.net/wiki/Voyage), [List of chart mods](https://www.poewiki.net/wiki/List_of_chart_mods)),
stan na 3.29. Surowy dump leży w [`research/poewiki-dump.md`](research/poewiki-dump.md) — wiki stoi
za ochroną przed botami, więc dane są commitowane statycznie i nie są pobierane w runtime.

Zakres jest ograniczony do **implicitów**; explicity chartów (prefiksy/sufiksy) są poza zakresem.

## Licencja

MIT — patrz [LICENSE](LICENSE).

Narzędzie fanowskie, niezwiązane z Grinding Gear Games. Path of Exile jest znakiem towarowym GGG.
