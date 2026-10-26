// ktx2.mjs : textures d'un document glTF-Transform en KTX2 (Basis Universal, UASTC + zstd) avec l'outil `ktx` de KTX-Software (Khronos).
// Pourquoi : une texture KTX2 reste compressée dans la carte graphique (~1 octet/pixel contre 4 en PNG/WebP décodés) ; la RTX 3060 6 Go
// fait tourner 2 Chromium : c'est la mémoire graphique qui manque, pas le disque.
// Couleur (base, émission) en sRGB ; normales, rugosité, occlusion en linéaire. Taille ramenée à maxPx (multiple de 4), mipmaps générées.
import { KHRTextureBasisu } from '@gltf-transform/extensions';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

export const KTX = 'C:/Users/Noam/AppData/Local/KTX-Software/bin/ktx.exe';
export const ktxDispo = () => existsSync(KTX);

export async function texturesKTX2(doc, { maxPx = 2048, log = () => {} } = {}) {
  const role = new Map();   // texture -> 'srgb' | 'lineaire' | 'normale'
  for (const m of doc.getRoot().listMaterials()) {
    for (const t of [m.getBaseColorTexture(), m.getEmissiveTexture()]) if (t) role.set(t, 'srgb');
    if (m.getNormalTexture()) role.set(m.getNormalTexture(), 'normale');
    for (const t of [m.getMetallicRoughnessTexture(), m.getOcclusionTexture()]) if (t && !role.has(t)) role.set(t, 'lineaire');
  }
  const tmp = mkdtempSync(join(tmpdir(), 'ktx-')); let n = 0;
  try {
    for (const t of doc.getRoot().listTextures()) {
      const img = t.getImage(); if (!img || t.getMimeType() === 'image/ktx2') continue;
      const r = role.get(t) || 'srgb', s = sharp(Buffer.from(img)), meta = await s.metadata();
      const k = Math.min(1, maxPx / Math.max(meta.width, meta.height)), w = Math.max(4, Math.round(meta.width * k / 4) * 4), h = Math.max(4, Math.round(meta.height * k / 4) * 4);
      const png = join(tmp, `${n}.png`), out = join(tmp, `${n}.ktx2`);
      writeFileSync(png, await s.resize(w, h, { fit: 'fill' }).ensureAlpha().png().toBuffer());
      execFileSync(KTX, ['create', '--format', r === 'srgb' ? 'R8G8B8A8_SRGB' : 'R8G8B8A8_UNORM', '--assign-tf', r === 'srgb' ? 'srgb' : 'linear',
        '--encode', 'uastc', '--uastc-quality', '2', '--zstd', '18', '--generate-mipmap', png, out], { stdio: 'pipe' });
      t.setImage(readFileSync(out)).setMimeType('image/ktx2'); n++;
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  if (n) doc.createExtension(KHRTextureBasisu).setRequired(true);
  if (!doc.getRoot().listTextures().some(t => t.getMimeType() === 'image/webp')) doc.getRoot().listExtensionsUsed().filter(e => e.extensionName === 'EXT_texture_webp').forEach(e => e.dispose());   // plus de WebP : l'extension ne doit plus être exigée
  log(`${n} texture(s) en KTX2`); return n;
}
