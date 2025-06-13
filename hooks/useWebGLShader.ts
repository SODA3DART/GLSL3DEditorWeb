
import { useRef, useEffect, useState, useCallback } from 'react';
import { RenderMode, ModelData, CameraState } from '../types';
import { compileShader, createProgram } from '../utils/glslUtils';
import * as mat4 from '../utils/matrixUtils';
import { 
  DEFAULT_LIGHT_DIRECTION, 
  DEFAULT_LIGHT_COLOR, 
  DEFAULT_AMBIENT_COLOR 
} from '../constants';

interface UseWebGLRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  vertexShaderSource: string;
  fragmentShaderSource: string;
  renderMode: RenderMode;
  modelData: ModelData | null;
  cameraState: CameraState;
}

interface UseWebGLRendererResult {
  error: string | null;
  gl: WebGLRenderingContext | null;
}

export function useWebGLRenderer({
  canvasRef,
  vertexShaderSource,
  fragmentShaderSource,
  renderMode,
  modelData,
  cameraState,
}: UseWebGLRendererProps): UseWebGLRendererResult {
  const [error, setError] = useState<string | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  
  // Buffers
  const positionBufferRef = useRef<WebGLBuffer | null>(null); // For 2D quad and 3D models
  const normalBufferRef = useRef<WebGLBuffer | null>(null);   // For 3D models
  const indexBufferRef = useRef<WebGLBuffer | null>(null);    // For 3D models (indexed drawing)

  // Uniform locations
  const uTimeRef = useRef<WebGLUniformLocation | null>(null);
  const uResolutionRef = useRef<WebGLUniformLocation | null>(null);
  const uModelMatrixRef = useRef<WebGLUniformLocation | null>(null);
  const uViewMatrixRef = useRef<WebGLUniformLocation | null>(null);
  const uProjectionMatrixRef = useRef<WebGLUniformLocation | null>(null);
  const uNormalMatrixRef = useRef<WebGLUniformLocation | null>(null);
  const uLightDirectionRef = useRef<WebGLUniformLocation | null>(null);
  const uLightColorRef = useRef<WebGLUniformLocation | null>(null);
  const uAmbientColorRef = useRef<WebGLUniformLocation | null>(null);
  const uViewPositionRef = useRef<WebGLUniformLocation | null>(null);


  const animationFrameIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const modelMatrix = useRef<mat4.Mat4>(mat4.createMat4());
  const viewMatrix = useRef<mat4.Mat4>(mat4.createMat4());
  const projectionMatrix = useRef<mat4.Mat4>(mat4.createMat4());
  const normalMatrix = useRef<mat4.Mat4>(mat4.createMat4());


  const cleanup = useCallback(() => {
    const gl = glRef.current;
    if (gl) {
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
        programRef.current = null;
      }
      if (positionBufferRef.current) {
        gl.deleteBuffer(positionBufferRef.current);
        positionBufferRef.current = null;
      }
      if (normalBufferRef.current) {
        gl.deleteBuffer(normalBufferRef.current);
        normalBufferRef.current = null;
      }
      if (indexBufferRef.current) {
        gl.deleteBuffer(indexBufferRef.current);
        indexBufferRef.current = null;
      }
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  // Initialize WebGL context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!context) {
      setError("WebGL not supported or context creation failed.");
      return;
    }
    glRef.current = context;
    startTimeRef.current = Date.now();
    
    // Initial 2D buffer setup (full-screen quad)
    const gl = glRef.current;
    positionBufferRef.current = gl.createBuffer(); // This buffer will be reused

    return () => {
      cleanup();
      if (glRef.current) {
        const loseContextExt = glRef.current.getExtension('WEBGL_lose_context');
        if (loseContextExt) loseContextExt.loseContext();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]); // Only on canvas mount/unmount

  // Compile shaders and link program
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    // Clean up old program before creating a new one
    if (programRef.current) {
      gl.deleteProgram(programRef.current);
      programRef.current = null;
    }
    
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    if (!vs || !gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      setError(`Vertex Shader Error: ${gl.getShaderInfoLog(vs!) || 'Unknown error'}`);
      if(vs) gl.deleteShader(vs);
      return;
    }

    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!fs || !gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      setError(`Fragment Shader Error: ${gl.getShaderInfoLog(fs!) || 'Unknown error'}`);
      if(fs) gl.deleteShader(fs);
      gl.deleteShader(vs); // Clean up vertex shader
      return;
    }

    const newProgram = createProgram(gl, vs, fs);
    gl.deleteShader(vs); 
    gl.deleteShader(fs);

    if (!newProgram || !gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
      setError(`Program Linking Error: ${gl.getProgramInfoLog(newProgram!) || 'Unknown error'}`);
      if(newProgram) gl.deleteProgram(newProgram);
      return;
    }
    
    programRef.current = newProgram;
    setError(null);

    // Get uniform locations
    uTimeRef.current = gl.getUniformLocation(programRef.current, 'u_time');
    uResolutionRef.current = gl.getUniformLocation(programRef.current, 'u_resolution');
    
    if (renderMode === '3D') {
      uModelMatrixRef.current = gl.getUniformLocation(programRef.current, 'u_modelMatrix');
      uViewMatrixRef.current = gl.getUniformLocation(programRef.current, 'u_viewMatrix');
      uProjectionMatrixRef.current = gl.getUniformLocation(programRef.current, 'u_projectionMatrix');
      uNormalMatrixRef.current = gl.getUniformLocation(programRef.current, 'u_normalMatrix');
      uLightDirectionRef.current = gl.getUniformLocation(programRef.current, 'u_lightDirection');
      uLightColorRef.current = gl.getUniformLocation(programRef.current, 'u_lightColor');
      uAmbientColorRef.current = gl.getUniformLocation(programRef.current, 'u_ambientColor');
      uViewPositionRef.current = gl.getUniformLocation(programRef.current, 'u_viewPosition');
    }

  }, [vertexShaderSource, fragmentShaderSource, renderMode]); // Recompile when shaders or mode change

  // Update 3D model buffers
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || renderMode !== '3D' || !modelData) return;

    // Vertex positions
    if (!positionBufferRef.current) positionBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertices), gl.STATIC_DRAW);

    // Normals
    if (modelData.normals && modelData.normals.length > 0) {
      if (!normalBufferRef.current) normalBufferRef.current = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.normals), gl.STATIC_DRAW);
    } else if (normalBufferRef.current) {
        gl.deleteBuffer(normalBufferRef.current); // No normals provided
        normalBufferRef.current = null;
    }


    // Indices (optional)
    if (modelData.indices && modelData.indices.length > 0) {
      if (!indexBufferRef.current) indexBufferRef.current = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferRef.current);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);
    } else if (indexBufferRef.current) {
        gl.deleteBuffer(indexBufferRef.current); // Not using indexed drawing
        indexBufferRef.current = null;
    }
    
  }, [renderMode, modelData]);

  // Render loop
  useEffect(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas || !programRef.current) {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      return;
    }

    const currentProgram = programRef.current;
    let aPositionLoc: number, aNormalLoc: number;

    if (renderMode === '2D') {
        aPositionLoc = gl.getAttribLocation(currentProgram, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    } else if (renderMode === '3D') {
        aPositionLoc = gl.getAttribLocation(currentProgram, 'a_position');
        aNormalLoc = gl.getAttribLocation(currentProgram, 'a_normal');
    }


    const render = () => {
      if (!glRef.current || !programRef.current || !canvasRef.current) return;
      const currentGl = glRef.current;
      const currentCanvas = canvasRef.current;

      const displayWidth = currentCanvas.clientWidth;
      const displayHeight = currentCanvas.clientHeight;
      if (currentCanvas.width !== displayWidth || currentCanvas.height !== displayHeight) {
        currentCanvas.width = displayWidth;
        currentCanvas.height = displayHeight;
        currentGl.viewport(0, 0, currentCanvas.width, currentCanvas.height);
      }

      currentGl.clearColor(0.1, 0.1, 0.15, 1); // Darker background
      currentGl.clear(currentGl.COLOR_BUFFER_BIT | currentGl.DEPTH_BUFFER_BIT);
      currentGl.useProgram(currentProgram);

      // Set common uniforms
      if (uTimeRef.current) currentGl.uniform1f(uTimeRef.current, (Date.now() - startTimeRef.current) / 1000.0);
      if (uResolutionRef.current) currentGl.uniform2f(uResolutionRef.current, currentCanvas.width, currentCanvas.height);

      if (renderMode === '2D') {
        currentGl.disable(currentGl.DEPTH_TEST);
        currentGl.bindBuffer(currentGl.ARRAY_BUFFER, positionBufferRef.current);
        currentGl.enableVertexAttribArray(aPositionLoc);
        currentGl.vertexAttribPointer(aPositionLoc, 2, currentGl.FLOAT, false, 0, 0);
        currentGl.drawArrays(currentGl.TRIANGLES, 0, 6);
      } else if (renderMode === '3D' && modelData) {
        currentGl.enable(currentGl.DEPTH_TEST);

        // Update matrices
        mat4.perspectiveMat4(projectionMatrix.current, Math.PI / 4, currentCanvas.width / currentCanvas.height, 0.1, 100);
        
        const camX = Math.sin(cameraState.angleY) * Math.cos(cameraState.angleX) * cameraState.distance;
        const camY = Math.sin(cameraState.angleX) * cameraState.distance;
        const camZ = Math.cos(cameraState.angleY) * Math.cos(cameraState.angleX) * cameraState.distance;
        const eye: [number,number,number] = [camX, camY, camZ];
        mat4.lookAtMat4(viewMatrix.current, eye, [0, 0, 0], [0, 1, 0]);
        
        mat4.createMat4(); // Reset model matrix (identity for now, or apply model specific transforms)
        // Example: Simple rotation for the model
        // mat4.rotateMat4(modelMatrix.current, modelMatrix.current, (Date.now() - startTimeRef.current) / 2000.0, [0,1,0]);
        
        mat4.normalFromMat4(normalMatrix.current, modelMatrix.current); // Or modelView if light is in view space

        // Set 3D uniforms
        if (uModelMatrixRef.current) currentGl.uniformMatrix4fv(uModelMatrixRef.current, false, modelMatrix.current);
        if (uViewMatrixRef.current) currentGl.uniformMatrix4fv(uViewMatrixRef.current, false, viewMatrix.current);
        if (uProjectionMatrixRef.current) currentGl.uniformMatrix4fv(uProjectionMatrixRef.current, false, projectionMatrix.current);
        if (uNormalMatrixRef.current) currentGl.uniformMatrix4fv(uNormalMatrixRef.current, false, normalMatrix.current);
        
        if (uLightDirectionRef.current) currentGl.uniform3fv(uLightDirectionRef.current, DEFAULT_LIGHT_DIRECTION);
        if (uLightColorRef.current) currentGl.uniform3fv(uLightColorRef.current, DEFAULT_LIGHT_COLOR);
        if (uAmbientColorRef.current) currentGl.uniform3fv(uAmbientColorRef.current, DEFAULT_AMBIENT_COLOR);
        if (uViewPositionRef.current) currentGl.uniform3fv(uViewPositionRef.current, eye);


        // Set attributes
        currentGl.bindBuffer(currentGl.ARRAY_BUFFER, positionBufferRef.current);
        currentGl.enableVertexAttribArray(aPositionLoc);
        currentGl.vertexAttribPointer(aPositionLoc, 3, currentGl.FLOAT, false, 0, 0);

        if (normalBufferRef.current && aNormalLoc !== -1 && aNormalLoc !== undefined) {
          currentGl.bindBuffer(currentGl.ARRAY_BUFFER, normalBufferRef.current);
          currentGl.enableVertexAttribArray(aNormalLoc);
          currentGl.vertexAttribPointer(aNormalLoc, 3, currentGl.FLOAT, false, 0, 0);
        } else if (aNormalLoc !== -1 && aNormalLoc !== undefined) {
           currentGl.disableVertexAttribArray(aNormalLoc); // Disable if no normal buffer
        }

        if (indexBufferRef.current && modelData.indices) {
          currentGl.bindBuffer(currentGl.ELEMENT_ARRAY_BUFFER, indexBufferRef.current);
          currentGl.drawElements(currentGl.TRIANGLES, modelData.indices.length, currentGl.UNSIGNED_SHORT, 0);
        } else {
          currentGl.drawArrays(currentGl.TRIANGLES, 0, modelData.vertices.length / 3);
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [canvasRef, programRef.current, renderMode, modelData, cameraState]); // Re-run if program, mode, model, or camera changes


  return { error, gl: glRef.current };
}
