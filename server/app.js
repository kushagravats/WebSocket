import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
// @ts-ignore
import { Socket } from "dgram";
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

// @ts-ignore
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// @ts-ignore
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "adjkdjkdahjaaks" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

// @ts-ignore
const user = false;

io.use((socket, next) => {
  // @ts-ignore
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    // @ts-ignore
    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication Error"));

    // @ts-ignore
    const decoded = jwt.verify(token, secretKeyJWT);
    next();
  });
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });
    io.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (room) => {
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
