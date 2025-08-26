# Auto_Import_SpeakerImages_To_Figma
Skript bzw. Plugin für Figma, um den Programmgrafiken NACH der Datenzusammenführung automatisiert Speakerbilder hinzuzufügen. 

## Voraussetzungen
### Figma Desktop-App
- herunterladen + installieren: https://www.figma.com/de-de/downloads/
### Github-Projekt
- neuesten Release herunterladen: https://github.com/mschuetze/Auto_Import_SpeakerImages_To_Figma/releases
- entzippten Ordner unter folgendem Pfad ablegen: */Users/[EuerBenutzer]/Dokumente/Skripte/*
### MAMP-Webserver
- herunterladen + installieren: https://www.mamp.info/de/mac/
- Verknüpfung zu Ordner **Speaker- und Autorenbilder** erstellen:
  - App **Terminal** öffnen
  - folgenden Code einfügen und mit ENTER bestätigen: `ln -s "/Volumes/GRAFIK/Grafik1/Speaker- und Autorenbilder" "/Applications/MAMP/htdocs/bilder"`
  - überprüfen, ob Verknüpfung korrekt erstellt wurde:
    - via App **Finder** hier hin navigieren: *Programme/MAMP/htdocs/*
    - existiert dort ein Ordner "bilder", dann hat es geklappt
- Datei **.htaccess** einfügen:
  - via App **Finder** hier hin navigieren: *Programme/MAMP/htdocs/*
  - Datei aus dem Github-Download (MAMP-Ordner) einfügen 
- Datei **httpd.conf** ersetzen
  - via App **Finder** hier hin navigieren: */Programme/MAMP/conf/*
  - dortige Datei mit der Datei aus dem Github-Download (MAMP-Ordner) ersetzen

## Plugin installieren
- Figma Desktop-App öffnen
- Datei mit den Programmgrafiken öffnen
- via Plugins > 