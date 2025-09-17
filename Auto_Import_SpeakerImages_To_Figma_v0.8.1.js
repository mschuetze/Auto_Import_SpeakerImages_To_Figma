// v0.8.1

figma.showUI(__html__, { width: 400, height: 300 });

// Alle SECTION-Knoten sammeln
const allSections = figma.root.findAll(n => n.type === "SECTION");

// Liste von Namen und IDs an die UI senden
figma.ui.postMessage({
  type: "init",
  sections: allSections.map(section => ({
    id: section.id,
    name: section.name
  }))
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'run-plugin') {
    const selectedSectionIds = msg.selectedSectionIds;

    // Finde alle Frames innerhalb der ausgewählten Sections
    const selectedSections = selectedSectionIds
      .map(id => figma.getNodeById(id))
      .filter(node => node && node.type === "SECTION");

    const targetFrames = [];

    for (const section of selectedSections) {
      const framesInSection = section.children.filter(child =>
        child.type === "FRAME" &&
        child.children.some(c => c.name === "Speakerbild")
      );
      targetFrames.push(...framesInSection);
    }

    await runPlugin(targetFrames);
    figma.closePlugin("✅ Bilder wurden eingesetzt und Frame-Namen angepasst.");
  }
};

// ======================
// Hilfsfunktionen
// ======================

const baseURL = "http://localhost:8888/bilder/";

function replaceUmlauts(str) {
  return str
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "Ae")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "Oe")
    .replace(/á|à|â|ã|å|ā/g, "a")
    .replace(/Á|À|Â|Ã|Å|Ā/g, "A")
    .replace(/é|è|ê|ë|ē/g, "e")
    .replace(/É|È|Ê|Ë|Ē/g, "E")
    .replace(/í|ì|î|ï|ī/g, "i")
    .replace(/Í|Ì|Î|Ï|Ī/g, "I")
    .replace(/ó|ò|ô|õ|ø|ō/g, "o")
    .replace(/Ó|Ò|Ô|Õ|Ø|Ō/g, "O")
    .replace(/ú|ù|û|ū/g, "u")
    .replace(/Ú|Ù|Û|Ū/g, "U")
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/š/g, "s")
    .replace(/Š/g, "S")
    .replace(/ž/g, "z")
    .replace(/Ž/g, "Z");
}

function findSpeakerName(frame) {
  const firmaNode = frame.findOne(n => n.name === "Speaker_Firma" && n.type === "TEXT");
  if (firmaNode) {
    const raw = firmaNode.characters.trim();
    return raw.split("(")[0].trim(); // Nur Name extrahieren
  }

  const speakerNode = frame.findOne(n => n.name === "Speaker" && n.type === "TEXT");
  if (speakerNode) {
    return speakerNode.characters.trim(); // Kein Extrahieren nötig
  }

  return null;
}

// ======================
// Hauptfunktion
// ======================

async function runPlugin(graphicFrames) {
  for (const frame of graphicFrames) {
    const speakerbildNode = frame.children.find(child => child.name === "Speakerbild");
    if (!speakerbildNode) continue;

    const speakerName = findSpeakerName(frame);
    if (!speakerName) continue;

    const cleaned = replaceUmlauts(speakerName);
    const parts = cleaned.split(/\s+/);
    if (parts.length < 2) continue;

    const [firstName, lastName] = parts;
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
    else continue;

    const fallbackFileNames = [
      `${lastName}_${firstName}_frei.png`,
      `${lastName}_${firstName}_dr_frei.png`,
      `${lastName}_${firstName}_wp_1024x1024.jpg`,
      `${lastName}_${firstName}_dr_wp_1024x1024.jpg`
    ];

    for (const file of fallbackFileNames) {
      const imageURL = `${baseURL}${folder}${file}`;

      try {
        const response = await fetch(imageURL);
        if (!response.ok) continue;

        const arrayBuffer = await response.arrayBuffer();
        const image = figma.createImage(new Uint8Array(arrayBuffer));

        const validTypes = ["RECTANGLE", "ELLIPSE", "FRAME", "POLYGON", "STAR"];
        if (!validTypes.includes(speakerbildNode.type)) break;

        speakerbildNode.fills = [{
          type: "IMAGE",
          scaleMode: "FILL",
          imageHash: image.hash,
        }];

        frame.name = `${frame.name}_${lastName}`;
        break;

      } catch (err) {
        console.error(`Fehler beim Laden: ${imageURL}`, err);
      }
    }
  }
}
