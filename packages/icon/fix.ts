const fs = require("fs/promises");
const path = require("path");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");
const { randomUUID } = require("crypto");
const { Command } = require("commander");

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

function generateNewId(originalId: string, filenamePrefix: string): string {
  const shortUUID = randomUUID().substring(0, 8);
  return `${filenamePrefix}-${originalId}-${shortUUID}`;
}

async function processSvgFile(
  svgFilePath: string,
  backup: boolean,
): Promise<boolean> {
  console.log(`Processing file: ${svgFilePath}`);
  try {
    if (backup) {
      const backupFilePath = svgFilePath + ".bak";
      await fs.copyFile(svgFilePath, backupFilePath);
      console.log(`  Backed up original file to ${backupFilePath}`);
    }

    const svgContent = await fs.readFile(svgFilePath, "utf-8");
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const serializer = new XMLSerializer();

    const idMap: Record<string, string> = {};
    const filenameBase = path.basename(svgFilePath, path.extname(svgFilePath));

    // 1. Find elements with IDs within <defs> and update them
    const defsElements = doc.getElementsByTagNameNS(SVG_NS, "defs");
    let defsIdsModifiedCount = 0;

    for (let i = 0; i < defsElements.length; i++) {
      const defsNode = defsElements[i];
      // Iterate over child nodes that are elements and have an 'id'
      for (let j = 0; j < defsNode.childNodes.length; j++) {
        const childNode = defsNode.childNodes[j];
        if (childNode.nodeType === 1) {
          // ELEMENT_NODE
          const element = childNode as Element;
          if (element.hasAttribute("id")) {
            const oldId = element.getAttribute("id");
            if (oldId) {
              const newId = generateNewId(oldId, filenameBase);
              element.setAttribute("id", newId);
              idMap[oldId] = newId;
              defsIdsModifiedCount++;
              // console.log(`    Renamed id '${oldId}' to '${newId}' in <defs>`);
            }
          }
        }
      }
    }

    if (defsIdsModifiedCount > 0) {
      console.log(
        `  Renamed ${defsIdsModifiedCount} IDs within <defs> elements.`,
      );
    } else {
      console.log(
        `  No IDs found or modified within <defs> in ${svgFilePath}.`,
      );
      // If no IDs were changed in defs, no references need updating based on them.
      // We could skip serialization if no backup, but to ensure consistency (e.g. XML declaration), we serialize.
      // return true; // Early exit if desired, though serializing ensures format consistency
    }

    if (Object.keys(idMap).length === 0) {
      // console.log(`  No IDs were modified in <defs>. No references to update.`);
      // Still, we serialize to ensure consistent output format (e.g. XML declaration)
      // or if the parser/serializer itself makes some auto-corrections.
      const updatedSvgContent = serializer.serializeToString(doc);
      // Only write if content actually changed to avoid unnecessary file modifications
      if (updatedSvgContent !== svgContent) {
        await fs.writeFile(svgFilePath, updatedSvgContent, "utf-8");
        console.log(
          `  File reformatted/saved (no ID changes in defs): ${svgFilePath}`,
        );
      } else {
        console.log(
          `  File content unchanged (no ID changes in defs): ${svgFilePath}`,
        );
      }
      return true;
    }

    // 2. Update all references to the old IDs throughout the document
    console.log(`  Updating references to modified IDs...`);
    let referencesUpdatedCount = 0;
    const allElements = doc.getElementsByTagName("*"); // Get all elements

    for (let i = 0; i < allElements.length; i++) {
      const elem = allElements[i];
      const attributes = Array.from(elem.attributes); // Create a copy for iteration

      for (const attr of attributes) {
        let attrValue = attr.value;
        let valueChanged = false;

        // Check for url(#old_id) references
        for (const [oldId, newId] of Object.entries(idMap)) {
          const oldUrlRef = `url(#${oldId})`;
          const newUrlRef = `url(#${newId})`;
          if (attrValue.includes(oldUrlRef)) {
            attrValue = attrValue.split(oldUrlRef).join(newUrlRef); // Replace all occurrences
            valueChanged = true;
          }
        }

        // Check for #old_id references (e.g., xlink:href, href)
        if (attrValue.startsWith("#")) {
          const refId = attrValue.substring(1);
          if (idMap[refId]) {
            attrValue = `#${idMap[refId]}`;
            valueChanged = true;
          }
        }

        if (valueChanged) {
          elem.setAttribute(attr.name, attrValue); // Or setAttributeNS if needed
          referencesUpdatedCount++;
        }
      }
    }

    if (referencesUpdatedCount > 0) {
      console.log(`    Updated ${referencesUpdatedCount} references.`);
    } else {
      console.log(`    No references needed updating for the modified IDs.`);
    }

    const updatedSvgContent = serializer.serializeToString(doc);
    await fs.writeFile(svgFilePath, updatedSvgContent, "utf-8");
    console.log(`  Successfully processed and saved: ${svgFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing file ${svgFilePath}:`, error);
    return false;
  }
}

async function main() {
  const program = new Command();
  program
    .version("1.0.0")
    .description(
      "Batch process SVG files to ensure unique IDs within <defs> elements and update their references.",
    )
    .argument("<folderPath>", "Path to the folder containing SVG files.")
    .option(
      "--backup",
      "Create a .bak backup of original SVG files before modifying.",
    )
    .action(async (folderPathStr: string, options: { backup?: boolean }) => {
      const folderPath = path.resolve(folderPathStr); // Resolve to absolute path

      if (!(await fs.stat(folderPath).catch(() => null))?.isDirectory()) {
        console.error(
          `Error: Folder '${folderPath}' not found or is not a directory.`,
        );
        process.exit(1);
      }

      console.log(`Starting SVG ID processing in folder: ${folderPath}`);
      if (options.backup) {
        console.log(
          "Backup option is ENABLED. Original files will be copied with a .bak extension.",
        );
      } else {
        console.log(
          "Backup option is DISABLED. Files will be modified in place.",
        );
        console.log("Consider using --backup for safety.");
      }

      let processedCount = 0;
      let errorCount = 0;

      try {
        const files = await fs.readdir(folderPath);
        const svgFiles = files.filter((file) =>
          file.toLowerCase().endsWith(".svg"),
        );

        if (svgFiles.length === 0) {
          console.log(`No SVG files found in '${folderPath}'.`);
          return;
        }

        console.log(`Found ${svgFiles.length} SVG files to process.`);

        for (const filename of svgFiles) {
          const filePath = path.join(folderPath, filename);
          if (await processSvgFile(filePath, !!options.backup)) {
            processedCount++;
          } else {
            errorCount++;
          }
          console.log("--------------------"); // Separator
        }

        console.log(`\n--- Processing Summary ---`);
        console.log(`Total SVG files found: ${svgFiles.length}`);
        console.log(`Successfully processed: ${processedCount}`);
        if (errorCount > 0) {
          console.log(`Files with errors: ${errorCount}`);
        }
        console.log("Processing complete.");
      } catch (err) {
        console.error(`Error reading directory or processing files:`, err);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Unhandled error in main execution:", err);
    process.exit(1);
  });
}
