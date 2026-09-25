import http from "node:http";
import { spawn } from "node:child_process";

const PORT = parseInt(process.env.PORT || "8080", 10);
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "opencode/ling-3.0-flash-fin-free";
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY?.trim() || "";

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Health check endpoint for Koyeb / Render
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/healthz")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ok",
      service: "opencode-zen-bridge",
      defaultModel: DEFAULT_MODEL,
      uptime: process.uptime(),
      time: new Date().toISOString()
    }));
  }

  // Model list endpoint
  if (req.method === "GET" && (url.pathname === "/v1/models" || url.pathname === "/models")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      object: "list",
      data: [
        { id: "opencode/ling-3.0-flash-fin-free", object: "model", owned_by: "opencode-zen" },
        { id: "opencode/mimo-v2.6-flash-free", object: "model", owned_by: "opencode-zen" },
        { id: "opencode/muse-spark-1.3-contributor-free", object: "model", owned_by: "opencode-zen" },
        { id: "opencode/nemotron-3.5-lightning-free", object: "model", owned_by: "opencode-zen" }
      ]
    }));
  }

  // Optional authentication check
  if (BRIDGE_API_KEY) {
    const authHeader = req.headers["authorization"] || "";
    const expected = `Bearer ${BRIDGE_API_KEY}`;
    if (authHeader !== expected) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: { message: "Unauthorized: Invalid bridge API key" } }));
    }
  }

  // OpenAI-compatible Chat Completions
  if (req.method === "POST" && (url.pathname === "/v1/chat/completions" || url.pathname === "/chat/completions")) {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const model = payload.model && payload.model.startsWith("opencode/")
          ? payload.model
          : DEFAULT_MODEL;

        let combinedPrompt = "";
        if (Array.isArray(payload.messages)) {
          const systemParts = payload.messages.filter(m => m.role === "system").map(m => m.content);
          const userParts = payload.messages.filter(m => m.role === "user").map(m => m.content);
          combinedPrompt = [...systemParts, ...userParts].join("\n\n");
        } else if (payload.prompt) {
          combinedPrompt = String(payload.prompt);
        }

        console.log(`[Bridge] Request received (${combinedPrompt.length} chars) -> model: ${model}`);

        const child = spawn("opencode", [
          "run",
          "-m", model,
          "--pure",
          "--format", "json",
          combinedPrompt
        ], {
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, NO_COLOR: "1" }
        });

        let outputText = "";
        let errorOutput = "";
        let lineBuffer = "";

        child.stdout.on("data", (data) => {
          lineBuffer += data.toString();
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
            try {
              const event = JSON.parse(trimmed);
              if (event.type === "text" && event.part?.text) {
                outputText += event.part.text;
              }
            } catch {}
          }
        });

        child.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        const timer = setTimeout(() => {
          console.warn("[Bridge] Execution reached 55s ceiling; terminating process.");
          child.kill("SIGKILL");
        }, 55000);

        child.on("close", (code) => {
          clearTimeout(timer);

          if (lineBuffer.trim().startsWith("{") && lineBuffer.trim().endsWith("}")) {
            try {
              const event = JSON.parse(lineBuffer.trim());
              if (event.type === "text" && event.part?.text) {
                outputText += event.part.text;
              }
            } catch {}
          }

          let cleanContent = outputText.trim();
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }

          if (code !== 0 && !cleanContent) {
            console.error(`[Bridge] OpenCode exited with code ${code}:`, errorOutput);
            res.writeHead(502, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
              error: { message: `OpenCode CLI exited with code ${code}`, details: errorOutput }
            }));
          }

          console.log(`[Bridge] Generated response length: ${cleanContent.length} chars`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            id: `chatcmpl-zen-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
              index: 0,
              message: {
                role: "assistant",
                content: cleanContent
              },
              finish_reason: "stop"
            }],
            usage: {
              prompt_tokens: Math.ceil(combinedPrompt.length / 4),
              completion_tokens: Math.ceil(cleanContent.length / 4),
              total_tokens: Math.ceil((combinedPrompt.length + cleanContent.length) / 4)
            }
          }));
        });

        child.on("error", (err) => {
          clearTimeout(timer);
          console.error(`[Bridge] Process spawn error:`, err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: err.message } }));
        });

      } catch (err) {
        console.error(`[Bridge] Payload error:`, err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: err.message } }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Endpoint not found" } }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Bridge] OpenCode Zen Bridge listening on port ${PORT}`);
});
