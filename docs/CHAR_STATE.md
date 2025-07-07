# Char.State

Komunikat dwustronny, Arkadia przesyla informacje o stanie postaci, klient moze ja odpytac.
Komunikat jest automatycznie wysylany przez muda przy logowaniu oraz przy zmianie 
danego stanu postaci. W drugim przypadku dane sa wysylane z minimalnym opoznieniem.
Dane maja postac obiektu JSON i zawieraja parametry:
- `hp` - INTEGER, od 0 do 6, poziom kondycji
- `mana` - INTEGER, od 0 do 8, poziom many
- `fatigue` - INTEGER, od 0 do 8, poziom zmeczenia
- `improve` - INTEGER, od 0 do 14, poziom postepow
- `form` - INTEGER, od 0 do 6, poziom formy
- `intox` - INTEGER, od 0 do 9, poziom upicia
- `headache` - INTEGER, od 0 do 5, poziom kaca
- `stuffed` - INTEGER, od 0 do 2, poziom glodu
- `soaked` - INTEGER, od 0 do 2, poziom pragnienia
- `encumbrance` - INTEGER, od 0 do 5, poziom obciazenia
- `panic` - INTEGER, od 0 do 4, poziom paniki
