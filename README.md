# Auto_Import_SpeakerImages_To_Figma
Skript bzw. Plugin für Figma, um den Programmgrafiken NACH der Datenzusammenführung automatisiert Speakerbilder hinzuzufügen. 

## Voraussetzungen
### MAMP-Webserver
- herunterladen + installieren: https://www.mamp.info/de/mac/
- Verknüpfung zu Ordner "Speaker- und Autorenbilder" erstellen:
  - App "Terminal" öffnen
  - folgenden Code einfügen und mit ENTER bestätigen: `ln -s "/Volumes/GRAFIK/Grafik1/Speaker- und Autorenbilder" "/Applications/MAMP/htdocs/bilder"`
  - überprüfen, ob Verknüpfung korrekt erstellt wurde:
    - via App "Finder" hier hin navigieren: **Applications/MAMP/htdocs/**
    - existiert dort ein Ordner "bilder", dann hat es geklappt