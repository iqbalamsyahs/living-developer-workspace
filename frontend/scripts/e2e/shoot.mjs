// Headless-Chrome driver over CDP (no dependencies; Node's global WebSocket).
// Usage: node scripts/e2e/shoot.mjs <outDir> [--w 1440] [--h 900] [--reduced-motion] [--url http://localhost:3000/] <step>...
// Step: `action[:arg]` or `name:action[:arg]`. Actions:
//   wait:<ms>  scroll:<px> (window.scrollTo)  wheel:<px> (real wheel event)
//   click:<x>,<y>  key:<Key>  eval:<js>  log  shot (writes <outDir>/<name>.png)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const opt = { w: 1440, h: 900, reduced: false, url: "http://localhost:3000/" };
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--w") opt.w = +argv[++i];
  else if (argv[i] === "--h") opt.h = +argv[++i];
  else if (argv[i] === "--url") opt.url = argv[++i];
  else if (argv[i] === "--reduced-motion") opt.reduced = true;
  else positional.push(argv[i]);
}
const [outDir, ...steps] = positional;
if (!outDir) throw new Error("usage: shoot.mjs <outDir> [options] <step>...");
mkdirSync(outDir, { recursive: true });

const ACTIONS = ["wait", "scroll", "wheel", "click", "key", "eval", "log", "shot"];
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
  await send("Page.navigate", { url: opt.url });

  for (const step of steps) {
    const parts = step.split(":");
    const named = !ACTIONS.includes(parts[0]);
    const [name, action, ...rest] = named ? parts : ["step", ...parts];
    const arg = rest.join(":");
    if (action === "wait") await sleep(+arg);
    else if (action === "scroll") await evaluate(`window.scrollTo(0, ${+arg})`);
    else if (action === "wheel") await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: opt.w / 2, y: opt.h / 2, deltaX: 0, deltaY: +arg });
    else if (action === "click") {
      const [x, y] = arg.split(",").map(Number);
      for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    } else if (action === "key") {
      for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: arg, code: arg });
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
