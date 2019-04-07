importScripts("/flow.js");

import fs from "fs";

const core = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/core.js",
  "utf8"
);

const bom = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/bom.js",
  "utf8"
);

const cssom = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/cssom.js",
  "utf8"
);

const indexeddb = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/indexeddb.js",
  "utf8"
);

const intl = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/intl.js",
  "utf8"
);

const node = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/node.js",
  "utf8"
);

const react = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/react.js",
  "utf8"
);

const reactDom = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/react-dom.js",
  "utf8"
);

const serviceWorkers = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/serviceworkers.js",
  "utf8"
);

const streams = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/streams.js",
  "utf8"
);

const wasm = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/webassembly.js",
  "utf8"
);

const dom = fs.readFileSync(
  "./node_modules/@goodmind/flow-js/flowlib/dom.js",
  "utf8"
);

let flowCache;
async function getFlow(version) {
  if (!flowCache) {
    flow.registerFile("/static/bom.js", bom);
    flow.registerFile("/static/core.js", core);
    flow.registerFile("/static/cssom.js", cssom);
    flow.registerFile("/static/dom.js", dom);
    flow.registerFile("/static/indexeddb.js", indexeddb);
    flow.registerFile("/static/intl.js", intl);
    flow.registerFile("/static/node.js", node);
    flow.registerFile("/static/react.js", react);
    flow.registerFile("/static/react-dom.js", reactDom);
    flow.registerFile("/static/streams.js", streams);
    flow.registerFile("/static/serviceworkers.js", serviceWorkers);
    flow.registerFile("/static/webassembly.js", wasm);

    flow.setLibs([
      "/static/bom.js",
      "/static/core.js",
      "/static/cssom.js",
      "/static/dom.js",
      "/static/indexeddb.js",
      "/static/intl.js",
      "/static/node.js",
      "/static/react.js",
      "/static/react-dom.js",
      "/static/streams.js",
      "/static/serviceworkers.js",
      "/static/webassembly.js"
    ]);
    flowCache = flow;
  }
  return flowCache;
}

onmessage = e => {
  const data = e.data;
  switch (data.type) {
    // preload flow. optional, but makes sure flow is ready
    case "init":
      getFlow(data.version)
        .then(function() {
          postMessage({ id: data.id, type: "init", result: true });
        })
        ["catch"](function(e) {
          postMessage({ id: data.id, type: "init", err: e });
        });
      return;
    case "checkContent":
      getFlow(data.version)
        .then(function(flow) {
          var result = flow.checkContent(data.filename, data.body);
          postMessage({ id: data.id, type: "checkContent", result: result });
        })
        ["catch"](function(e) {
          postMessage({ id: data.id, type: "checkContent", err: e });
        });
      return;
    case "typeAtPos":
      getFlow(data.version)
        .then(function(flow) {
          var result = flow.typeAtPos(
            data.filename,
            data.body,
            data.line,
            data.col
          );
          postMessage({ id: data.id, type: "typeAtPos", result: result });
        })
        ["catch"](function(e) {
          postMessage({ id: data.id, type: "typeAtPos", err: e });
        });
      return;
    case "supportsParse":
      getFlow(data.version)
        .then(function(flow) {
          var result = flow.parse != null;
          postMessage({ id: data.id, type: "supportsParse", result: result });
        })
        ["catch"](function(e) {
          postMessage({ id: data.id, type: "supportsParse", err: e });
        });
      return;
    case "parse":
      getFlow(data.version)
        .then(function(flow) {
          var result = flow.parse(data.body, data.options);
          postMessage({ id: data.id, type: "parse", result: result });
        })
        ["catch"](function(e) {
          postMessage({ id: data.id, type: "parse", err: e });
        });
      return;
    default:
      throw new Error("Unknown message type: " + data.type);
  }
};
