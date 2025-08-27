// v0.4.3

const baseURL = "http://localhost:8888/bilder/";

// Umlautersetzung
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

// Hilfsfunktion: Findet rekursiv den Text-Knoten "Speaker_Firma" in einem Frame
function findSpeakerFirmaNode(frame) {
  return frame.findOne(node => node.name === "Speaker_Firma" && node.type === "TEXT");
}

// Hauptfunktion
async function runPlugin() {
  console.log("▶️ Plugin gestartet");

  // Alle Frames finden, die ein Kind "Speakerbild" haben
  const graphicFrames = figma.currentPage.findAll(node =>
    node.type === "FRAME" &&
    node.children.some(child => child.name === "Speakerbild")
  );

  for (const frame of graphicFrames) {
    // Direktes Kind "Speakerbild"
    const speakerbildNode = frame.children.find(child => child.name === "Speakerbild");
    if (!speakerbildNode) {
      console.warn(`⚠️ Kein Speakerbild-Knoten gefunden im Frame: ${frame.name}`);
      continue;
    }

    // Speaker_Firma (irgendwo rekursiv unterhalb von frame)
    const speakerFirmaNode = findSpeakerFirmaNode(frame);
    if (!speakerFirmaNode) {
      console.warn(`⚠️ Kein Speaker_Firma-Knoten gefunden im Frame: ${frame.name}`);
      continue;
    }

    const rawText = speakerFirmaNode.characters.trim();
    const speakerName = rawText.split("(")[0].trim();
    const cleaned = replaceUmlauts(speakerName);
    const parts = cleaned.split(/\s+/);

    if (parts.length < 2) {
      console.log(`❗ Unvollständiger Name bei: "${rawText}"`);
      continue;
    }

    const [firstName, lastName] = parts;
    const fileName = `${lastName}_${firstName}_frei.png`;

    // Ordner-Logik
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
    else {
      console.warn(`⚠️ Unbekannter Anfangsbuchstabe: "${firstLetter}" bei "${rawText}"`);
      continue;
    }

    const imageURL = `${baseURL}${folder}${fileName}`;
    console.log(`⬇️ Lade Bild: ${imageURL}`);

    try {
      const response = await fetch(imageURL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const image = figma.createImage(new Uint8Array(arrayBuffer));

      // Prüfen ob Speakerbild Node Bildfüllung unterstützt
      const validTypes = ["RECTANGLE", "ELLIPSE", "FRAME", "POLYGON", "STAR"];
      if (!validTypes.includes(speakerbildNode.type)) {
        console.warn(`⚠️ "Speakerbild" ist vom Typ "${speakerbildNode.type}" und unterstützt keine Bildfüllung.`);
        continue;
      }

      // Bild als Fill setzen
      speakerbildNode.fills = [{
        type: "IMAGE",
        scaleMode: "FILL",
        imageHash: image.hash,
      }];

      console.log(`✅ Bild in "Speakerbild" gesetzt für: ${rawText}`);

    } catch (err) {
      console.error(`❌ Fehler beim Laden von ${imageURL}:`, err);
    }
  }

  figma.closePlugin("✅ Bilder wurden eingesetzt.");
}

// Plugin starten
runPlugin();
