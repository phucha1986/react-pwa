# Pond — real 3D asset slots (option B)

`PondScene` now supports importing **realistic GLB models** into the pond.
Each asset is a "slot" defined in
[`src/pages/PondScene/PondScene.tsx`](../../../src/pages/PondScene/PondScene.tsx)
(`POND_ASSETS`). The scene loads `<url>` with `GLTFLoader`, auto-centers it on
its bounding box, scales it to the slot's `targetHeight`, faces it toward the
pond centre, enables shadows, and plays its first animation clip (if any).

**If a file is missing, the slot is silently skipped** and the procedural
fallback (lily pads, fish, butterfly, etc.) remains — the scene never breaks.

## Current assets in this folder

| File          | Source                                                        | License / credit                          |
| ------------- | ------------------------------------------------------------- | ----------------------------------------- |
| `Flamingo.glb`| threejs.org examples (`models/gltf/Flamingo.glb`)            | CC BY 4.0 — three.js / Khronos samples    |
| `Stork.glb`   | threejs.org examples (`models/gltf/Stork.glb`)               | CC BY 4.0 — three.js / Khronos samples    |
| `Parrot.glb`  | threejs.org examples (`models/gltf/Parrot.glb`)              | CC BY 4.0 — three.js / Khronos samples    |
| `Horse.glb`   | threejs.org examples (`models/gltf/Horse.glb`)               | CC BY 4.0 — three.js / Khronos samples    |

These are the animal/bird samples that were actually available from a
reliable direct-download host at build time. Swap any of them for a more
on-theme model (koi, duck, frog, lily, lotus) — keep the same filename and it
will just work.

## How to add / swap an asset

1. Drop a `.glb` file into this folder (e.g. `koi.glb`).
2. In `POND_ASSETS`, change that slot's `url` to `models/pond/koi.glb`, and
   tune `position`, `rotationY` (or reuse `faceCenter(...)`), and
   `targetHeight`.
3. Reload the page. The model auto-scales and plays its first clip.

## Recommended realistic sources (with license notes)

- **Poly Haven** — https://polyhaven.com/3d-models — CC0 models & PBR textures
  (water, rocks, lily pads, reeds). Best for realistic PBR assets.
- **Kenney.nl** — https://kenney.nl/assets?q=3d — CC0 low-poly kits that match
  the scene's kid-friendly style.
- **Poly.pizza** — https://poly.pizza/ — free low-poly (OBJ/FBX/glTF), good
  for the stylized lily pad / fish / frog.
- **Sketchfab** — https://sketchfab.com/3d-models?features=downloadable —
  use the **License: CC** + **Downloadable** filters and keep attribution.
- **Smithsonian open access** — https://3d.si.edu/ — free to use, mix of
  licenses (check each item).

## Notes

- These sample models are third-party and **not bundled into the repo's
  license**; keep the credit line above if you redistribute the PWA.
- If you want the assets to survive a production build, they're already under
  `public/`, so Vite copies them as-is. No extra config needed.
