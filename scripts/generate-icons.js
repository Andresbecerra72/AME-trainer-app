const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { size: 192, output: 'public/icon-192x192.png' },
  { size: 512, output: 'public/icon-512x512.png' },
  { size: 180, output: 'public/apple-icon.png' },
  { size: 32, output: 'public/icon-32x32.png' },
  { size: 16, output: 'public/favicon-16x16.png' }
];

async function convertIcons() {
  const svgBuffer = fs.readFileSync('public/icon.svg');
  
  console.log('\n🎨 Generando iconos PWA desde SVG...\n');
  
  for (const config of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(config.size, config.size, {
          fit: 'contain',
          background: { r: 0, g: 58, b: 99, alpha: 1 }
        })
        .png()
        .toFile(config.output);
      
      const stats = fs.statSync(config.output);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✓ ${config.output} (${config.size}x${config.size}) - ${sizeKB} KB`);
    } catch (error) {
      console.error(`✗ Error generando ${config.output}:`, error.message);
    }
  }
  
  console.log('\n✅ Iconos generados exitosamente!');
  console.log('\n📋 Proximos pasos:');
  console.log('   1. Ejecutar: pnpm dev');
  console.log('   2. Abrir: http://localhost:3000');
  console.log('   3. Verificar en DevTools > Application > Manifest\n');
}

convertIcons().catch(console.error);
