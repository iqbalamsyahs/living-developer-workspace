// Headless-Chrome driver over CDP (no dependencies; Node's global WebSocket).
// Usage: node scripts/e2e/shoot.mjs <outDir> [--w 1440] [--h 900] [--reduced-motion] [--no-webgl] [--url http://localhost:3000/] <step>...
// Step: `action[:arg]` or `name:action[:arg]`. Actions:
//   wait:<ms>  scroll:<px> (window.scrollTo)  wheel:<px> (real wheel event at centre)  wheelat:<x>,<y>,<px>
//   resize:<w>x<h>  click:<x>,<y>  drag:<x1>,<y1>,<x2>,<y2> (stays pressed until `release`)  release  key:<Key>  eval:<js>  log  shot (writes <outDir>/<name>.png)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const opt = { w: 1440, h: 900, reduced: false, noWebgl: false, url: "http://localhost:3000/" };
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--w") opt.w = +argv[++i];
  else if (argv[i] === "--h") opt.h = +argv[++i];
  else if (argv[i] === "--url") opt.url = argv[++i];
  else if (argv[i] === "--reduced-motion") opt.reduced = true;
  else if (argv[i] === "--no-webgl") opt.noWebgl = true;
  else positional.push(argv[i]);
}
const [outDir, ...steps] = positional;
if (!outDir) throw new Error("usage: shoot.mjs <outDir> [options] <step>...");
mkdirSync(outDir, { recursive: true });

const ACTIONS = ["wait", "scroll", "wheel", "wheelat", "click", "drag", "release", "resize", "key", "eval", "log", "shot"];
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9400 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "about:blank"],
  { stdio: "ignore" },
);

try {
  let tabs;
  for (let i = 0; i < 30 && !tabs; i++) {
    await sleep(300);
    tabs = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json()).catch(() => undefined);
  }
  const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  let glb = 0;
  let lastDrag = { x: 0, y: 0 };
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.method === "Network.requestWillBeSent" && d.params.request.url.includes(".glb")) glb++;
    pending.get(d.id)?.(d);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.result?.value;

  await send("Page.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: opt.w, height: opt.h, deviceScaleFactor: 1, mobile: opt.w < 500 });
  if (opt.reduced) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  if (opt.noWebgl) await send("Page.addScriptToEvaluateOnNewDocument", { source: "HTMLCanvasElement.prototype.getContext = () => null;" });
  await send("Page.navigate", { url: opt.url });

  for (const step of steps) {
    const parts = step.split(":");
    const named = !ACTIONS.includes(parts[0]);
    const [name, action, ...rest] = named ? parts : ["step", ...parts];
    const arg = rest.join(":");
    if (action === "wait") await sleep(+arg);
    else if (action === "scroll") await evaluate(`window.scrollTo(0, ${+arg})`);
    else if (action === "wheel") await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: opt.w / 2, y: opt.h / 2, deltaX: 0, deltaY: +arg });
    else if (action === "wheelat") {
      const [x, y, dy] = arg.split(",").map(Number);
      await send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: dy });
    } else if (action === "resize") {
      const [w, h] = arg.split("x").map(Number);
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    } else if (action === "click") {
      const [x, y] = arg.split(",").map(Number);
      for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    } else if (action === "drag") {
      const [x1, y1, x2, y2] = arg.split(",").map(Number);
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1, y: y1 });
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: x1, y: y1, button: "left", buttons: 1, clickCount: 1 });
      for (let i = 1; i <= 10; i++) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x1 + ((x2 - x1) * i) / 10, y: y1 + ((y2 - y1) * i) / 10, button: "left", buttons: 1 });
      lastDrag = { x: x2, y: y2 };
    } else if (action === "release") {
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: lastDrag.x, y: lastDrag.y, button: "left", clickCount: 1 });
    } else if (action === "key") {
      const vk = { Escape: 27, Enter: 13, Tab: 9, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 }[arg];
      for (const type of ["rawKeyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: arg, code: arg, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    } else if (action === "eval") console.log(name, "=>", JSON.stringify(await evaluate(arg)));
    else if (action === "log") console.log(name, `scrollY=${await evaluate("window.scrollY")} glbRequests=${glb}`);
    else if (action === "shot") {
      const r = await send("Page.captureScreenshot", { format: "png" });
      const file = join(outDir, `${name}.png`);
      writeFileSync(file, Buffer.from(r.result.data, "base64"));
      console.log("wrote", file);
    } else throw new Error(`unknown step: ${step}`);
  }
  ws.close();
} finally {
  chrome.kill();
}
