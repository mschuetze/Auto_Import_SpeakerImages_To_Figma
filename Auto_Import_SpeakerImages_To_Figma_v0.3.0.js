// v0.3.0

// 🔁 Konfiguration
const baseURL = "http://localhost:8888/bilder/";
const imageSize = 400;
const padding = 24; // Abstand vom Rand

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

      // 📦 Obersten übergeordneten FRAME finden
      let parent = textNode.parent;
      while (parent && parent.type !== "FRAME") {
        parent = parent.parent;
      }

      if (!parent || parent.type !== "FRAME") {
        console.warn(`⚠️ Kein übergeordneter FRAME für: ${rawText}`);
        continue;
      }

      const rect = figma.createRectangle();
      rect.resize(imageSize, imageSize);
      rect.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];

      // 📍 Bild am rechten unteren Rand positionieren
      rect.x = parent.width - imageSize - padding;
      rect.y = parent.height - imageSize - padding;

      parent.appendChild(rect);
    } catch (err) {
      console.error(`❌ Fehler beim Laden von ${imageURL}:`, err);
    }
  }

  figma.closePlugin("✅ Bilder wurden geladen und positioniert.");
}

// 📩 Listener starten
runPlugin();
