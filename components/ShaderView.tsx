
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWebGLRenderer } from '../hooks/useWebGLShader'; // Updated import path
import { RenderMode, ModelData, CameraState, TextureInfo } from '../types';

interface ShaderViewProps {
  vertexShaderSource: string;
  fragmentShaderCode: string;
  renderMode: RenderMode;
  currentModelData: ModelData | null;
  onCompilationError: (error: string | null) => void;
  cameraState: CameraState;
  onCameraChange: (newState: CameraState | ((prevState: CameraState) => CameraState)) => void;
  textures?: TextureInfo[];
}

export const ShaderView: React.FC<ShaderViewProps> = ({
  vertexShaderSource,
  fragmentShaderCode,
  renderMode,
  currentModelData,
  onCompilationError,
  cameraState,
  onCameraChange,
  textures,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { error: shaderError } = useWebGLRenderer({
    canvasRef,
    vertexShaderSource,
    fragmentShaderSource: fragmentShaderCode,
    renderMode,
    modelData: currentModelData,
    cameraState,
    textures,
  });

  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // For keyboard controls
  const keysPressed = useRef<Set<string>>(new Set());
  const keyAnimationFrameId = useRef<number | null>(null);

  useEffect(() => {
    onCompilationError(shaderError);
  }, [shaderError, onCompilationError]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D') return;

    // Prevent default behavior for all mouse buttons in 3D mode
    event.preventDefault();

    // Detect right-click (button 2) for panning
    if (event.button === 2) {
      isPanningRef.current = true;
      isDraggingRef.current = false;
      event.currentTarget.style.cursor = 'move';
    } else {
      isPanningRef.current = false;
      isDraggingRef.current = true;
      event.currentTarget.style.cursor = 'grabbing';
    }

    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, [renderMode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D' || (!isDraggingRef.current && !isPanningRef.current) || !lastMousePositionRef.current) return;

    // Prevent default to avoid any browser-specific behaviors
    event.preventDefault();

    const dx = event.clientX - lastMousePositionRef.current.x;
    const dy = event.clientY - lastMousePositionRef.current.y;

    // Only process significant movements to avoid jitter
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

    if (isDraggingRef.current) {
      // Rotation (left-click drag)
      onCameraChange(prevState => {
        const newAngleY = prevState.angleY + dx * 0.005; // Adjust sensitivity
        let newAngleX = prevState.angleX - dy * 0.005;   // Adjust sensitivity
        // Clamp angleX to avoid flipping
        newAngleX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, newAngleX));
        return { ...prevState, angleX: newAngleX, angleY: newAngleY };
      });
    } else if (isPanningRef.current) {
      // Panning (right-click drag)
      onCameraChange(prevState => {
        // Scale panning based on distance to make it feel more natural
        const panScale = 0.005 * prevState.distance;
        const newPanX = prevState.panX + dx * panScale;
        const newPanY = prevState.panY - dy * panScale; // Invert Y for natural panning
        return { ...prevState, panX: newPanX, panY: newPanY };
      });
    }

    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, [renderMode, onCameraChange]);

  const handleMouseUpOrLeave = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D') return;

    // Prevent default browser behavior
    if (event.type === 'mouseup') {
      event.preventDefault();
    }

    // Reset states
    isDraggingRef.current = false;
    isPanningRef.current = false;
    lastMousePositionRef.current = null;

    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  }, [renderMode]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D') return;
    event.preventDefault();
    const zoomSensitivity = 0.001;
    onCameraChange(prevState => {
      const newDistance = Math.max(0.5, Math.min(20, prevState.distance + event.deltaY * zoomSensitivity * prevState.distance));
      return { ...prevState, distance: newDistance };
    });
  }, [renderMode, onCameraChange]);

  // Set cursor style based on render mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && renderMode === '3D') {
      canvas.style.cursor = 'grab';
    } else if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, [renderMode]);

  // Add global mouse event listeners to handle mouse movements outside the canvas
  useEffect(() => {
    if (renderMode !== '3D') return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if ((!isDraggingRef.current && !isPanningRef.current) || !lastMousePositionRef.current) return;

      const dx = e.clientX - lastMousePositionRef.current.x;
      const dy = e.clientY - lastMousePositionRef.current.y;

      // Only process significant movements to avoid jitter
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      if (isDraggingRef.current) {
        // Rotation (left-click drag)
        onCameraChange(prevState => {
          const newAngleY = prevState.angleY + dx * 0.005; // Adjust sensitivity
          let newAngleX = prevState.angleX - dy * 0.005;   // Adjust sensitivity
          // Clamp angleX to avoid flipping
          newAngleX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, newAngleX));
          return { ...prevState, angleX: newAngleX, angleY: newAngleY };
        });
      } else if (isPanningRef.current) {
        // Panning (right-click drag)
        onCameraChange(prevState => {
          // Scale panning based on distance to make it feel more natural
          const panScale = 0.005 * prevState.distance;
          const newPanX = prevState.panX + dx * panScale;
          const newPanY = prevState.panY - dy * panScale; // Invert Y for natural panning
          return { ...prevState, panX: newPanX, panY: newPanY };
        });
      }

      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current || isPanningRef.current) {
        isDraggingRef.current = false;
        isPanningRef.current = false;
        lastMousePositionRef.current = null;

        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }
    };

    // Add global event listeners
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [renderMode, onCameraChange]);


  // Prevent context menu on right-click
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode === '3D') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, [renderMode]);

  // Add a global event listener to prevent context menu in 3D mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && renderMode === '3D') {
      const preventContextMenu = (e: Event) => {
        e.preventDefault();
        return false;
      };

      canvas.addEventListener('contextmenu', preventContextMenu);

      return () => {
        canvas.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [renderMode]);

  // Add keyboard controls for WASD+EQ movement
  useEffect(() => {
    if (renderMode !== '3D') {
      // Clean up any existing animation frame
      if (keyAnimationFrameId.current !== null) {
        cancelAnimationFrame(keyAnimationFrameId.current);
        keyAnimationFrameId.current = null;
      }
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle WASD, E, Q keys
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'e', 'q'].includes(key)) {
        keysPressed.current.add(key);

        // Prevent default behavior for these keys (e.g., scrolling)
        e.preventDefault();

        // Start the animation loop if it's not already running
        if (keyAnimationFrameId.current === null) {
          updateCameraPosition();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'e', 'q'].includes(key)) {
        keysPressed.current.delete(key);

        // If no keys are pressed, stop the animation loop
        if (keysPressed.current.size === 0 && keyAnimationFrameId.current !== null) {
          cancelAnimationFrame(keyAnimationFrameId.current);
          keyAnimationFrameId.current = null;
        }
      }
    };

    const updateCameraPosition = () => {
      // Calculate movement based on camera orientation
      const moveSpeed = 0.05; // Adjust as needed
      let deltaX = 0;
      let deltaY = 0;
      let deltaZ = 0;

      // Get the forward direction vector based on camera angle
      const forwardX = Math.sin(cameraState.angleY);
      const forwardZ = Math.cos(cameraState.angleY);

      // Get the right direction vector (perpendicular to forward)
      const rightX = Math.sin(cameraState.angleY + Math.PI / 2);
      const rightZ = Math.cos(cameraState.angleY + Math.PI / 2);

      // Apply movement based on keys pressed
      if (keysPressed.current.has('w')) {
        // Move forward
        deltaX += forwardX * moveSpeed;
        deltaZ += forwardZ * moveSpeed;
      }
      if (keysPressed.current.has('s')) {
        // Move backward
        deltaX -= forwardX * moveSpeed;
        deltaZ -= forwardZ * moveSpeed;
      }
      if (keysPressed.current.has('a')) {
        // Move left
        deltaX -= rightX * moveSpeed;
        deltaZ -= rightZ * moveSpeed;
      }
      if (keysPressed.current.has('d')) {
        // Move right
        deltaX += rightX * moveSpeed;
        deltaZ += rightZ * moveSpeed;
      }
      if (keysPressed.current.has('e')) {
        // Move up
        deltaY += moveSpeed;
      }
      if (keysPressed.current.has('q')) {
        // Move down
        deltaY -= moveSpeed;
      }

      // Update camera state if there's any movement
      if (deltaX !== 0 || deltaY !== 0 || deltaZ !== 0) {
        onCameraChange(prevState => ({
          ...prevState,
          panX: prevState.panX - deltaX, // Invert for natural movement
          panY: prevState.panY - deltaY, // Invert for natural movement
        }));
      }

      // Continue the animation loop if keys are still pressed
      if (keysPressed.current.size > 0) {
        keyAnimationFrameId.current = requestAnimationFrame(updateCameraPosition);
      } else {
        keyAnimationFrameId.current = null;
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (keyAnimationFrameId.current !== null) {
        cancelAnimationFrame(keyAnimationFrameId.current);
        keyAnimationFrameId.current = null;
      }
    };
  }, [renderMode, cameraState.angleY, onCameraChange]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full block z-10"
      aria-label={renderMode === '2D' ? "2D Shader Preview Canvas" : "3D Shader Preview Canvas"}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
};
