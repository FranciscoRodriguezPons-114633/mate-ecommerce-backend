require("dotenv").config();

const path = require("path");
const mongoose = require("mongoose");
const sharp = require("sharp");
const Product = require("./models/Product");

const publicDir = path.resolve(__dirname, "../../frontend/public");

const newProducts = [
  {
    name: "Mate Camionero de Cuero Marrón",
    description:
      "Mate camionero forrado en cuero marrón con costura artesanal y boca amplia. Ideal para cebadas largas y para quienes prefieren un mate robusto de uso diario.",
    price: 26500,
    quantity: 18,
    category: "Calabazas",
    image: "/product-mate-camionero-cuero.jpg",
    palette: ["#6f4a2f", "#b98755", "#f3e2c7"],
    subject: "mate",
  },
  {
    name: "Mate Torpedo Premium Negro",
    description:
      "Mate torpedo de calabaza seleccionada con virola pulida y acabado negro mate. Una pieza elegante, cómoda en mano y pensada para conservar bien la temperatura.",
    price: 31500,
    quantity: 14,
    category: "Calabazas",
    image: "/product-mate-torpedo-negro.jpg",
    palette: ["#1f1f1f", "#d7b56d", "#ece0ca"],
    subject: "torpedo",
  },
  {
    name: "Bombilla Premium Pico Plano",
    description:
      "Bombilla de acero inoxidable con pico plano, filtro tipo cuchara y terminación pulida. Buena circulación, fácil limpieza y excelente durabilidad.",
    price: 6200,
    quantity: 42,
    category: "Bombillas",
    image: "/product-bombilla-pico-plano.jpg",
    palette: ["#c9b16a", "#7a6a3b", "#efe6cd"],
    subject: "bombilla",
  },
  {
    name: "Bombilla Resorte Desmontable",
    description:
      "Bombilla con filtro de resorte desmontable, práctica para yerbas de molienda fina. Liviana, resistente y cómoda para llevar en el bolso matero.",
    price: 4900,
    quantity: 55,
    category: "Bombillas",
    image: "/product-bombilla-resorte.jpg",
    palette: ["#b7bcc2", "#5d6670", "#e8edf1"],
    subject: "bombilla",
  },
  {
    name: "Yerba Mate Barbacuá 1kg",
    description:
      "Yerba mate barbacuá estacionada con notas ahumadas y sabor intenso. Recomendada para quienes buscan una cebada con carácter tradicional.",
    price: 5200,
    quantity: 90,
    category: "Yerba Mate",
    image: "/product-yerba-barbacua.jpg",
    palette: ["#345c2b", "#c9a15a", "#f0ead7"],
    subject: "yerba",
  },
  {
    name: "Yerba Mate Blend con Hierbas 500g",
    description:
      "Blend suave con hierbas serranas, pensado para una experiencia aromática y liviana. Perfecta para tomar durante la tarde sin amargor excesivo.",
    price: 3400,
    quantity: 80,
    category: "Yerba Mate",
    image: "/product-yerba-hierbas.jpg",
    palette: ["#5c8a42", "#d8c17e", "#f4eedf"],
    subject: "yerba",
  },
  {
    name: "Termo Pico Cebador Negro 1.2L",
    description:
      "Termo de acero con pico cebador de precisión y capacidad de 1.2 litros. Mantiene la temperatura por horas y ofrece un vertido cómodo para mate.",
    price: 32500,
    quantity: 22,
    category: "Termos",
    image: "/product-termo-negro-12.jpg",
    palette: ["#151515", "#4a4a4a", "#e7dcc4"],
    subject: "termo",
  },
  {
    name: "Yerbera de Cuero con Pico Vertedor",
    description:
      "Yerbera rígida revestida en cuero con pico vertedor metálico. Mantiene la yerba ordenada, protegida y lista para cebar sin desperdicio.",
    price: 14800,
    quantity: 26,
    category: "Yerberas",
    image: "/product-yerbera-cuero.jpg",
    palette: ["#7b4f2f", "#d7a060", "#f1e2c8"],
    subject: "yerbera",
  },
  {
    name: "Set Matero Viajero Compacto",
    description:
      "Set compacto con mate, bombilla, yerbera y estuche rígido. Diseñado para llevar lo esencial en viajes, oficina o escapadas de fin de semana.",
    price: 38500,
    quantity: 16,
    category: "Sets",
    image: "/product-set-viajero.jpg",
    palette: ["#2f4f3d", "#ba8c53", "#eadcc2"],
    subject: "set",
  },
  {
    name: "Cepillo Limpiador de Bombilla",
    description:
      "Cepillo flexible para limpiar bombillas y pequeños accesorios materos. Ayuda a mantener el sabor limpio y prolongar la vida útil de la bombilla.",
    price: 2100,
    quantity: 70,
    category: "Accesorios",
    image: "/product-cepillo-bombilla.jpg",
    palette: ["#6b7280", "#f4d06f", "#f1efe7"],
    subject: "cepillo",
  },
];

const productShape = (subject, palette) => {
  const [primary, secondary, light] = palette;

  const shapes = {
    mate: `
      <ellipse cx="420" cy="590" rx="185" ry="48" fill="#000" opacity=".12"/>
      <path d="M260 285 C260 210 580 210 580 285 L540 605 C530 690 310 690 300 605 Z" fill="${primary}"/>
      <path d="M290 275 C310 205 530 205 550 275 C520 315 320 315 290 275Z" fill="${secondary}"/>
      <ellipse cx="420" cy="275" rx="132" ry="38" fill="${light}"/>
      <path d="M505 235 L610 95" stroke="#d8c18b" stroke-width="24" stroke-linecap="round"/>
      <circle cx="610" cy="95" r="18" fill="#d8c18b"/>
    `,
    torpedo: `
      <ellipse cx="420" cy="600" rx="165" ry="42" fill="#000" opacity=".12"/>
      <path d="M315 260 C330 180 510 180 525 260 C545 390 520 625 420 675 C320 625 295 390 315 260Z" fill="${primary}"/>
      <ellipse cx="420" cy="258" rx="105" ry="30" fill="${secondary}"/>
      <ellipse cx="420" cy="258" rx="78" ry="18" fill="${light}"/>
      <path d="M494 228 L596 102" stroke="#c7a75a" stroke-width="20" stroke-linecap="round"/>
    `,
    bombilla: `
      <ellipse cx="420" cy="590" rx="190" ry="42" fill="#000" opacity=".10"/>
      <path d="M260 610 C335 520 450 390 580 185" stroke="${primary}" stroke-width="38" stroke-linecap="round"/>
      <path d="M300 620 C345 650 410 650 455 610" stroke="${secondary}" stroke-width="54" stroke-linecap="round"/>
      <path d="M292 605 C335 635 420 635 465 600" stroke="${light}" stroke-width="14" opacity=".65"/>
      <circle cx="575" cy="190" r="34" fill="${secondary}"/>
    `,
    yerba: `
      <ellipse cx="420" cy="610" rx="175" ry="42" fill="#000" opacity=".10"/>
      <path d="M275 210 H565 L535 645 H305 Z" fill="${primary}"/>
      <path d="M310 260 H530 V500 H310 Z" fill="${light}"/>
      <path d="M330 390 C385 345 450 345 510 390 C450 420 385 420 330 390Z" fill="${secondary}"/>
      <path d="M345 295 H500" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M350 545 H490" stroke="${light}" stroke-width="22" opacity=".45" stroke-linecap="round"/>
    `,
    termo: `
      <ellipse cx="420" cy="625" rx="145" ry="36" fill="#000" opacity=".10"/>
      <rect x="330" y="160" width="180" height="485" rx="62" fill="${primary}"/>
      <rect x="360" y="110" width="120" height="90" rx="28" fill="${secondary}"/>
      <rect x="380" y="70" width="80" height="60" rx="18" fill="${primary}"/>
      <path d="M385 205 H455" stroke="${light}" stroke-width="12" opacity=".6" stroke-linecap="round"/>
      <path d="M370 250 V570" stroke="${light}" stroke-width="18" opacity=".18" stroke-linecap="round"/>
    `,
    yerbera: `
      <ellipse cx="420" cy="620" rx="160" ry="42" fill="#000" opacity=".10"/>
      <path d="M285 250 H545 L515 640 H315 Z" fill="${primary}"/>
      <path d="M315 205 H515 L545 250 H285 Z" fill="${secondary}"/>
      <path d="M360 310 H475 V505 H360 Z" fill="${light}" opacity=".9"/>
      <path d="M555 290 L640 330 L550 365 Z" fill="${secondary}"/>
      <path d="M345 555 H485" stroke="${light}" stroke-width="18" opacity=".45" stroke-linecap="round"/>
    `,
    set: `
      <ellipse cx="420" cy="640" rx="230" ry="45" fill="#000" opacity=".10"/>
      <rect x="455" y="130" width="120" height="365" rx="46" fill="${primary}"/>
      <path d="M230 335 C230 265 440 265 440 335 L410 590 C402 650 268 650 260 590 Z" fill="${secondary}"/>
      <ellipse cx="335" cy="335" rx="88" ry="26" fill="${light}"/>
      <path d="M392 300 L495 165" stroke="#d8c18b" stroke-width="16" stroke-linecap="round"/>
      <path d="M520 520 H640 L625 650 H535 Z" fill="${light}"/>
    `,
    cepillo: `
      <ellipse cx="420" cy="615" rx="210" ry="42" fill="#000" opacity=".10"/>
      <path d="M215 570 L580 205" stroke="${primary}" stroke-width="32" stroke-linecap="round"/>
      <path d="M540 160 L655 275" stroke="${secondary}" stroke-width="58" stroke-linecap="round"/>
      <path d="M510 190 L626 306" stroke="${light}" stroke-width="12" stroke-linecap="round" opacity=".75"/>
      <path d="M560 128 L690 258" stroke="${primary}" stroke-width="8" stroke-linecap="round" opacity=".75"/>
      <path d="M530 128 L690 288" stroke="${primary}" stroke-width="8" stroke-linecap="round" opacity=".75"/>
    `,
  };

  return shapes[subject] || shapes.mate;
};

const imageSvg = (product) => {
  const [primary, secondary, light] = product.palette;

  return `
  <svg width="900" height="900" viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="38%" r="70%">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="58%" stop-color="#efe5d1"/>
        <stop offset="100%" stop-color="#d8c5a4"/>
      </radialGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity=".18"/>
      </filter>
    </defs>
    <rect width="900" height="900" fill="url(#bg)"/>
    <circle cx="720" cy="170" r="120" fill="${secondary}" opacity=".12"/>
    <circle cx="145" cy="725" r="150" fill="${primary}" opacity=".10"/>
    <g filter="url(#softShadow)">
      ${productShape(product.subject, product.palette)}
    </g>
  </svg>`;
};

const createImages = async () => {
  for (const product of newProducts) {
    const output = path.join(publicDir, product.image.replace("/", ""));
    await sharp(Buffer.from(imageSvg(product)))
      .jpeg({ quality: 88 })
      .toFile(output);
  }
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");

    await createImages();
    console.log(`${newProducts.length} imagenes generadas`);

    const stockResult = await Product.updateMany({}, { $max: { quantity: 20 } });
    console.log(`Stock actualizado en ${stockResult.modifiedCount} productos existentes`);

    for (const product of newProducts) {
      const { palette, subject, ...productData } = product;
      await Product.findOneAndUpdate(
        { name: productData.name },
        { $set: productData },
        { upsert: true, returnDocument: "after", runValidators: true }
      );
    }

    console.log(`${newProducts.length} productos nuevos insertados/actualizados`);
    await mongoose.disconnect();
    console.log("Listo!");
  } catch (error) {
    console.error("Error cargando productos extra:", error.message);
    process.exitCode = 1;
  }
};

seed();
