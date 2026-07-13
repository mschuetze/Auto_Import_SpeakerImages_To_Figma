// v1.2.0

figma.showUI(__html__, { width: 400, height: 400 });
figma.ui.postMessage({ type: "progress" });

setTimeout(() => {
  const allSections = figma.root.findAll(n => n.type === "SECTION");

  figma.ui.postMessage({
    type: "init",
    sections: allSections.map(s => ({ id: s.id, name: s.name }))
  });
}, 500);

figma.ui.onmessage = async (msg) => {

  if (msg.type === "run-plugin") {

    const conferencePrefix = msg.conferencePrefix || "";

    // Fortschrittszustand direkt im vorhandenen UI anzeigen
    figma.ui.postMessage({ type: "progress" });

    // Figma soll den Fortschrittszustand erst rendern, bevor die schwere Arbeit startet
    await new Promise(resolve => setTimeout(resolve, 50));

    const selectedSectionIds = msg.selectedSectionIds;

    const frames = selectedSectionIds
      .map(id => figma.getNodeById(id))
      .filter(n => n && n.type === "SECTION")
      .flatMap(section =>
        section.children.filter(
          child =>
            child.type === "FRAME" &&
            child.children.some(c => c.name === "Speakerbild")
        )
      );

    const errors = [];
    await runPlugin(frames, errors, conferencePrefix);

    // Ergebnisfenster im regulären Auswahl-Overlay anzeigen
    figma.showUI(__html__, { width: 800, height: 800 });
    figma.ui.postMessage({ type: "done", errors });
  }

  if (msg.type === "close-error-window") {
    figma.closePlugin("✅ Plugin fertig.");
  }
};

// ==========================
// HILFSFUNKTIONEN
// ==========================

const baseURL = "http://localhost:8888/bilder/";

function replaceUmlauts(str) {
  return str
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/Æ/g, "Ae")
    .replace(/á|à|â|ã|å|ā/g, "a").replace(/Á|À|Â|Ã|Å|Ā/g, "A")
    .replace(/é|è|ê|ë|ē/g, "e").replace(/É|È|Ê|Ë|Ē/g, "E")
    .replace(/í|ì|î|ï|ī/g, "i").replace(/Í|Ì|Î|Ï|Ī/g, "I")
    .replace(/ó|ò|ô|õ|ø|ō/g, "o").replace(/Ó|Ò|Ô|Õ|Ø|Ō/g, "O")
    .replace(/ú|ù|û|ū/g, "u").replace(/Ú|Ù|Û|Ū/g, "U")
    .replace(/ñ/g, "n").replace(/Ñ/g, "N")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ł/g, "l").replace(/Ł/g, "L")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/š/g, "s").replace(/Š/g, "S")
    .replace(/ž/g, "z").replace(/Ž/g, "Z");
}

function removeTitles(name) {
  const titlePattern =
    /\b(dr|dr\.|dr\.-?ing\.?|dr-?ing|prof|prof\.|professor|pd|priv\.-?doz|privadoz|dipl\.-?ing|phd|mba|b\.?sc|m\.?sc|msc|mag)\.?/gi;

  return name
    .replace(titlePattern, "")
    .replace(/[.\-]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLastName(lastName) {
  let val = replaceUmlauts(lastName.trim()).toLowerCase();
  val = val.replace(/['’`´\u0300-\u036F]/g, "_");
  val = val.replace(/\s+/g, "_");
  return val.replace(/_+/g, "_");
}

function cleanFirstName(firstName) {
  const cleaned = removeTitles(firstName);
  return replaceUmlauts(cleaned.trim())
    .toLowerCase()
    .split(/\s+/)
    .join("_");
}

function getTitleText(frame) {
  const titleNode = frame.findOne(n => n.type === "TEXT" && n.name === "item__title");
  return titleNode && titleNode.characters.trim() ? titleNode.characters.trim() : "";
}

function getItemTypeText(frame) {
  const itemTypeNode = frame.findOne(n => n.type === "TEXT" && n.name === "item__type");
  return itemTypeNode && itemTypeNode.characters.trim() ? itemTypeNode.characters.trim() : "";
}

function buildTitleToken(title) {
  if (!title) return "";

  return title
    .trim()
    .replace(/[-–—]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(word => replaceUmlauts(word).replace(/[^0-9A-Za-z]/g, ""))
    .filter(Boolean)
    .join("");
}

function insertTitleTokenIntoName(name, token) {
  if (!token) return name;

  const sectionTypes = ["Session", "Sessions", "Workshop", "Workshops", "Keynote", "Bootcamp", "Bootcamps"];
  const pattern = new RegExp(`(^|[^A-Za-z0-9])(${sectionTypes.join("|")})(?:_[^_]+)?_1080x1080`, "i");

  return name.replace(pattern, (match, prefix, type) => `${prefix}${type}_${token}_1080x1080`);
}

function sanitizeFrameNameSegment(value) {
  if (!value) return "";

  return replaceUmlauts(value.trim())
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildFrameNamePrefix(namesCombined, conferencePrefix) {
  const cleanPrefix = sanitizeFrameNameSegment(conferencePrefix);
  return cleanPrefix ? `${namesCombined}_${cleanPrefix}` : namesCombined;
}

function appendFrameDimensionsToName(name, frame) {
  if (!frame || !frame.width || !frame.height) return name;

  const width = Math.round(frame.width);
  const height = Math.round(frame.height);
  const suffix = `${width}x${height}`;

  return name.endsWith(`_${suffix}`) ? name : `${name}_${suffix}`;
}

function getChannelSegment(frame) {
  if (!frame || !frame.width || !frame.height) return "";

  const width = Math.round(frame.width);
  const height = Math.round(frame.height);

  if (width === 1080 && height === 1080) return "SoMe";
  if (width === 500 && height === 400) return "NL";
  return "";
}

function extractTicketNumberFromName(name) {
  if (!name) return "";

  const match = name.match(/\b(GT-\d{4,})\b/i);
  return match ? match[1] : "";
}

function getParentTicketNumber(frame) {
  const parent = frame.parent;
  if (!parent || !parent.name) return "";
  return extractTicketNumberFromName(parent.name);
}

function getSpeakerData(frame, errors) {
  const firstNameNode = frame.findOne(n =>
    (n.name === "item__firstName" || n.name === "speaker__firstName") && n.type === "TEXT"
  );

  const lastNameNode = frame.findOne(n =>
    (n.name === "item__lastName" || n.name === "speaker__lastName") && n.type === "TEXT"
  );

  if (!firstNameNode || !lastNameNode) {
    errors.push(
      `❌ "item__firstName/speaker__firstName" oder "item__lastName/speaker__lastName" fehlt im Frame "${frame.name}"`
    );
    return null;
  }

  const firstNames = firstNameNode.characters.split(",").map(s => s.trim()).filter(Boolean);
  const lastNames = lastNameNode.characters.split(",").map(s => s.trim()).filter(Boolean);

  if (firstNames.length !== lastNames.length) {
    errors.push(`⚠️ Anzahl Vor- und Nachnamen ungleich im Frame "${frame.name}"`);
  }

  return firstNames.map((fn, i) => ({
    firstName: removeTitles(fn),
    lastName: lastNames[i]
  }));
}


// ==========================
// HAUPTFUNKTION
// ==========================

async function runPlugin(frames, errors, conferencePrefix = "") {
  for (const frame of frames) {

    const speakerbild = frame.children.find(c => c.name === "Speakerbild");
    if (!speakerbild) continue;

    const speakers = getSpeakerData(frame, errors);
    if (!speakers) continue;

    // Frame-Namen um Namen der Speaker erweitern
    const NamesCombined = speakers.map(s => `${cleanLastName(s.lastName)}_${cleanFirstName(s.firstName)}`).join("+");
    const speakerPrefix = NamesCombined;
    const frameNamePrefix = buildFrameNamePrefix(NamesCombined, conferencePrefix);
    const ticketNumber = getParentTicketNumber(frame);

    const titleText = getTitleText(frame);
    const itemTypeText = getItemTypeText(frame);
    const titleToken = buildTitleToken(titleText);
    const channelSegment = getChannelSegment(frame);

    let frameNameBody = `${frameNamePrefix}`;
    if (channelSegment) {
      frameNameBody = `${frameNameBody}_${channelSegment}`;
    }
    if (itemTypeText) {
      frameNameBody = `${frameNameBody}_${sanitizeFrameNameSegment(itemTypeText)}`;
    }
    if (titleToken) {
      frameNameBody = `${frameNameBody}_${titleToken}`;
    }
    frameNameBody = appendFrameDimensionsToName(frameNameBody, frame);

    frame.name = ticketNumber
      ? `${speakerPrefix} / ${frameNameBody}_${ticketNumber}`
      : `${speakerPrefix} / ${frameNameBody}`;

    // Hilfstexte löschen (unterstütze item__* und speaker__* Varianten)
    frame
      .findAll(n => n.name === "item__firstName" || n.name === "speaker__firstName")
      .forEach(n => n.remove());
    frame
      .findAll(n => n.name === "item__lastName" || n.name === "speaker__lastName")
      .forEach(n => n.remove());

    // Für mehrere Speaker klonen
    const nodes = [speakerbild];
    for (let i = 1; i < speakers.length; i++) {
      const clone = speakerbild.clone();
      clone.name = `Speakerbild_${i + 1}`;
      clone.x = speakerbild.x + i * 100;
      frame.appendChild(clone);
      nodes.push(clone);
    }

    // Bilder laden
    for (let i = 0; i < speakers.length; i++) {
      const { firstName, lastName } = speakers[i];
      const fn = cleanFirstName(firstName);
      const ln = cleanLastName(lastName);

      const firstLetter = (ln && ln.length > 0) ? ln[0] : "";
      const folder =
        ("abc".includes(firstLetter) && "abc/") ||
        ("def".includes(firstLetter) && "def/") ||
        ("ghi".includes(firstLetter) && "ghi/") ||
        ("jkl".includes(firstLetter) && "jkl/") ||
        ("mno".includes(firstLetter) && "mno/") ||
        ("pqr".includes(firstLetter) && "pqr/") ||
        ("st".includes(firstLetter) && "st/") ||
        ("uvw".includes(firstLetter) && "uvw/") ||
        ("xyz".includes(firstLetter) && "xyz/") ||
        "";

      const filenames = [
        `${ln}_${fn}_frei.png`,
        `${ln}_${fn}_dr_frei.png`,
        `${ln}_${fn}_wp_1024x1024.jpg`,
        `${ln}_${fn}_dr_wp_1024x1024.jpg`
      ];

      let success = false;
      const tried = [];

      for (const f of filenames) {
        const url = baseURL + folder + f;
        tried.push(url);

        try {
          const res = await fetch(url);
          if (!res.ok) continue;

          const buffer = await res.arrayBuffer();
          const image = figma.createImage(new Uint8Array(buffer));
          nodes[i].fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
          success = true;
          break;
        } catch (_) {}
      }

      if (!success) {
        errors.push(
          `⚠️ Kein Bild für "${firstName} ${lastName}" in Frame "${frame.name}"\n` +
          tried.map(t => "  • " + t).join("\n")
        );
      }
    }
  }
}
