import * as THREE from 'three';

type ObjectWithGeometry = THREE.Object3D & {
  geometry?: THREE.BufferGeometry;
};

type ObjectWithMaterial = THREE.Object3D & {
  material?: THREE.Material | THREE.Material[];
};

type TextureBearingMaterial = THREE.Material & {
  [key: string]: unknown;
};

export function disposeObject3D(object: THREE.Object3D): void {
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  const disposedMaterials = new Set<THREE.Material>();
  const disposedTextures = new Set<THREE.Texture>();

  object.traverse((child) => {
    const geometry = (child as ObjectWithGeometry).geometry;
    if (geometry && !disposedGeometries.has(geometry)) {
      disposedGeometries.add(geometry);
      geometry.dispose();
    }

    disposeMaterialOrList((child as ObjectWithMaterial).material, disposedMaterials, disposedTextures);
  });
}

export function disposeMaterialOrList(
  material: THREE.Material | THREE.Material[] | undefined,
  disposedMaterials = new Set<THREE.Material>(),
  disposedTextures = new Set<THREE.Texture>()
): void {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((item) => disposeMaterial(item, disposedMaterials, disposedTextures));
    return;
  }
  disposeMaterial(material, disposedMaterials, disposedTextures);
}

function disposeMaterial(
  material: THREE.Material,
  disposedMaterials: Set<THREE.Material>,
  disposedTextures: Set<THREE.Texture>
): void {
  if (disposedMaterials.has(material)) return;
  disposedMaterials.add(material);

  const candidate = material as TextureBearingMaterial;
  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
      disposedTextures.add(value);
      value.dispose();
    }
  }

  material.dispose();
}
