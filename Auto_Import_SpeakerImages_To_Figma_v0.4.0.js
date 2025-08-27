// v0.4.0

// 🔁 Konfiguration
const baseURL = "http://localhost:8888/bilder/";
const imageSize = 400;

// 🧰 Umlaute ersetzen
function replaceUmlauts(str) {
  return str
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss");
}

// 🔝 Hilfsfunktion: Obersten übergeordneten Frame finden
function getTopFrame(node) {
  let current = node.parent;
  while (current && current.type !== "PAGE") {
    if (current.type === "FRAME") return current;
    current = current.parent;
  }
  return null;
}

// 🚀 Hauptfunktion
async function runPlugin() {
  console.log("▶️ Plugin gestartet");

  const textNodes = figma.currentPage.findAll(node =>
    node.type === "TEXT" && node.name === "Speaker_Firma"
  );

  for (const textNode of textNodes) {
    const rawText = textNode.characters.trim();
    const speakerName = rawText.split("(")[0].trim();
    const cleaned = replaceUmlauts(speakerName);
    const parts = cleaned.split(/\s+/);

    if (parts.length < 2) {
      console.log(`❗ Unvollständiger Name bei: "${rawText}"`);
      continue;
    }

    const [firstName, lastName] = parts;
    const fileName = `${lastName}_${firstName}_frei.png`;

    const firstLetter = lastName[0].toLowerCase();
    let folder = "";
    if ("abc".includes(firstLetter)) folder = "abc/";
    else if ("def".includes(firstLetter)) folder = "def/";
    else if ("ghi".includes(firstLetter)) folder = "ghi/";
    else if ("jkl".includes(firstLetter)) folder = "jkl/";
    else if ("mno".includes(firstLetter)) folder = "mno/";
    else if ("pqr".includes(firstLetter)) folder = "pqr/";
    else if ("st".includes(firstLetter)) folder = "st/";
    else if ("uvw".includes(firstLetter)) folder = "uvw/";
    else if ("xyz".includes(firstLetter)) folder = "xyz/";

    const imageURL = `${baseURL}${folder}${fileName}`;
    console.log(`⬇️ Lade Bild: ${imageURL}`);

    try {
      const response = await fetch(imageURL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const image = figma.createImage(new Uint8Array(arrayBuffer));

      // 🔍 Obersten Grafik-Frame finden
      const topFrame = getTopFrame(textNode);
      if (!topFrame) {
        console.warn(`⚠️ Kein übergeordneter Grafik-Frame gefunden für: ${rawText}`);
        continue;
      }

      // 🔍 "Speakerbild" im Grafik-Frame suchen
      const targetNode = topFrame.findOne(node => node.name === "Speakerbild");

      if (!targetNode || !"fills" in targetNode) {
        console.warn(`⚠️ Kein gültiger "Speakerbild"-Knoten gefunden für: ${rawText}`);
        continue;
      }

      // 🖼️ Bild als Füllung setzen
      targetNode.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];

      console.log(`✅ Bild in "Speakerbild" gesetzt für: ${rawText}`);
    } catch (err) {
      console.error(`❌ Fehler beim Laden von ${imageURL}:`, err);
    }
  }

  figma.closePlugin("✅ Bilder wurden eingesetzt.");
}

// 📩 Plugin starten
runPlugin();
