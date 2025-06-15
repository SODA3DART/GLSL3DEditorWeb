
import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { ShaderView } from './components/ShaderView';
import { 
  DEFAULT_FRAGMENT_SHADER, 
  DEFAULT_VERTEX_SHADER,
  DEFAULT_VERTEX_SHADER_3D,
  DEFAULT_FRAGMENT_SHADER_3D,
  PRIMITIVE_CUBE,
  PRIMITIVE_SPHERE,
  UPLOADED_OBJ
} from './constants';
import { RenderMode, PrimitiveShape, ModelData, CameraState, TextureInfo } from './types';
import { createCube, createSphere } from './utils/geometry';
import { parseOBJ } from './utils/objParser';

const App: React.FC = () => {
  const [editorCode, setEditorCode] = useState<string>(DEFAULT_FRAGMENT_SHADER);
  const [activeFragmentShaderCode, setActiveFragmentShaderCode] = useState<string>(DEFAULT_FRAGMENT_SHADER);
  const [activeVertexShaderCode, setActiveVertexShaderCode] = useState<string>(DEFAULT_VERTEX_SHADER);

  const [compileError, setCompileError] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState<boolean>(true);

  const [renderMode, setRenderMode] = useState<RenderMode>('2D');
  const [selectedPrimitive, setSelectedPrimitive] = useState<PrimitiveShape>(PRIMITIVE_CUBE);
  const [uploadedModelData, setUploadedModelData] = useState<ModelData | null>(null);
  const [currentModelData, setCurrentModelData] = useState<ModelData | null>(null);

  // Texture state
  const [textures, setTextures] = useState<TextureInfo[]>([]);
  const [showTextureUpload, setShowTextureUpload] = useState<boolean>(false);

  const [cameraState, setCameraState] = useState<CameraState>({
    angleX: Math.PI / 6, // Initial pitch
    angleY: Math.PI / 4, // Initial yaw
    distance: 3,         // Initial distance from origin
    panX: 0,             // Initial horizontal pan offset
    panY: 0,             // Initial vertical pan offset
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textureInputRef = React.useRef<HTMLInputElement>(null);

  // Update currentModelData based on selected primitive or uploaded OBJ
  useEffect(() => {
    if (renderMode === '3D') {
      if (selectedPrimitive === PRIMITIVE_CUBE) {
        setCurrentModelData(createCube());
      } else if (selectedPrimitive === PRIMITIVE_SPHERE) {
        setCurrentModelData(createSphere());
      } else if (selectedPrimitive === UPLOADED_OBJ && uploadedModelData) {
        setCurrentModelData(uploadedModelData);
      } else {
         setCurrentModelData(createCube()); // Default to cube if no OBJ and in 3D
      }
    } else {
      setCurrentModelData(null); // No model for 2D mode
    }
  }, [renderMode, selectedPrimitive, uploadedModelData]);

  // Update shaders when mode changes
  useEffect(() => {
    if (renderMode === '2D') {
      setActiveVertexShaderCode(DEFAULT_VERTEX_SHADER);
      // Keep user's shader if they were editing, or switch to default 2D fragment shader
      // For simplicity, let's reset to default when switching modes to avoid incompatible shaders.
      setEditorCode(DEFAULT_FRAGMENT_SHADER);
      setActiveFragmentShaderCode(DEFAULT_FRAGMENT_SHADER);
      // Hide texture panel in 2D mode
      setShowTextureUpload(false);
    } else { // 3D mode
      setActiveVertexShaderCode(DEFAULT_VERTEX_SHADER_3D);
      setEditorCode(DEFAULT_FRAGMENT_SHADER_3D);
      setActiveFragmentShaderCode(DEFAULT_FRAGMENT_SHADER_3D);
      // Automatically show texture panel in 3D mode
      setShowTextureUpload(true);
    }
  }, [renderMode]);


  const handleCompile = useCallback(() => {
    setActiveFragmentShaderCode(editorCode); // Only fragment shader is user-editable
    setCompileError(null); // Clear previous errors on new compile
  }, [editorCode]);

  const toggleEditor = useCallback(() => {
    setEditorVisible(prev => !prev);
  }, []);

  const handleModeChange = (newMode: RenderMode) => {
    setRenderMode(newMode);
  };

  const handlePrimitiveChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newShape = event.target.value as PrimitiveShape;
    setSelectedPrimitive(newShape);
    if (newShape !== UPLOADED_OBJ) {
        setUploadedModelData(null); // Clear uploaded model if a primitive is selected
    }
  };

  const handleObjFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const model = parseOBJ(text);
          setUploadedModelData(model);
          setSelectedPrimitive(UPLOADED_OBJ); // Switch to show the uploaded OBJ
          setCompileError(null);
        } catch (err) {
          console.error("Error parsing OBJ file:", err);
          setCompileError(`Error parsing OBJ: ${err.message}`);
          setUploadedModelData(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerTextureUpload = () => {
    textureInputRef.current?.click();
  };

  const handleTextureUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a unique ID for the texture
      const id = `texture${textures.length}`;
      const name = file.name.split('.')[0] || id;

      // Create a URL for the image
      const url = URL.createObjectURL(file);

      // Add the new texture to the textures array
      const newTexture: TextureInfo = { id, name, url };
      setTextures(prev => [...prev, newTexture]);

      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const toggleTextureUpload = () => {
    setShowTextureUpload(prev => !prev);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="bg-gray-800 p-2 shadow-md z-30 flex items-center space-x-4">
        <span className="text-sm font-semibold">Mode:</span>
        <button 
          onClick={() => handleModeChange('2D')}
          className={`px-3 py-1 rounded text-sm ${renderMode === '2D' ? 'bg-indigo-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
        >
          2D
        </button>
        <button 
          onClick={() => handleModeChange('3D')}
          className={`px-3 py-1 rounded text-sm ${renderMode === '3D' ? 'bg-indigo-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
        >
          3D
        </button>

        {renderMode === '3D' && (
          <>
            <span className="text-sm font-semibold ml-4">Primitive:</span>
            <select 
              value={selectedPrimitive} 
              onChange={handlePrimitiveChange}
              className="bg-gray-700 text-white p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={PRIMITIVE_CUBE}>Cube</option>
              <option value={PRIMITIVE_SPHERE}>Sphere</option>
              <option value={UPLOADED_OBJ} disabled={!uploadedModelData}>Uploaded OBJ</option>
            </select>
            <button 
                onClick={triggerFileUpload}
                className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-3 py-1 rounded"
            >
                Upload OBJ
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleObjFileUpload} 
                accept=".obj" 
                className="hidden" 
            />

            <span className="text-sm font-semibold ml-4">Textures:</span>
            <button 
                onClick={toggleTextureUpload}
                className={`${showTextureUpload ? 'bg-indigo-500' : 'bg-teal-500 hover:bg-teal-600'} text-white text-sm px-3 py-1 rounded`}
            >
                {showTextureUpload ? 'Hide Textures' : 'Show Textures'}
            </button>
            <input 
                type="file" 
                ref={textureInputRef} 
                onChange={handleTextureUpload} 
                accept="image/*" 
                className="hidden" 
            />
          </>
        )}
      </div>

      {/* Texture Panel */}
      {showTextureUpload && (
        <div className="bg-gray-800 p-2 shadow-md z-30 flex items-center space-x-4 overflow-x-auto">
          <button 
            onClick={triggerTextureUpload}
            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded flex-shrink-0"
          >
            Add Texture
          </button>

          {textures.length === 0 ? (
            <span className="text-gray-400 text-sm">No textures added yet. Click "Add Texture" to upload.</span>
          ) : (
            textures.map((texture, index) => (
              <div key={texture.id} className="flex flex-col items-center bg-gray-700 p-2 rounded">
                <img 
                  src={texture.url} 
                  alt={texture.name} 
                  className="w-12 h-12 object-cover rounded mb-1" 
                />
                <span className="text-xs text-white">{texture.name}</span>
                <span className="text-xs text-gray-400">u_{texture.id}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow relative">
        <ShaderView
          vertexShaderSource={activeVertexShaderCode}
          fragmentShaderCode={activeFragmentShaderCode}
          renderMode={renderMode}
          currentModelData={currentModelData}
          onCompilationError={setCompileError}
          cameraState={cameraState}
          onCameraChange={setCameraState}
          textures={textures}
        />
        {editorVisible && (
          <EditorPanel
            code={editorCode}
            onCodeChange={setEditorCode}
            onCompile={handleCompile}
            error={compileError}
            onClose={toggleEditor}
          />
        )}
        <button
          onClick={toggleEditor}
          className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-150 ease-in-out z-50"
          aria-label={editorVisible ? "Hide Editor" : "Show Editor"}
        >
          {editorVisible ? 'Hide Editor' : 'Show Editor'}
        </button>
      </div>
    </div>
  );
};

export default App;
