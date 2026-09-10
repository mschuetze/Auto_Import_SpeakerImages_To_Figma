# Auto_Import_SpeakerImages_To_Figma
Skript bzw. Plugin für Figma, um den Programmgrafiken NACH der Datenzusammenführung automatisiert Speakerbilder hinzuzufügen. 

## Inhaltsverzeichnis
- [Was es tut](#was-es-tut)
- [Voraussetzungen](#voraussetzungen)
- [Plugin installieren](#plugin-installieren)
- [Plugin verwenden](#plugin-verwenden)
- [Plugin aktualisieren](#plugin-aktualisieren)

## Was es tut
### Auswahl-Dialog
- Auswahl, welche SECTION das Plugin bearbeiten soll
- Eingabe des Konferenzpräfixes
### Konstruktion von Speakernamen + Bildpfad
- durchsucht die ausgewählten SECTION inklusive aller verschachtelten Sections nach den Textfeldern: 
  - **item__firstName** / **item__lastName** oder 
  - **speaker__firstName** / **speaker__lastName**  
- generiert daraus den/die Vor- und Nachnamen (Support für mehrere, durch Komma getrennet Speaker)
- bereinigt Sonderzeichen und Leerzeichen
- durchsucht alle FRAMES nach einem Bildrahmen mit dem Namen **Speakerbild**
- lädt das entsprechende Speakerbild und platziert es automatisch in dem Bildrahmen
  - falls mehrere Speaker im Frame vorhanden sind, werden zusätzliche Bild-Instanzen geklont und entsprechend mit Bildern belegt
- meldet fehlende Textfelder oder nicht gefundene Bilddateien per Fehlerliste im Plugin-Overlay
### Konstruktion von Framebezeichnung
1. **Speakername** aus vorigem Schritt
    - dabei wird mittels ` / ` getrennt der Name doppelt eingesetzt, um beim Export aus Figma direkt Speaker-spezifische Unterordner zu erzeugen 
2. **Konferenz-Präfix** – wahlweise automatisch aus eigens dafür angelegter SECTION oder manuell im Dialog eingegeben
3. der String `SoMe`
4. **Talk-Typ**
    - hierzu wird jeder FRAME nach Textfeldern mit diesen Namen durchsucht und dann dessen Inhalt als TYPE genutzt:
      - "Session", "Sessions", "Workshop", "Workshops", "Keynote", "Bootcamp", "Bootcamps" 
5. extrahiert die ersten 3 Wörter des Talk-Titels, um eine eindeutige Zuordnung zu ermöglichen
6. Breite + Höhe wird dynamisch abgefragt 
7. Ticket-Nummer aus dem übergeordneten Frame/Namen



## Voraussetzungen
### 1. Figma Desktop-App
- herunterladen + installieren: https://www.figma.com/de-de/downloads/
### 2. Github-Projekt
- neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
- entzippten Ordner unter folgendem Pfad ablegen: `/Benutzer/[EuerBenutzer]/Dokumente/Skripte/`
- ggf. alten Plugin-Ordner löschen
### 3. aktive Server-Verbindung
- Verbindung zum GRAFIK-Server muss zwingend bestehen. Wahlweise direkt (im Büro) oder via VPN
### 4. MAMP-Webserver
> Dies ist ein einmaliger Prozess.

Figma-Plugins dürfen aus Sicherheitsgründen keine lokalen Dateien laden. Wir umgehen das, indem wir MAMP als lokalen Webserver nutzen.

#### Schritte:
1. **MAMP herunterladen und installieren** 
  - Link: https://www.mamp.info/de/mac/

2. **Ordner-Verknüpfung erstellen**
  - App **Terminal** öffnen
  - folgenden Code einfügen und mit ENTER bestätigen: `ln -s "/Volumes/GRAFIK/Grafik1/Speaker- und Autorenbilder" "/Applications/MAMP/htdocs/bilder"`
  - überprüfen, ob Verknüpfung korrekt erstellt wurde:
    - via App **Finder** hier hin navigieren: `Programme/MAMP/htdocs/`
    - existiert dort ein Ordner "bilder", dann hat es geklappt

3. **.htaccess einfügen**
  - via App **Finder** hier hin navigieren: `Programme/MAMP/htdocs/`
  - unsichtbare/versteckte Dateien sichtbar machen mittels Tastenkombination `Befehl (⌘) + Umschalttaste (⇧) + Punkt (.)`
  - Füge Datei **.htaccess** aus dem GitHub-Download ein

4. **httpd.conf ersetzen**
  - via App **Finder** hier hin navigieren: `/Programme/MAMP/conf/apache/`
  - dortige Datei mit der Datei aus dem Github-Download (MAMP-Ordner) ersetzen
  - unsichtbare/versteckte Dateien wieder unsichtbar machen mittels Tastenkombination `Befehl (⌘) + Umschalttaste (⇧) + Punkt (.)`

5. **MAMP starten**
  - App **MAMP** starten: */Programme/MAMP/MAMP*
    - nach Start Rechtsklick auf Icon im Dock: `Optionen > Im Dock behalten`
  - Webserver in MAMP per START-Icon (oben rechts) starten
  ![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/mamp1.png)

## Plugin installieren
Zunächst müssen alle [Voraussetzungen](#voraussetzungen) erfüllt sein.

- Figma Desktop-App öffnen
- Datei mit den Programmgrafiken öffnen
- via Menüleiste am oberen Rand: `Plugins > Development > Import plugin from manifest…`
![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/figma1.png)
  - Datei **manifest.json** im abgelegten Github-Ordner auswählen: `/Benutzer/[EuerBenutzer]/Dokumente/Skripte/Auto_Import_SpeakerImages_To_Figma/manifest.json`
- das Plugin ist nun installiert und kann verwendet werden

## Plugin verwenden
- Verbindung zu GRAFIK-Server herstellen (z.B. via VPN-Client)
- App **MAMP** starten
  - Webserver per START-Icon starten
    ![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/mamp1.png)
- Figma Desktop-App öffnen
- Datei mit den Programmgrafiken öffnen
- Plugin-Übersicht aufrufen via Menüleiste am oberen Rand: `Plugins > Manage plugins…`
![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/figma2.png)
- Plugin **Auto_Import_SpeakerImages_To_Figma** anklicken
![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/figma3.png)

## Plugin aktualisieren
Wenn eine neuere Version des Plugins verfügbar ist, müssen folgende Schritte erledigt werden, um es korrekt einzubinden:
1. **altes Plugin deinstallieren**
  - Figma Desktop-App öffnen
  - Plugin-Übersicht aufrufen via Menüleiste am oberen Rand: `Plugins > Manage plugins…`
  - Plugin deinstallieren via: `Hamburger-Menü (3 Punkte) > Remove`
  ![alt text](https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/blob/main/Bilder/figma4.png)
2. **neuestes Plugin herunterladen**
  - neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
  - entzippten Ordner unter folgendem Pfad ablegen/ersetzen/ggf. alten löschen: `/Benutzer/[EuerBenutzer]/Dokumente/Skripte/`
3. **neues Plugin installieren**
  - weiter mit [Plugin installieren](#plugin-installieren)