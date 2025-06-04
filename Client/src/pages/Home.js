import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  const roomRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = Math.floor(1000 + Math.random() * 9000);
    setRoomId(id);
    toast.success("Created a new room");
  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }
    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div
      id="bg"
      class="flex flex-col items-center justify-center min-h-screen
 bg-background"
    >
      <div class="max-w-md w-full space-y-4">
        <div class="text-center">
          <h1 class="text-white text-4xl font-bold text-foreground">
            Welcome To Wholesome
          </h1>
          <p class="text-white text-muted-foreground">
            Create or enter room Id and name to get started coding togeter.
          </p>
        </div>
        <div class="space-y-2">
          <input
            id="standard-basic"
            label="Room ID"
            variant="standard"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
            fullWidth
            sx={{ marginBottom: 2 }}
            inputRef={roomRef}
            InputLabelProps={{
              style: { color: "black" },
            }}
            className="Input"
            inputProps={{ className: "Input_label" }}
            class="flex h-10 rounded-md border border-input
 bg-background px-3 py-2 text-sm ring-offset-background file:border-0
 file:bg-transparent file:text-sm file:font-medium
 placeholder:text-muted-foreground focus-visible:outline-none
 focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 disabled:cursor-not-allowed
 disabled:opacity-50 w-full"
            placeholder="Enter Room Id"
            type="text"
            fdprocessedid="vxceq8"
          />
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
            class="flex h-10 rounded-md border border-input
 bg-background px-3 py-2 text-sm ring-offset-background file:border-0
 file:bg-transparent file:text-sm file:font-medium
 placeholder:text-muted-foreground focus-visible:outline-none
 focus-visible:ring-2 focus-visible:ring-ring
 focus-visible:ring-offset-2 disabled:cursor-not-allowed
 disabled:opacity-50 w-full"
            placeholder="Enter Your Name"
            type="text"
            fdprocessedid="vralm"
          />
        </div>
        <div class="flex justify-between gap-2">
          <button
            id="btn"
            onClick={joinRoom}
            class="bg-white inline-flex items-center justify-center
 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background
 transition-colors focus-visible:outline-none focus-visible:ring-2
 focus-visible:ring-ring focus-visible:ring-offset-2
 disabled:pointer-events-none disabled:opacity-50 bg-primary
 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1"
            type="submit"
            fdprocessedid="8ubaw"
          >
            Join Room
          </button>
          <button
            id="btn"
            onClick={createNewRoom}
            class="text-white inline-flex items-center justify-center
 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background
 transition-colors focus-visible:outline-none focus-visible:ring-2
focus-visible:ring-ring focus-visible:ring-offset-2
 disabled:pointer-events-none disabled:opacity-50 border border-input
 bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4
 py-2 flex-1"
            fdprocessedid="a1z59f"
          >
            Make Room
          </button>
        </div>
      </div>
    </div>
  );
};
export default Home;
