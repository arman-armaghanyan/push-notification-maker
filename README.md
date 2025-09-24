# Push Notification Designer

A clean, modern web application for creating beautiful 1200×600 PNG images for push notifications.

## ✨ Features

- **Simple Interface**: Clean, intuitive design with no clutter
- **Two Modes**: 
  - Pre-designed SVG shapes library
  - Custom image upload (PNG, JPG, SVG)
- **Smart Positioning**: Click and drag directly on canvas to position elements
- **Live Preview**: Real-time canvas updates as you make changes
- **Color Customization**: 
  - Background color picker
  - SVG shape color customization
- **Auto-centering**: Elements are automatically centered when added
- **Responsive Design**: Works beautifully on all screen sizes

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

## 🎨 How to Use

1. **Choose Mode**: Select between SVG shapes or upload your own image
2. **Add Element**: Click a shape or upload an image
3. **Position**: Click and drag directly on the canvas to position
4. **Customize**: Adjust background and shape colors
5. **Export**: Click "Export PNG" to download your design

## 🛠️ Technologies

- React 18
- Tailwind CSS for styling
- react-dropzone for file uploads
- @uiw/react-color for color picking
- HTML5 Canvas for image generation

## 📱 Design Principles

- **Minimal UI**: Focused on essential features only
- **Visual Hierarchy**: Clear distinction between primary and secondary actions
- **Instant Feedback**: Hover states, active states, and smooth transitions
- **Direct Manipulation**: Click and drag on canvas for intuitive positioning
- **Consistent Spacing**: Uses a systematic spacing scale
- **Modern Aesthetics**: Clean shadows, rounded corners, and subtle animations

## 🏗️ Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.