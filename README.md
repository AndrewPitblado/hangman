# HangMan Project

This is a real-time multiplayer Hangman game built with React (Vite) and Python WebSockets.


# Project Overview

This project implements a distributed Hangman game with a React front-end and Python WebSocket back-end. Players can start games, guess letters, and see real-time updates of their progress.

## Tech Stack

-   **Frontend:**  React with Vite
-   **Backend:**  Nodejs Socket.IO
-   **Communication:**  WebSockets for real-time bidirectional communication

## Project Structure
<pre>
hangman/
├── client/                       # React frontend
│   ├── src/                      # React source code
│   │   ├── components/           # UI components
│   │   │   ├── Game.jsx          # Main game component
|   |   |   |__ GameInterface.jsx #Client Interfacefor Multiplayer
│   │   │   ├── Hangman.jsx       # Hangman drawing component
│   │   │   ├── Keyboard.jsx      # Virtual keyboard component
│   │   │   └── WordDisplay.jsx   # Displays current word state
│   │   ├── services/
│   │   │   └── socket_Service.js  # WebSocket connection management
│   │   └── App.jsx               # Main application component
│   └── ...                       # Other Vite-generated files
│
├── server/                       # NodeJs WebSocket server
│   ├── server.js                 # Main NodeJs server
│   └── requirements.txt          # Server dependencies
</pre>
## Getting Started

### Prerequisites

-   Node.js (v16+)
-   Python (v3.8+)
-   npm or yarn

## Setup Instructions

- **Clone the repository**
```bash
git clone [repository-url]
cd hangman
```
- **Set up the Python backend**
In the terminal enter the following:
```bash
cd server
python -m venv venv
source venv/bin/activate 
 **On Windows use**: venv\Scripts\activate
pip install -r requirements.txt
```

- **Set up the React frontend**
```bash
cd ../client
npm install
```



## Running the Application

- **Start the backend server**
cd server
source venv/bin/activate 
 **On Windows use**: venv\Scripts\activate
python app.py

- **Start the frontend development server**
cd client
npm run dev
- **Start the NodeJS server**
  cd server
  node server.js
# Contributing

**Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

**Commit your changes**
```bash
git commit -m 'Add some amazing feature'
```

**Push to the branch**
```bash
git push origin feature/amazing-feature
```

## WebSocket Events

- Keeping Websocket Events consistent between client and server
- Follow the component structure for UI elements

|Event                |Description                          |Payload                         |
|----------------|-------------------------------|-----------------------------|
|start_game|`Initializes a new game`            |{ }            |
|guess          |`Submit a letter guess`            |{game_id: string,letter:string}            |


