# CodeCollab - Real-Time Collaborative Code Editor

A modern, industry-level real-time collaborative code editor built with React, Socket.io, and CodeMirror.

## ✨ Features

### 🎨 Modern UI/UX

- **Professional Design System**: Clean, modern interface with consistent typography and spacing
- **Dark Theme**: Beautiful gradient backgrounds with excellent contrast
- **Smooth Animations**: Framer Motion powered animations for enhanced user experience
- **Responsive Layout**: Optimized for different screen sizes
- **Glass Morphism Effects**: Modern visual effects with backdrop blur

### 🔧 Enhanced Editor Experience

- **Multi-Language Support**: JavaScript, Python, HTML, CSS, and C++
- **Real-time Collaboration**: See who's connected and collaborate instantly
- **Live Code Execution**: Run code directly in the browser
- **Status Indicators**: Visual feedback for connection and execution status
- **Loading States**: Professional loading animations and feedback
- **Keyboard Shortcuts**: Enhanced editor shortcuts for productivity

### 🚀 Advanced Features

- **Room Management**: Create or join rooms with unique IDs
- **User Avatars**: Visual representation of connected users
- **Copy Room ID**: Easy sharing of room IDs
- **Output Management**: Clear and organized code output display
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Real-time**: Socket.io Client
- **Code Editor**: CodeMirror 5
- **UI Components**: React Avatar, React Hot Toast
- **Styling**: Custom CSS with CSS Variables

## 🎯 Key Improvements

### Design System

- Consistent color palette with CSS variables
- Professional typography with Inter font
- Modern button and input styles
- Smooth transitions and hover effects

### User Experience

- Intuitive navigation and layout
- Clear visual hierarchy
- Helpful tooltips and status indicators
- Responsive design for all devices

### Performance

- Optimized animations
- Efficient state management
- Clean component architecture
- Minimal bundle size

## 🚀 Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📁 Project Structure

```
src/
├── Components/
│   ├── Editor.js          # Main editor component
│   ├── LoadingSpinner.js  # Loading animation component
│   └── StatusIndicator.js # Status indicator component
├── pages/
│   ├── Home.js           # Landing page
│   └── EditorPage.js     # Editor page wrapper
├── App.js                # Main app component
├── index.css             # Global styles and design system
└── Actions.js            # Socket actions constants
```

## 🎨 Design Features

### Color Palette

- Primary: Indigo (#6366f1)
- Background: Slate (#0f172a)
- Surface: Dark slate (#1e293b)
- Text: Light gray (#f8fafc)
- Accent: Purple (#8b5cf6)

### Typography

- Font Family: Inter, system fonts
- Code Font: JetBrains Mono
- Responsive font sizes
- Proper line heights and spacing

### Animations

- Page transitions with Framer Motion
- Button hover and tap animations
- Loading spinners and status indicators
- Smooth component mounting

## 🔧 Customization

The design system is built with CSS variables, making it easy to customize:

```css
:root {
  --primary: #6366f1;
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f8fafc;
  /* ... more variables */
}
```

## 📱 Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Adaptive typography
- Touch-friendly interactions

## 🎯 Future Enhancements

- [ ] File upload support
- [ ] Multiple file editing
- [ ] Git integration
- [ ] Code formatting
- [ ] Syntax highlighting themes
- [ ] User authentication
- [ ] Project templates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
