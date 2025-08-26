// v0.3.1 – Positionierung am unteren rechten Rand des obersten Frames

const baseURL = "http://localhost:8888/bilder/";
const imageSize = 400;
const padding = 24;

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

      // 🔍 Obersten Frame finden
      let parent = textNode.parent;
      let topFrame = null;
      while (parent) {
        if (parent.type === "FRAME" && !parent.parent) {
          topFrame = parent;
          break;
        }
        if (parent.type === "FRAME") topFrame = parent;
        parent = parent.parent;
      }

      if (!topFrame) {
        console.warn(`⚠️ Kein übergeordneter Frame gefunden für: ${rawText}`);
        continue;
      }

      // 🎯 Bild erstellen
      const rect = figma.createRectangle();
      rect.resize(imageSize, imageSize);
      rect.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];

      // 📐 Position: rechts unten relativ zum Frame
      rect.x = topFrame.x + topFrame.width - imageSize - padding;
      rect.y = topFrame.y + topFrame.height - imageSize;

      // ➕ Direkt in den obersten Frame einfügen
      figma.currentPage.appendChild(rect);

    } catch (err) {
      console.error(`❌ Fehler beim Laden von ${imageURL}:`, err);
    }
  }

  figma.closePlugin("✅ Bilder wurden geladen und korrekt positioniert.");
}

runPlugin();
