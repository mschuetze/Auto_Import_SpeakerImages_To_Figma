# Auto_Import_SpeakerImages_To_Figma
Skript bzw. Plugin für Figma, um den Programmgrafiken NACH der Datenzusammenführung automatisiert Speakerbilder hinzuzufügen. 

## Was es tut
- durchsucht die aktuelle Figma-Seite nach Textfeldern mit dem Namen **Speaker_Firma**
- extrahiert daraus den Vor- und Nachnamen
- erstellt daraus dynamisch einen Bildpfad
- lädt das entsprechende Sprecherbild und platziert es automatisch neben dem Textfeld

## Voraussetzungen
### 1. Figma Desktop-App
- herunterladen + installieren: https://www.figma.com/de-de/downloads/
### 2. Github-Projekt
- neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
- entzippten Ordner unter folgendem Pfad ablegen: */Benutzer/[EuerBenutzer]/Dokumente/Skripte/*
### 3. aktive Server-Verbindung
- Verbindung zum GRAFIK-Server muss zwingend bestehen. Wahlweise direkt (im Büro) oder via VPN
### 4. MAMP-Webserver
Figma-Plugins dürfen aus Sicherheitsgründen keine lokalen Daten laden. Daher müssen wir so tun, als lägen unsere Speakerbilder auf einem Webserver. Dies tun wir mittels der App MAMP.
- herunterladen + installieren: https://www.mamp.info/de/mac/
- Verknüpfung zu Ordner **Speaker- und Autorenbilder** erstellen:
  - App **Terminal** öffnen
  - folgenden Code einfügen und mit ENTER bestätigen: `ln -s "/Volumes/GRAFIK/Grafik1/Speaker- und Autorenbilder" "/Applications/MAMP/htdocs/bilder"`
  - überprüfen, ob Verknüpfung korrekt erstellt wurde:
    - via App **Finder** hier hin navigieren: *Programme/MAMP/htdocs/*
    - existiert dort ein Ordner "bilder", dann hat es geklappt
- Datei **.htaccess** einfügen:
  - via App **Finder** hier hin navigieren: *Programme/MAMP/htdocs/*
  - unsichtbare/versteckte Dateien sichtbar machen mittels Tastenkombination `Befehl (⌘) + Umschalttaste (⇧) + Punkt (.)`
  - Datei aus dem Github-Download (MAMP-Ordner) einfügen 
- Datei **httpd.conf** ersetzen
  - via App **Finder** hier hin navigieren: */Programme/MAMP/conf/apache/*
  - dortige Datei mit der Datei aus dem Github-Download (MAMP-Ordner) ersetzen
  - unsichtbare/versteckte Dateien wieder unsichtbar machen mittels Tastenkombination `Befehl (⌘) + Umschalttaste (⇧) + Punkt (.)`
- App **MAMP** starten: */Programme/MAMP/MAMP*
  - nach Start Rechtsklick auf Icon im Dock: `Optionen > Im Dock behalten`
- Webserver in MAMP per START-Icon (oben rechts) starten

## Plugin installieren
- Figma Desktop-App öffnen
- Datei mit den Programmgrafiken öffnen
- via Menüleiste am oberen Rand: `Plugins > Development > Import plugin from manifest…`
  - Datei **manifest.json** im abgelegten Github-Ordner auswählen: */Benutzer/[EuerBenutzer]/Dokumente/Skripte/Auto_Import_SpeakerImages_To_Figma/manifest.json*
- das Plugin ist nun installiert

## Plugin verwenden
- App **MAMP** starten
  - Webserver per START-Icon starten
- Figma Desktop-App öffnen
- Datei mit den Programmgrafiken öffnen
- Plugin-Übersicht aufrufen via Menüleiste am oberen Rand: `Plugins > Manage plugins…`
- Plugin **Auto_Import_SpeakerImages_To_Figma** anklicken

## Plugin aktualisieren
Wenn eine neuere Version des Plugins verfügbar ist, müssen folgende Schritte erledigt werden, um es korrekt einzubinden:
- Figma Desktop-App öffnen
- Plugin-Übersicht aufrufen via Menüleiste am oberen Rand: `Plugins > Manage plugins…`
- Plugin deinstallieren via: `Hamburger-Menü (3 Punkte) > Remove`
- MAMP-Webserver (nicht die App) beenden via BEENDEN-Button (oben rechts)
- neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
- entzippten Ordner unter folgendem Pfad ablegen/ersetzen: */Benutzer/[EuerBenutzer]/Dokumente/Skripte/*
