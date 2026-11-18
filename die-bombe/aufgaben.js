// Jeder nennt reihum etwas Passendes – nichts darf doppelt genannt werden
const NENNE = [
"ein Tier","eine Automarke","ein Land","eine Hauptstadt","eine Stadt in Deutschland","ein Obst","ein Gemüse","eine Pizzasorte","ein Getränk","eine Süßigkeit",
"eine Sportart","einen Fußballverein","einen Fußballspieler","einen Rapper","einen Sänger oder eine Sängerin","eine Band","einen Film","eine Serie","eine Disney-Figur","einen Superhelden",
"einen Beruf","ein Werkzeug","ein Möbelstück","etwas im Badezimmer","etwas in der Küche","etwas im Kühlschrank","ein Kleidungsstück","eine Farbe","ein Musikinstrument","ein Körperteil",
"eine Marke","eine App","ein Videospiel","ein Brettspiel","eine Social-Media-Plattform","eine Fast-Food-Kette","einen Supermarkt","ein Fortbewegungsmittel","ein Wetterphänomen","einen Planeten oder Himmelskörper",
"ein Haustier","einen Vogel","einen Fisch oder ein Meerestier","ein Insekt","ein Tier mit vier Beinen","ein Tier aus Afrika","eine Blume","einen Baum","ein Gewürz","eine Käsesorte",
"ein Frühstück","ein Gericht aus Italien","ein Gericht aus Asien","eine Brotsorte","einen Kuchen","eine Eissorte","ein Cocktail oder Mixgetränk","eine Kaffeesorte","einen Vornamen mit A","einen Vornamen mit M",
"einen Promi","einen Schauspieler","eine Figur aus einem Märchen","einen Cartoon","ein Spielzeug","etwas, das man im Urlaub mitnimmt","etwas, das man am Strand findet","etwas, das rund ist","etwas, das rot ist","etwas, das grün ist",
"etwas, das fliegen kann","etwas, das Strom braucht","etwas, das man im Baumarkt kauft","etwas, das man in der Schule braucht","etwas, das stinkt","etwas, das kalt ist","etwas, das heiß ist","etwas, das klebt","etwas aus Holz","etwas aus Metall",
"einen Grund, zu spät zu kommen","eine Ausrede fürs Fitnessstudio","eine Sache, die man auf einer Party macht","einen Ort für ein erstes Date","ein Geschenk unter 20 €","eine Hochzeitstradition","etwas, das man nachts macht","einen Song zum Mitsingen","einen Tanz","ein Hobby",
"einen Fluss","ein Gebirge oder einen Berg","eine Insel","ein Bundesland","ein Land in Europa","ein Land in Asien","eine Sprache","eine Währung","eine Sehenswürdigkeit","einen Feiertag",
"eine Olympische Disziplin","einen Begriff aus dem Fußball","einen Begriff aus dem Internet","ein Emoji","einen Social-Media-Star","einen Comedian","ein schwäbisches Wort","ein Kompliment","ein Wort für 'sehr gut'","einen Zungenbrecher",
"etwas mit Rädern","etwas mit Knöpfen","etwas Weiches","etwas, das man nicht essen sollte","etwas, das in einen Rucksack passt","ein Gerät im Haushalt","eine Sache auf einer Baustelle","einen Elektro-Begriff","einen Monat","einen Wochentag (und warum er toll ist)"
];
const BEGINNT = ["SCH","ST","SP","KR","BR","PF","FL","GR","TR","KL","B","M","K","P","H","W","L","R","T","F","A","E","S","Z","D","G","N","O","U","V"];
const ENDET = ["-UNG","-ER","-EN","-EL","-ING","-HEIT","-KEIT","-CHEN","-LICH","-IG","-SCHAFT","-TION","-E","-T","-S"];
const AUFGABEN = [].concat(
  NENNE.map(x => "Nenne " + x),
  BEGINNT.map(x => "Ein Wort, das mit „" + x + "“ beginnt"),
  ENDET.map(x => "Ein Wort, das auf „" + x.slice(1) + "“ endet")
);
