# Rozszerzenie Arkadia Web Client

Rozszerzenie przeglądarki, które rozbudowuje klienta webowego [Arkadia](https://arkadia.rpg.pl/) o takie funkcje jak wbudowana mapa, dodatkowe triggery oraz konfigurowalna strona opcji. Projekt jest zorganizowany jako monorepo Yarn workspaces zarządzane przez Lerna.

## Pakiety

| Pakiet      | Opis |
|-------------|---------------------------------------------------------------|
| `extension` | Końcowe zasoby rozszerzenia (manifest, ikony i pliki statyczne). |
| `client`    | Skrypt content script napisany w TypeScript i bundlowany przy użyciu Webpacka. |
| `map`       | Skrypt iframu mapy bundlowany za pomocą Browserify. |
| `options`   | Strona opcji oparta na React zbudowana przy użyciu Vite. |
| `scripts`   | Skrypty pomocnicze do generowania plików danych. |
| `sandbox`   | Lokalna piaskownica do rozwoju (nie jest częścią publikowanego rozszerzenia). |
| `data`      | Przykładowe dane używane przez skrypty pomocnicze. |

## Instalowanie zależności

```bash
yarn install
```

## Budowanie rozszerzenia

Uruchom poniższe polecenie w katalogu głównym repozytorium:

```bash
yarn build
```

Polecenie wywołuje zadania budujące wszystkich przestrzeni roboczych przez Lerna i pakuje katalog `extension` do archiwum o nazwie `arkadia-extension.<timestamp>.zip`.

W trakcie rozwoju możesz automatycznie przebudowywać projekt po zmianach:

```bash
yarn watch
```

Możesz również uruchamiać skrypty pojedynczej przestrzeni roboczej, na przykład:

```bash
yarn workspace client build
```

## Instalacja z wydań

Gotowe archiwa są dostępne na stronie GitHub Releases projektu. Aby załadować wydanie do Chrome w trybie deweloperskim:

1. Pobierz plik `arkadia-extension.zip` z wybranego wydania i rozpakuj go.
2. Otwórz w Chrome stronę `chrome://extensions` i włącz **Tryb dewelopera** za pomocą przełącznika w prawym górnym rogu.
3. Kliknij **Wczytaj rozpakowany** i wskaż rozpakowany katalog `extension`.
4. Możesz też po prostu przeciągnąć pobrane archiwum zip na stronę `chrome://extensions`, a Chrome sam zainstaluje rozszerzenie.

Rozszerzenie pojawi się na liście i będzie można je ponownie wczytać po pobraniu nowszego wydania.

## Uruchamianie piaskownicy

Piaskownica to osobna aplikacja React przydatna do lokalnych testów. Uruchom ją poleceniem:

```bash
cd sandbox
yarn install
yarn dev
```

Następnie otwórz w przeglądarce `http://localhost:5173`, aby wypróbować funkcje bez pakowania rozszerzenia.

## Licencja

MIT
