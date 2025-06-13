
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWebGLRenderer } from '../hooks/useWebGLShader'; // Updated import path
import { RenderMode, ModelData, CameraState } from '../types';

interface ShaderViewProps {
  vertexShaderSource: string;
  fragmentShaderCode: string;
  renderMode: RenderMode;
  currentModelData: ModelData | null;
  onCompilationError: (error: string | null) => void;
  cameraState: CameraState;
  onCameraChange: (newState: CameraState | ((prevState: CameraState) => CameraState)) => void;
}

export const ShaderView: React.FC<ShaderViewProps> = ({
  vertexShaderSource,
  fragmentShaderCode,
  renderMode,
  currentModelData,
  onCompilationError,
  cameraState,
  onCameraChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { error: shaderError } = useWebGLRenderer({
    canvasRef,
    vertexShaderSource,
    fragmentShaderSource: fragmentShaderCode,
    renderMode,
    modelData: currentModelData,
    cameraState,
  });

  const isDraggingRef = useRef(false);
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    onCompilationError(shaderError);
  }, [shaderError, onCompilationError]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D') return;
    isDraggingRef.current = true;
    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.style.cursor = 'grabbing';
  }, [renderMode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (renderMode !== '3D' || !isDraggingRef.current || !lastMousePositionRef.current) return;

    const dx = event.clientX - lastMousePositionRef.current.x;
    const dy = event.clientY - lastMousePositionRef.current.y;

    onCameraChange(prevState => {
      const newAngleY = prevState.angleY + dx * 0.005; // Adjust sensitivity
      let newAngleX = prevState.angleX - dy * 0.005;   // Adjust sensitivity
      // Clamp angleX to avoid flipping
      newAngleX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, newAngleX));
      return { ...prevState, angleX: newAngleX, angleY: newAngleY };
    });

    lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, [renderMode, onCameraChange]);

  const handleMouseUpOrLeave = useCallback(() => {
    if (renderMode !== '3D') return;
    isDraggingRef.current = false;
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
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && renderMode === '3D') {
      canvas.style.cursor = 'grab';
    } else if (canvas) {
      canvas.style.cursor = 'default';
    }
  }, [renderMode]);


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
    />
  );
};
