// v0.12.0

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

    const errorMessages = [];
    await runPlugin(targetFrames, errorMessages);

    figma.showUI(`
      <html>
        <body style="font-family:sans-serif;">
          <h2>Fehler-Protokoll</h2>
          <div id="errors" style="color:red;margin-bottom:16px;white-space:pre-wrap;">
            ${errorMessages.map(e => `<div>${e}</div>`).join("")}
          </div>
          <button id="closeBtn" style="padding:8px 16px;">schließen</button>
          <script>
            document.getElementById('closeBtn').onclick = () => parent.postMessage({ pluginMessage: { type: 'close-error-window' } }, '*');
          </script>
        </body>
      </html>
    `, { width: 600, height: 500 });
  }

  if (msg.type === 'close-error-window') {
    figma.closePlugin("✅ Bilder wurden eingesetzt und Hilfs-Textfelder gelöscht.");
  }
};

// ======================
// Hilfsfunktionen
// ======================

const baseURL = "http://localhost:8888/bilder/";

function removeTitles(name) {
  // Alle relevanten Titel (inkl. Varianten) komplett entfernen
  const titlePattern = /\b(dr|dr\.|dr\.-?ing\.?|dr-?ing\.?|prof|prof\.|professor|pd|priv\.-?doz\.?|privadoz\.?|dipl\.-?ing\.?|phd|mba|b\.?sc|m\.?sc|msc|mag\.?)\.?\b/gi;

  return name
    .replace(titlePattern, '')    // Titel entfernen
    .replace(/[\.\-]+/g, '')      // übriggebliebene Punkte oder Bindestriche ebenfalls löschen
    .replace(/\s+/g, ' ')         // doppelte Leerzeichen reduzieren
    .trim();
}


function cleanLastName(lastName) {
  // 1. Umlaute / Sonderzeichen ersetzen
  let converted = replaceUmlauts(lastName.trim()).toLowerCase();
  // 2. Alle Arten von Apostrophen / Accentzeichen durch "_" ersetzen
  // Enthält: ', ’, `, ´ sowie Unicode combining accents
  converted = converted.replace(/['’`´\u0300-\u036F]/g, '_');
  // 3. Danach Leerzeichen in "_" umwandeln
  converted = converted.replace(/\s+/g, '_');
  // 4. Mehrfach hintereinander auftretende "_" reduzieren
  converted = converted.replace(/_+/g, '_');
  // 5. Führende oder trailing "_" entfernen
  converted = converted.replace(/^_+|_+$/g, '');
  return converted;
}


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

function getSpeakerData(frame, errorMessages) {
  const firstNameNode = frame.findOne(n => n.name === "item__firstName" && n.type === "TEXT");
  const lastNameNode = frame.findOne(n => n.name === "item__lastName" && n.type === "TEXT");

  if (!firstNameNode || !lastNameNode) {
    const errorMsg = `❌ Hilfs-Textfelder "item__firstName" oder "item__lastName" fehlen im Frame "${frame.name}" (ID: ${frame.id})`;
    if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
    return null;
  }

  const firstNames = firstNameNode.characters.split(',').map(s => s.trim()).filter(Boolean);
  const lastNames = lastNameNode.characters.split(',').map(s => s.trim()).filter(Boolean);

  if (firstNames.length !== lastNames.length) {
    const errorMsg = `⚠️ Anzahl von Vor- und Nachnamen stimmt nicht überein im Frame "${frame.name}"`;
    if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
  }

  // Speaker-Daten kombinieren
  const speakers = [];
  for (let i = 0; i < Math.min(firstNames.length, lastNames.length); i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    speakers.push({ firstName, lastName });
  }

  return speakers;
}

// ======================
// Hauptfunktion
// ======================

async function runPlugin(frames, errorMessages) {
  for (const frame of frames) {
    const speakerbildNode = frame.children.find(c => c.name === "Speakerbild");
    if (!speakerbildNode) continue;

    const speakers = getSpeakerData(frame, errorMessages);
    if (!speakers || speakers.length === 0) continue;

    // Hilfs-Textfelder löschen
    const firstNameNode = frame.findOne(n => n.name === "item__firstName" && n.type === "TEXT");
    const lastNameNode = frame.findOne(n => n.name === "item__lastName" && n.type === "TEXT");
    if (firstNameNode) firstNameNode.remove();
    if (lastNameNode) lastNameNode.remove();

    // Nodes für Speakerbilder
    const speakerNodes = [speakerbildNode];
    for (let i = 1; i < speakers.length; i++) {
      const cloned = speakerbildNode.clone();
      cloned.name = `Speakerbild_${i+1}`;
      cloned.x = speakerbildNode.x + i * 100;
      cloned.y = speakerbildNode.y;
      frame.appendChild(cloned);
      speakerNodes.push(cloned);
    }

    // Bilder zuweisen
    for (let i = 0; i < speakers.length; i++) {
      const { firstName, lastName } = speakers[i];
      const targetNode = speakerNodes[i];
      if (!firstName || !lastName) continue;

      // Doppelnamen mit Bindestrich verbinden
      const cleanLast = cleanLastName(lastName);
      const cleanFirst = replaceUmlauts(removeTitles(firstName).trim())
        .toLowerCase()
        .split(/\s+/)
        .join('_');


      const firstLetter = cleanLast[0] || '';
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

      const filenames = [
        `${cleanLast}_${cleanFirst}_frei.png`,
        `${cleanLast}_${cleanFirst}_dr_frei.png`,
        `${cleanLast}_${cleanFirst}_wp_1024x1024.jpg`,
        `${cleanLast}_${cleanFirst}_dr_wp_1024x1024.jpg`
      ];

      let loaded = false;
      const triedFiles = [];

      for (const f of filenames) {
        const url = `${baseURL}${folder}${f}`;
        triedFiles.push(url);
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const buffer = await res.arrayBuffer();
          const img = figma.createImage(new Uint8Array(buffer));
          targetNode.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: img.hash }];
          loaded = true;
          break;
        } catch (err) {
          console.error(`Fehler beim Laden: ${url}`, err);
        }
      }

      if (!loaded) {
        const errorMsg = `⚠️ Kein Bild gefunden für "${firstName} ${lastName}" im Frame "${frame.name}"\n` +
                         `→ getestete Dateien:\n${triedFiles.map(f => '   • '+f).join('\n')}`;
        if (Array.isArray(errorMessages)) errorMessages.push(errorMsg);
      }
    }
  }
}
