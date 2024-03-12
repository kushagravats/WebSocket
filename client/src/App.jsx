/* eslint-disable react/jsx-no-undef */
// @ts-nocheck
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Container, Typography, TextField, Button, Stack } from '@mui/material';

const App = () => {
  const socket = useMemo(() => io('http://localhost:3000', { withCredentials: true }), []);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [socketID, setSocketId] = useState('');
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { message, room });
    setMessage('');
    setRoom('');
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit('join-room', roomName);
    setRoomName('');
  };

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
      console.log('connected', socket.id);
    });

    socket.on('receive-message', (data) => {
      console.log(data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('welcome', (s) => {
      console.log(s);
    });

    // Cleanup function to disconnect the socket when the component unmounts or is not in view
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h1" component="div" gutterBottom>
        Welcome to Socket.io
      </Typography>

      <Typography variant="h6" component="div" gutterBottom>
        {socketID}
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <Typography variant="h5" component="div" gutterBottom>
          Join Room
        </Typography>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id="outlined-basic"
          label="Room Name"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Join
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <Typography variant="h5" component="div" gutterBottom>
          Send Message
        </Typography>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Message"
          variant="outlined"
        />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          id="outlined-basic"
          label="Room"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>

      <Stack>
        {messages.map((m, i) => (
          <Typography key={i} variant="h6" component="div" gutterBottom>
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
