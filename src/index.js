//@flow

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

const workerRegistry = {};
class FlowWorker {
  constructor(version) {
    this._version = version;
    this._pending = {};
    this._index = 0;

    const worker = (this._worker = new Worker("./worker.js"));
    worker.onmessage = ({ data }) => {
      if (data.id && this._pending[data.id]) {
        if (data.err) {
          this._pending[data.id].reject(data.err);
        } else {
          this._pending[data.id].resolve(data.result);
        }
        delete this._pending[data.id];
      }
    };
    worker.onerror = function() {
      console.log("There is an error with your worker!");
    };

    // keep a reference to the worker, so that it doesn't get GC'd and killed.
    workerRegistry[version] = worker;
  }

  send(data) {
    const id = ++this._index;
    const version = this._version;
    this._pending[id] = new Deferred();
    this._worker.postMessage({ id, version, ...data });
    return this._pending[id].promise;
  }
}

async function main() {
  const worker = new FlowWorker("latest");

  console.log("main");

  console.log("init");
  await worker.send({ type: "init" });
  console.log("init done");

  const errors = await worker.send({
    type: "checkContent",
    filename: "-",
    body: `/* @flow */

function foo(x: ?number): string {
  if (x) {
    return x;
  }
  return "default string";
}
`
  });
  console.error(errors);

  console.log("main done");
}

main();
