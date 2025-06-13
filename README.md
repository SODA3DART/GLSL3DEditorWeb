# GLSL Shader Editor Web

A web-based GLSL shader editor with 2D, 3D, and AR modes.

## Features

- Edit GLSL shaders with syntax highlighting
- Real-time preview of shader effects
- Multiple rendering modes:
  - 2D mode for fragment shaders
  - 3D mode for rendering on 3D objects (cube, sphere, or custom OBJ models)
  - AR mode for viewing your shader effects in augmented reality on supported devices
- Upload custom OBJ models
- Auto-compile option for real-time updates

## AR Mode Requirements

To use the AR mode, you need:
- A device with AR capabilities (most modern smartphones and tablets)
- A browser that supports WebXR (Chrome, Edge, or Firefox on Android)
- Permission to access the camera

Note: iOS devices require using Safari and may have limited WebXR support.

## How to Use AR Mode

1. Click the "AR" button in the top menu or the "AR Mode" button at the bottom of the screen
2. Grant camera permissions when prompted
3. Point your device at a flat surface
4. The 3D object with your shader will appear on detected surfaces
5. To exit AR mode, click the "2D Mode" or "3D Mode" button

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
