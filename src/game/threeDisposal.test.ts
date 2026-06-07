import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeObject3D } from './threeDisposal';

describe('Three.js disposal helper', () => {
  it('disposes mesh geometry and material', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const geometryDisposed = vi.fn();
    const materialDisposed = vi.fn();
    geometry.addEventListener('dispose', geometryDisposed);
    material.addEventListener('dispose', materialDisposed);

    const mesh = new THREE.Mesh(geometry, material);
    disposeObject3D(mesh);

    expect(geometryDisposed).toHaveBeenCalledOnce();
    expect(materialDisposed).toHaveBeenCalledOnce();
  });

  it('disposes material textures', () => {
    const texture = new THREE.Texture();
    const textureDisposed = vi.fn();
    texture.addEventListener('dispose', textureDisposed);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    disposeObject3D(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));

    expect(textureDisposed).toHaveBeenCalledOnce();
  });

  it('disposes children recursively', () => {
    const root = new THREE.Group();
    const childGeometry = new THREE.SphereGeometry(1);
    const childMaterial = new THREE.MeshBasicMaterial();
    const childGeometryDisposed = vi.fn();
    const childMaterialDisposed = vi.fn();
    childGeometry.addEventListener('dispose', childGeometryDisposed);
    childMaterial.addEventListener('dispose', childMaterialDisposed);

    root.add(new THREE.Mesh(childGeometry, childMaterial));
    disposeObject3D(root);

    expect(childGeometryDisposed).toHaveBeenCalledOnce();
    expect(childMaterialDisposed).toHaveBeenCalledOnce();
  });
});
