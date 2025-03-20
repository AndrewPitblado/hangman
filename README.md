# HangMan Project

This is a real-time multiplayer Hangman game built with React (Vite) and Python WebSockets.


# Project Overview

This project implements a distributed Hangman game with a React front-end and Python WebSocket back-end. Players can start games, guess letters, and see real-time updates of their progress.

## Tech Stack

-   **Frontend:**  React with Vite
-   **Backend:**  Python Flask with Socket.IO
-   **Communication:**  WebSockets for real-time bidirectional communication

## Project Structure

hangman/
├── client/                       # React frontend
│   ├── src/                      # React source code
│   │   ├── components/           # UI components
│   │   │   ├── Game.jsx          # Main game component
│   │   │   ├── Hangman.jsx       # Hangman drawing component
│   │   │   ├── Keyboard.jsx      # Virtual keyboard component
│   │   │   └── WordDisplay.jsx   # Displays current word state
│   │   ├── services/
│   │   │   └── socketService.js  # WebSocket connection management
│   │   └── App.jsx               # Main application component
│   └── ...                       # Other Vite-generated files
│
├── server/                       # Python WebSocket server
│   ├── app.py                    # Main server entry point
│   ├── game_logic.py             # Game state and hangman logic
│   ├── word_dictionary.py        # Word selection functionality
│   ├── socket_handlers.py        # WebSocket event handlers
│   └── requirements.txt          # Server dependencies

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   Python (v3.8+)
-   npm or yarn

## Setup Instructions

- **Clone the repository**
git clone [repository-url]
cd hangman

- **Set up the Python backend**
In the terminal enter the following:
cd server
python -m venv venv
source venv/bin/activate 
 **On Windows use**: venv\Scripts\activate
pip install -r requirements.txt

- **Set up the React frontend**
cd ../client
npm install



## Running the Application

- **Start the backend server**
cd server
source venv/bin/activate 
 **On Windows use**: venv\Scripts\activate
python app.py

- **Start the frontend development server**
cd client
npm run dev

# Contributing

**Create a feature branch**
- (`git checkout -b feature/amazing-feature`)

**Commit your changes**
- (git commit -m 'Add some amazing feature')

**Push to the branch**
- (git push origin feature/amazing-feature)


## Open a file

You can open a file from **Google Drive**, **Dropbox** or **GitHub** by opening the **Synchronize** sub-menu and clicking **Open from**. Once opened in the workspace, any modification in the file will be automatically synced.

## Save a file

You can save any file of the workspace to **Google Drive**, **Dropbox** or **GitHub** by opening the **Synchronize** sub-menu and clicking **Save on**. Even if a file in the workspace is already synced, you can save it to another location. StackEdit can sync one file with multiple locations and accounts.




## Publish a File

You can publish your file by opening the **Publish** sub-menu and by clicking **Publish to**. For some locations, you can choose between the following formats:

- Markdown: publish the Markdown text on a website that can interpret it (**GitHub** for instance),
- HTML: publish the file converted to HTML via a Handlebars template (on a blog for example).





## WebSocket Events

- Keeping Websocket Events consistent between client and server
- Follow the component structure for UI elements

|Event                |Description                          |Payload                         |
|----------------|-------------------------------|-----------------------------|
|start_game|`Initializes a new game`            |{ }            |
|guess          |`Submit a letter guess`            |{game_id: string,letter:string}            |


