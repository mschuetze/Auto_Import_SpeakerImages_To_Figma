# Auto_Import_SpeakerImages_To_Figma
Skript bzw. Plugin für Figma, um den Programmgrafiken NACH der Datenzusammenführung automatisiert Speakerbilder hinzuzufügen. 

## Inhaltsverzeichnis
- [Was es tut](#was-es-tut)
- [Voraussetzungen](#voraussetzungen)
- [Plugin installieren](#plugin-installieren)
- [Plugin verwenden](#plugin-verwenden)
- [Plugin aktualisieren](#plugin-aktualisieren)

## Was es tut
- startet Auswahl-Dialog zum Festlegen, welche SECTIONS das Plugin bearbeiten soll
- durchsucht die aktuelle Figma-Seite nach Textfeldern mit dem Namen **Speaker_Firma**
- falls gefunden:
  - extrahiert daraus den Vor- und Nachnamen
  - erstellt daraus dynamisch einen Bildpfad
  - durchsucht die aktuelle Grafik nach einem Bildrahmen mit dem Namen **Speakerbild**
  - falls gefunden:
    - lädt das entsprechende Speakerbild und platziert es automatisch in dem Bildrahmen
    - ergänzt den Nachnamen in der Frame-Bezeichnung, damit die Grafik nach dem Export eindeutig/besser zuzuordnen ist

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
- Plugin **Auto_Import_SpeakerImages_To_Figma** anklicken

## Plugin aktualisieren
Wenn eine neuere Version des Plugins verfügbar ist, müssen folgende Schritte erledigt werden, um es korrekt einzubinden:
1. **altes Plugin deinstallieren**
  - Figma Desktop-App öffnen
  - Plugin-Übersicht aufrufen via Menüleiste am oberen Rand: `Plugins > Manage plugins…`
  - Plugin deinstallieren via: `Hamburger-Menü (3 Punkte) > Remove`
2. **neuestes Plugin herunterladen**
  - neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
  - entzippten Ordner unter folgendem Pfad ablegen/ersetzen/ggf. alten löschen: `/Benutzer/[EuerBenutzer]/Dokumente/Skripte/`
3. **neues Plugin installieren**
  - weiter mit [Plugin installieren](#plugin-installieren)