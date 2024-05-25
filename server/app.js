import express, { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const secretKeyJWT = "adjkdjkdahjaaks";
const port = 3000;

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Remove the trailing slash
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173", // Remove the trailing slash
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/login", (_req: Request, res: Response) => {
  const token = jwt.sign({ _id: "adjkdjkdahjaaks" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

interface DecodedToken {
  _id: string;
}

io.use((socket: Socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKeyJWT) as DecodedToken;
    next();
  });
});

io.on("connection", (socket: Socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }: { room: string; message: string }) => {
    console.log({ room, message });
    io.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room: string) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
