import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(serverUrl = "http://localhost:5000") {
    this.socket = io(serverUrl);
    
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return this;
  }

  startGame() {
    return new Promise((resolve, reject) => {
      this.socket.emit("start_game", {}, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  guessLetter(gameId, letter) {
    return new Promise((resolve, reject) => {
      this.socket.emit("guess", { game_id: gameId, letter }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Export as singleton
export default new SocketService();