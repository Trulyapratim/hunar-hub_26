/**
 * Custom Node server — runs Next.js + Socket.io on the same HTTP port.
 * Required for real-time messaging (WebSockets do not work on serverless alone).
 *
 * Usage: npm run dev  |  npm run start
 */
import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setSocketServer } from "./src/lib/socket/io";
import { registerSocketHandlers } from "./src/lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin:
        process.env.NEXT_PUBLIC_APP_URL ?? `http://${hostname}:${port}`,
      credentials: true,
    },
  });

  setSocketServer(io);
  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> HunarHub ready on http://${hostname}:${port}`);
    console.log(`> Socket.io path: /api/socket/io`);
  });
});
