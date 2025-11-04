// v0.10.0

figma.showUI(__html__, { width: 400, height: 300 });

const allSections = figma.root.findAll(n => n.type === "SECTION");

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

    // Fehler sammeln
    const errorMessages = [];
    await runPlugin(targetFrames, errorMessages);

    // Show error window BEFORE closing plugin
    figma.showUI(`
      <html>
        <body>
          <h2>Fehler-Protokoll</h2>
          <div id="errors" style="color:red;margin-bottom:16px;">
            ${errorMessages.map(e => `<div>${e}</div>`).join("")}
          </div>
          <button id="closeBtn" style="padding:8px 16px;">schließen</button>
          <script>
            document.getElementById('closeBtn').onclick = () => parent.postMessage({ pluginMessage: { type: 'close-error-window' } }, '*');
          </script>
        </body>
      </html>
    `, { width: 500, height: 400 });
  }

  if (msg.type === 'close-error-window') {
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

function findSpeakerName(frame, errorMessages) {
  // try to find the standard text nodes
  const firmaNode = frame.findOne(n => n.name === "item__speakers" && n.type === "TEXT");
  const speakerNode = frame.findOne(n => n.name === "speaker__name" && n.type === "TEXT");
  const node = firmaNode || speakerNode;

  if (!node) {
    const errorMsg = `❌ Keine Text-Ebene mit dem Namen "item__speakers" oder "speaker__name" gefunden im Frame "${frame.name}" (ID: ${frame.id})`;
    if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
    return null;
  }

  const raw = node.characters.trim();
  if (!raw) {
    const errorMsg = `❌ Leerer Sprechertitel im Frame "${frame.name}" (ID: ${frame.id})`;
    if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
    return null;
  }

  // Schema: "Firstname Lastname | Company" or multiple separated by commas.
  // Split on commas (companies do not contain commas per schema), then take part before '|'
  const speakers = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      if (s.indexOf('|') !== -1) {
        return s.split('|')[0].trim();
      }
      // fallback: strip parentheses (e.g. "Name (Company)")
      return s.replace(/\s*\([^)]*\)/g, '').trim();
    })
    .map(s => s.replace(/\s+/g, ' ')) // normalize spaces
    .filter(Boolean);

  if (speakers.length === 0) {
    const errorMsg = `❌ Kein gültiger Sprechername gefunden im Frame "${frame.name}" (ID: ${frame.id})`;
    if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
    return null;
  }

  // return array of "Firstname Lastname" strings
  return speakers;
}

// ======================
// Hauptfunktion
// ======================

async function runPlugin(graphicFrames, errorMessages) {
  for (const frame of graphicFrames) {
    const speakerbildNode = frame.children.find(child => child.name === "Speakerbild");
    if (!speakerbildNode) continue;

    // NEW: get an ARRAY of speaker names (handles multiple speakers)
    const speakerNames = findSpeakerName(frame, errorMessages);
    if (!speakerNames || speakerNames.length === 0) continue;

    // Build concatenated last names: Lastname1Lastname2... and prefix frame.name
    const lastNamesCombined = speakerNames.map(name => {
      const cleaned = replaceUmlauts(name).trim();
      const parts = cleaned.split(/\s+/).filter(Boolean);
      return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }).join('');
    if (lastNamesCombined) {
      if (!frame.name.startsWith(`${lastNamesCombined}_`)) {
        frame.name = `${lastNamesCombined}_${frame.name}`;
      }
    }

    // EXISTING IMAGE LOGIC: keep behavior for image insertion (uses first speaker)
    const speakerName = speakerNames[0];
    if (!speakerName) continue;

    const cleaned = replaceUmlauts(speakerName);
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length < 1) continue;

    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const firstLetter = lastName && lastName.length > 0 ? lastName[0].toLowerCase() : '';

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

        break;

      } catch (err) {
        console.error(`Fehler beim Laden: ${imageURL}`, err);
      }
    }
  }
}
