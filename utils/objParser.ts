
import { ModelData } from '../types';

export function parseOBJ(text: string): ModelData {
  const objPositions: [number, number, number][] = [[0, 0, 0]]; // OBJ indices are 1-based
  const objNormals: [number, number, number][] = [[0, 0, 0]];   // So add a dummy 0 element
  // const objTexcoords = [[0, 0]]; // Not parsing texcoords for now

  const vertexPositions: number[] = [];
  const vertexNormals: number[] = [];
  // const vertexTexcoords = []; // Not parsing texcoords for now

  function addVertex(partsStr: string) {
    const parts = partsStr.split('/');
    const vIdx = parseInt(parts[0], 10);
    // const vtIdx = parts.length > 1 && parts[1] ? parseInt(parts[1], 10) : 0; // Not used
    const vnIdx = parts.length > 2 && parts[2] ? parseInt(parts[2], 10) : 0;

    const pos = objPositions[vIdx];
    vertexPositions.push(...pos);

    if (vnIdx > 0) {
      const norm = objNormals[vnIdx];
      vertexNormals.push(...norm);
    } else {
      // If no normal, might need to compute later or use a default
      // For now, this means the OBJ might not have normals or they are not parsed correctly.
      // This basic parser requires v//vn format for normals.
      vertexNormals.push(0,0,0); // Placeholder
    }
    // if (vtIdx > 0) {
    //   vertexTexcoords.push(...objTexcoords[vtIdx]);
    // }
  }

  const lines = text.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
      continue;
    }
    const [keyword, ...values] = trimmedLine.split(/\s+/);

    switch (keyword) {
      case 'v':
        objPositions.push(values.map(parseFloat) as [number, number, number]);
        break;
      case 'vn':
        objNormals.push(values.map(parseFloat) as [number, number, number]);
        break;
      // case 'vt': // Not parsing texcoords for now
      //   objTexcoords.push(values.map(parseFloat));
      //   break;
      case 'f': {
        // Simple triangulation for quads (assuming convex)
        const numVerticesInFace = values.length;
        if (numVerticesInFace >= 3) {
          addVertex(values[0]);
          addVertex(values[1]);
          addVertex(values[2]);
          if (numVerticesInFace === 4) { // Quad, triangulate
            addVertex(values[0]);
            addVertex(values[2]);
            addVertex(values[3]);
          }
        }
        break;
      }
      default:
        // console.warn(`Unhandled OBJ keyword: ${keyword}`);
        break;
    }
  }
  
  // This simple parser doesn't use indexed drawing for the final ModelData.
  // It outputs flat arrays. For complex models, indexed drawing is better.
  // If normals were not present in OBJ or consistently, they need to be computed.
  if (vertexNormals.length !== vertexPositions.length) {
    console.warn("OBJ Parser: Mismatch between vertex and normal counts. Normals might be incorrect or missing.");
    // Fill missing normals with placeholders if necessary, though ideally OBJ should have them or they should be computed.
    const expectedNormalCount = vertexPositions.length;
    while(vertexNormals.length < expectedNormalCount) {
        vertexNormals.push(0,1,0); // Default up normal
    }
  }


  return { vertices: vertexPositions, normals: vertexNormals }; // No indices as we create flat arrays
}
