# 🚀 Real-Time Collaborative Code Editor

A powerful real-time collaborative code editor that allows multiple users to code together simultaneously. Built with modern web technologies and real-time communication features.

## ✨ Features

- 👥 Real-time collaboration with multiple users
- 💻 Support for multiple programming languages:
  - JavaScript (with live execution)
  - Python (with server-side execution)
  - C++ (with server-side compilation and execution)
  - HTML (with live preview)
  - CSS (syntax highlighting)
- 🎨 Beautiful and modern UI
- 🔄 Live code synchronization
- 👤 User presence indicators
- 🏃‍♂️ Code execution capabilities
- 🌙 Dark theme support

## 🛠️ Tech Stack

### Frontend

- ⚛️ React.js - UI Framework
- 🎨 Tailwind CSS - Styling
- 📝 CodeMirror - Code Editor
- 🔌 Socket.io-client - Real-time communication
- 👤 React Avatar - User avatars
- 🎯 React Router - Navigation
- 🔔 React Hot Toast - Notifications

### Backend

- 🚀 Node.js - Runtime environment
- 🌐 Express.js - Web framework
- 🔌 Socket.io - Real-time communication
- 🔒 CORS - Cross-origin resource sharing
- 📦 Child Process - Code execution
- 📁 File System - Temporary file management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.x (for Python execution)
- G++ compiler (for C++ execution)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/real-time-code-editor.git
cd real-time-code-editor
```

2. Install server dependencies:

```bash
cd Server
npm install
```

3. Install client dependencies:

```bash
cd ../Client/my-app
npm install
```

4. Start the server:

```bash
cd ../../Server
npm start
```

5. Start the client:

```bash
cd ../Client/my-app
npm start
```

## 💻 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your username and create/join a room
3. Share the room ID with your collaborators
4. Start coding together in real-time!

### Supported Languages

#### JavaScript

```javascript
// Example code
function hello() {
  console.log("Hello, World!");
}
hello();
```

#### Python

```python
# Example code
def hello():
    print("Hello, World!")
hello()
```

#### C++

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

#### HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the Server directory:

```env
PORT=5000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- CodeMirror for the amazing code editor
- Socket.io for real-time communication
- React team for the incredible framework
- All contributors who have helped shape this project

If you encounter any issues or have questions, please open an issue in the GitHub repository.

---

Made with ❤️ by Mithilesh Deore
