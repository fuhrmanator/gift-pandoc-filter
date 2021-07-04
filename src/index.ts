#!/usr/bin/env ts-node-script


import { parse, GIFTQuestion } from "gift-pegjs"
import {
    stdio,
    Para,
    RawBlock,
    Image,
    Str,
    PandocMetaMap
} from "pandoc-filter";
import { promisify } from "util";
import { exec as sysExec } from "child_process"
const exec = promisify(sysExec);
const { spawn } = require('promisify-child-process');


async function convertMarkdownToFormat(theMarkdown: string, format: string) {
    const pandoc = spawn('pandoc', ['--eol=lf', '--extract-media=tmp', '--from', 'markdown', '--to', format], {maxBuffer: 200 * 1024})
    pandoc.stdin.write(theMarkdown);
    pandoc.stdin.end();

    let result = "";
    pandoc.stdout.on('data', (data: string) => {
        // console.error(`Received chunk ${data}`);
        result = data;
    });
    const { stderr } = await pandoc;
    return result;
}

stdio(async (ele, _format, meta) => {
    //    console.error(meta);
    let result: any;
    if (ele.t === `CodeBlock`) {
        const [headers, content] = ele.c;
        const [, [language]] = headers;
        if (language === "gift") {
            const questions: GIFTQuestion[] = parse(content);
            // const id = headers[0];
            let theMarkdown: string = "";
            questions.forEach(question => {
                switch (question.type) {
                    case "MC":
                        // Use "pandoc" markdown, e.g., fancy_list
                        theMarkdown += '\n\n#. ' + question.stem.text + '\n\n';
                        question.choices.forEach(choice => {
                            theMarkdown += "   A.  " + choice.text.text + '\n';
                        });
                        break;
                    default:
                        break;
                }
            });
            if (_format !== 'markdown') {
                const convertedMarkdown = await convertMarkdownToFormat(theMarkdown, _format);
                // console.error(`result of conversion to ${_format}: ${convertedMarkdown}`)
                result = RawBlock(_format, '\n' + convertedMarkdown);
            } else {
                result = RawBlock(_format, theMarkdown);
            }

            return result;
        } else { return }
    } else { return }
});

// const getInlineImage = (
//   response: IArgdownResponse,
//   format: "svg" | "png" | "jpg" | "webp"
// ) => {
//   const inlineFormat = format == "svg" ? "svg+xml" : format;
//   let result = response[format]!;
//   if (typeof result === "string" || result instanceof String) {
//     result = Buffer.from(result);
//   }
//   return `data:image/${inlineFormat};base64,${result.toString("base64")}`;
// };
// const getProcess = (settings: IArgdownFilterSettings) => {
//   const process = [
//     "parse-input",
//     "build-model",
//     "build-map",
//     "transform-closed-groups",
//     "colorize",
//     "export-dot",
//     "export-svg"
//   ];
//   if (settings.format !== "svg") {
//     process.push(`export-${settings.format}`);
//   }
//   if (settings.mode == "file") {
//     process.push(`save-as-${settings.format}`);
//   } else if (settings.mode == "web-component") {
//     process.push("highlight-source", "export-web-component");
//   }
//   return process;
// };
// const getPandocImage = (
//   settings: IArgdownFilterSettings,
//   imagePath: string,
//   id: string
// ) => {
//   const caption = settings.caption || "";
//   const attr: [string, string][] = [];
//   if (settings.width) {
//     attr.push(["width", settings.width.toString()]);
//   }
//   if (settings.height) {
//     attr.push(["height", settings.height.toString()]);
//   }
//   const fig = `fig:${settings.caption}`;
//   return Para([Image([id, [], attr], [Str(caption)], [imagePath, fig])]);
// };


//////////////////////

// import { argdown, IArgdownRequest } from "@argdown/node";
// import { IArgdownResponse } from "@argdown/core";
// import defaultsDeep from "lodash.defaultsdeep";
// import { mergeDefaults } from "@argdown/core";
// import { tryToInstallImageExport } from "./tryToInstallImageExport";

// let imageCounter = 1;
// let webComponentCount = 0;
// let loadedConfig: IArgdownRequest;
// let settings: IArgdownFilterSettings;
// const getFilterSettings = (meta: PandocMetaMap) => {
//   if (!settings) {
//     settings = {};
//     const argdownMeta = meta["argdown"];
//     if (argdownMeta && argdownMeta.t === "MetaMap") {
//       for (var entry of Object.entries(argdownMeta.c)) {
//         const value = entry[1];
//         if (
//           value.t === "MetaInlines" &&
//           Array.isArray(value.c) &&
//           typeof value.c[0].c === "string"
//         ) {
//           (<any>settings)[entry[0]] = value.c[0].c;
//         }
//       }
//     }
//     settings = mergeDefaults(settings, {
//       caption: "",
//       mode: "inline",
//       format: "svg"
//     });
//   }
//   return settings;
// };
// const getArgdownConfig = async (configPath?: string) => {
//   if (!loadedConfig) {
//     let pathToConfig;
//     if (configPath) {
//       pathToConfig = path.resolve(process.cwd(), configPath);
//     } else {
//       pathToConfig = path.resolve(process.cwd(), "argdown.config.json");
//     }
//     loadedConfig = await argdown.loadConfig(pathToConfig);
//     if (!loadedConfig) {
//       loadedConfig = {};
//     }
//   }
//   return loadedConfig;
// };
// export interface IArgdownFilterSettings {
//   caption?: string;
//   width?: number;
//   height?: number;
//   mode?: "inline" | "file" | "web-component";
//   format?: "svg" | "png" | "jpg" | "webp";
//   config?: string;
//   sourceHighlighter?: "web-component";
// }