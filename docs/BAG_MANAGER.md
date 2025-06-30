# Menedżer pojemników

Menedżer pojemników pozwala przypisać wybrane torby, plecaki i inne pojemniki do określonych typów przedmiotów. Dzięki temu możesz szybko odkładać i wyjmować rzeczy z odpowiedniego miejsca.

Ustawienia są zapisywane w pamięci przeglądarki i wczytywane po ponownym uruchomieniu klienta.

## Konfiguracja

1. Wpisz alias `/pojemnik` aby przeszukać ekwipunek i wyświetlić listę znalezionych pojemników.
2. Kliknij nazwę typu przy wybranym pojemniku, aby przypisać go do danego typu lub wybierz `wszystkie`, by używać go dla wszystkich kategorii.
3. Aktualne przypisania możesz sprawdzić poleceniem `/pojemniki`.

## Aliasy

- `/wdp przedmiot[, ...]` – wkłada podane przedmioty do pojemnika typu **other**.
- `/wzp przedmiot[, ...]` – wyjmuje podane przedmioty z pojemnika typu **other**.
- `/wem` (lub `wem`) – wyjmuje monety z pojemnika typu **money**.
- `/wlm` (lub `wlm`) – wkłada monety do pojemnika typu **money**.
- `/wlp` – wkłada pocztową paczkę do ustawionego pojemnika.
- `/wep` – wyjmuje pocztową paczkę z ustawionego pojemnika.
