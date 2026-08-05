import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const TOTAL = 100000;
const OUTPUT_FILE = 'productos_100k.csv';

// Datos de ejemplo
const adjectives = ['Premium', 'Ultra', 'Mega', 'Super', 'Pro', 'Plus', 'Essential', 'Advanced', 'Smart', 'Power', 'Enterprise', 'Business', 'Cloud', 'Data', 'Fast', 'Secure', 'Reliable', 'Agile'];
const nouns = ['Server', 'Cloud', 'Storage', 'Backup', 'Security', 'Analytics', 'Compute', 'Network', 'Database', 'AI', 'Edge', 'Core', 'Platform', 'Solution', 'Gateway', 'Firewall'];
const brands = ['TechPro', 'DataCore', 'CloudNet', 'SecureSys', 'Innova', 'VisionIT', 'Apex', 'Nexus', 'Quantum', 'Astra', 'Zenith', 'Pioneer'];
const categories = ['SERVIDORES', 'CLOUD', 'SOFTWARE', 'REDES', 'SEGURIDAD'];

// Generar un producto
function generateProduct(index) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const name = `${adj} ${noun} ${brand} ${String(index + 1).padStart(4, '0')}`;
    const price = (Math.random() * 9000 + 100).toFixed(2);
    const stock = Math.floor(Math.random() * 500);
    const sku = `SKU-${String(index + 1).padStart(6, '0')}`;
    const imageUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(noun)}`;
    const description = `Producto ${noun} de alta calidad para ${adj} rendimiento. Marca ${brand}, categoría ${category}.`;
    
    return { nombre: name, descripcion: description, precio: price, stock, categoria: category, sku, imagen: imageUrl };
}

// Generar todos los productos
console.log(`🔄 Generando ${TOTAL} productos...`);
const headers = ['Nombre', 'Descripción', 'Precio', 'Stock', 'Categoría', 'SKU', 'Imagen'];
let csvContent = headers.join(',') + '\n';

for (let i = 0; i < TOTAL; i++) {
    const p = generateProduct(i);
    const row = [
        `"${p.nombre}"`,
        `"${p.descripcion}"`,
        p.precio,
        p.stock,
        `"${p.categoria}"`,
        `"${p.sku}"`,
        `"${p.imagen}"`
    ];
    csvContent += row.join(',') + '\n';
    
    if ((i + 1) % 10000 === 0) {
        console.log(`✅ ${i + 1} productos generados...`);
    }
}

// Guardar archivo
fs.writeFileSync(OUTPUT_FILE, csvContent);
console.log(`\n🎉 ¡Listo! Archivo generado: ${OUTPUT_FILE}`);
console.log(`📊 Total: ${TOTAL} productos`);
console.log(`📏 Tamaño: ~${Math.round(csvContent.length / 1024 / 1024)} MB`);
console.log(`📁 Ubicación: ${path.resolve(OUTPUT_FILE)}`);