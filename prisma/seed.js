// c:\Users\ampul\OneDrive\Desktop\my-tech-store\prisma\seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
    {
        id: 'ps5-standard',
        name: 'PS5 Standard Edition',
        description: 'Disc drive console with DualSense controller.',
        image: '',
        vendor: 'GameHub',
        price: 420000, // Stored in cents
        category: 'consoles',
        rating: 4.8,
    },
    {
        id: 'ps5-digital',
        name: 'PS5 Digital Edition',
        description: 'Sleeker design without a disc drive.',
        image: '',
        vendor: 'GameHub',
        price: 390000,
        category: 'consoles',
        rating: 4.7,
    },
    {
        id: 'ps5-bundle',
        name: 'PS5 Complete Bundle',
        description: 'Includes controller, game, and headset.',
        image: '',
        vendor: 'Elite Gaming',
        price: 470000,
        category: 'consoles',
        rating: 4.9,
    },
    {
        id: 'samsung-s24',
        name: 'Samsung Galaxy S24',
        description: '200MP camera with flagship performance.',
        image: '',
        vendor: 'TechStore Official',
        price: 540000,
        category: 'android',
        rating: 4.7,
    },
    {
        id: 'oneplus-12',
        name: 'OnePlus 12',
        description: 'Fast charging and clean Android.',
        image: '',
        vendor: 'PhoneHub',
        price: 420000,
        category: 'android',
        rating: 4.6,
    },
    {
        id: 'pixel-8-pro',
        name: 'Google Pixel 8 Pro',
        description: 'AI camera and clean Android experience.',
        image: '',
        vendor: 'GadgetHub',
        price: 510000,
        category: 'android',
        rating: 4.5,
    },
    {
        id: 'iphone-15-pro',
        name: 'iPhone 15 Pro',
        description: 'Titanium body with ProMotion display.',
        image: '',
        vendor: 'Mobile World',
        price: 980000,
        category: 'iphone',
        rating: 4.8,
    },
    {
        id: 'iphone-15-plus',
        name: 'iPhone 15 Plus',
        description: 'Large display and all-day battery.',
        image: '',
        vendor: 'TechStore Official',
        price: 880000,
        category: 'iphone',
        rating: 4.7,
    },
    {
        id: 'iphone-14-pro',
        name: 'iPhone 14 Pro Max',
        description: 'Premium camera system and long battery life.',
        image: '',
        vendor: 'Mobile World',
        price: 760000,
        category: 'iphone',
        rating: 4.6,
    },
    {
        id: 'clear-case',
        name: 'Clear Silicone Case',
        description: 'Slim profile with impact protection.',
        image: '',
        vendor: 'PhoneAccessory',
        price: 25000,
        category: 'cases',
        rating: 4.4,
    },
    {
        id: 'leather-case',
        name: 'Leather Wallet Case',
        description: 'Premium leather with card slots.',
        image: '',
        vendor: 'CaseLab',
        price: 55000,
        category: 'cases',
        rating: 4.6,
    },
    {
        id: 'matte-case',
        name: 'Matte Finish Case',
        description: 'Sleek grip with soft matte texture.',
        image: '',
        vendor: 'CaseLab',
        price: 29000,
        category: 'cases',
        rating: 4.5,
    },
];

async function main() {
    console.log(`Start seeding ...`);
    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                name: p.name,
                description: p.description,
                image: p.image,
                vendor: p.vendor,
                price: p.price,
                category: p.category,
                rating: p.rating,
            },
        });
        console.log(`Created or updated product with id: ${product.id}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });