import React, { useRef } from 'react';
import Editor from 'react-simple-code-editor';
// prism-core, prism-clike, prism-glsl are loaded via CDN in index.html
// Now we access Prism global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Prism = (window as any).Prism;

import Draggable from 'react-draggable';
import { PlayIcon } from './icons/PlayIcon';
import { AlertIcon } from './icons/AlertIcon';
import { CloseIcon } from './icons/CloseIcon';

interface EditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onCompile: () => void;
  error: string | null;
  onClose: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onCodeChange, onCompile, error, onClose }) => {
  const nodeRef = useRef(null); // Create a ref for the draggable element

  const highlightCode = (code: string) => {
    if (Prism && Prism.languages && Prism.languages.glsl) {
      return Prism.highlight(code, Prism.languages.glsl, 'glsl');
    }
    return code; // Fallback if Prism is not available
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
      <div 
        ref={nodeRef} // Attach the ref to the draggable node
        className="absolute top-4 left-4 w-full max-w-lg lg:max-w-xl bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden z-20 flex flex-col" 
        style={{ minHeight: '300px', maxHeight: '80vh' }}
      >
        <div className="drag-handle bg-gray-900 bg-opacity-70 p-2 flex justify-between items-center cursor-move">
          <h2 className="text-sm font-semibold text-gray-200">GLSL Editor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close Editor">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-grow p-1 overflow-y-auto bg-transparent" style={{ minHeight: '200px' }}>
          <Editor
            value={code}
            onValueChange={onCodeChange}
            highlight={highlightCode}
            padding={10}
            className="font-mono text-sm leading-relaxed text-gray-100 bg-transparent rounded-md w-full h-full min-h-full code-editor_textarea"
            textareaClassName="code-editor_textarea" // For specific styling needs like transparent background
            preClassName="bg-transparent" // Ensure pre tag is also transparent
            aria-label="GLSL Code Editor"
          />
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-700 bg-opacity-70 text-red-100 text-xs font-mono flex items-start max-h-32 overflow-y-auto">
            <AlertIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <pre className="whitespace-pre-wrap flex-grow">{error}</pre>
          </div>
        )}

        <div className="p-3 bg-gray-900 bg-opacity-70 flex justify-end">
          <button
            onClick={onCompile}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-150 ease-in-out"
            aria-label="Compile and Run Shader"
          >
            <PlayIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            Compile & Run
          </button>
        </div>
      </div>
    </Draggable>
  );
};