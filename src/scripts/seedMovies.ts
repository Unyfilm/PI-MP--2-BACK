/**
 * Script to seed the database with sample movies
 * This script adds movies with Cloudinary video IDs for testing
 */

import mongoose from 'mongoose';
import { config } from '../config/environment';
import { Movie } from '../models/Movie';

/**
 * Sample movies data with Cloudinary video IDs
 */
const sampleMovies = [
    {
      title: "Superman (2025)",
      description: "Una nueva visión del Hombre de Acero dirigida por James Gunn que reinicia el universo de DC Studios.",
      synopsis: "Clark Kent intenta equilibrar su herencia kryptoniana con su vida como humano mientras enfrenta una amenaza que pondrá a prueba su fe en la humanidad.",
      releaseDate: new Date('2025-07-11'),
      duration: 150,
      genre: ["Acción", "Aventura", "Superhéroes"],
      director: "James Gunn",
      cast: ["David Corenswet", "Rachel Brosnahan", "Nicholas Hoult"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093634/movies/posters/superman.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101440/movies/ports/superman.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1761093331/movies/videos/Superman.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1761093331/movies/videos/Superman.mp4",
      cloudinaryVideoId: "movies/videos/Superman",
      language: "es",
      tags: ["dc", "superhéroe", "acción", "aventura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Mortal Kombat 2",
      description: "La secuela del reinicio de 2021 introduce a nuevos personajes como Johnny Cage y Shao Kahn.",
      synopsis: "Los campeones de la Tierra deben entrenar para el verdadero Torneo Mortal Kombat, enfrentando a Shao Kahn y Quan Chi en una batalla definitiva.",
      releaseDate: new Date('2025-10-24'),
      duration: 130,
      genre: ["Acción", "Fantasía", "Artes Marciales"],
      director: "Simon McQuoid",
      cast: ["Lewis Tan", "Karl Urban", "Hiroyuki Sanada", "Tati Gabrielle"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093636/movies/posters/mortalkombta.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101436/movies/ports/mortalkombat.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675010/movies/videos/MortalKombat2.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675010/movies/videos/MortalKombat2.mp4",
      cloudinaryVideoId: "movies/videos/MortalKombat2",
      language: "es",
      tags: ["mortal-kombat", "fantasía", "acción", "artes-marciales"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Tron: Ares",
      description: "La tercera entrega de la saga Tron protagonizada por Jared Leto y dirigida por Joachim Rønning.",
      synopsis: "Un programa digital llamado Ares se materializa en el mundo real, desatando un conflicto entre humanos y sistemas virtuales.",
      releaseDate: new Date('2025-10-10'),
      duration: 130,
      genre: ["Acción", "Ciencia Ficción"],
      director: "Joachim Rønning",
      cast: ["Jared Leto", "Evan Peters", "Greta Lee"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093635/movies/posters/tronares.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101441/movies/ports/tron_ares.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675001/movies/videos/TronAres.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675001/movies/videos/TronAres.mp4",
      cloudinaryVideoId: "movies/videos/TronAres",
      language: "es",
      tags: ["tron", "ciencia-ficción", "acción", "realidad-virtual"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Avatar: El Origen del Agua",
      description: "La secuela del éxito de James Cameron expande el universo de Pandora hacia los océanos.",
      synopsis: "Jake Sully y Neytiri protegen a su familia mientras descubren nuevas tribus bajo el mar de Pandora y enfrentan una nueva amenaza humana.",
      releaseDate: new Date('2022-12-16'),
      duration: 192,
      genre: ["Acción", "Aventura", "Ciencia Ficción"],
      director: "James Cameron",
      cast: ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver", "Kate Winslet"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093626/movies/posters/avatar.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101426/movies/ports/avatar_el_camino_del_agua.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675000/movies/videos/Avatar2.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675000/movies/videos/Avatar2.mp4",
      cloudinaryVideoId: "movies/videos/Avatar2",
      language: "es",
      tags: ["avatar", "ciencia-ficción", "pandora", "aventura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Primate (2026)",
      description: "Un thriller de ciencia ficción sobre los límites de la evolución y la manipulación genética.",
      synopsis: "Un grupo de científicos crea una nueva especie híbrida entre humanos y primates, desatando un dilema ético y una lucha por el control.",
      releaseDate: new Date('2026-03-20'),
      duration: 118,
      genre: ["Ciencia Ficción", "Thriller"],
      director: "Rupert Wyatt",
      cast: ["Idris Elba", "Naomie Harris"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093632/movies/posters/primate.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101438/movies/ports/primate.webp",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674999/movies/videos/Primate.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674999/movies/videos/Primate.mp4",
      cloudinaryVideoId: "movies/videos/Primate",
      language: "es",
      tags: ["thriller", "ciencia-ficción", "evolución"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Depredador: Tierras Salvajes",
      description: "Una nueva entrega de la saga Depredador ambientada en un entorno salvaje y primitivo.",
      synopsis: "Un grupo de soldados y científicos se enfrentan a una versión evolucionada del Depredador en una jungla hostil.",
      releaseDate: new Date('2026-08-14'),
      duration: 125,
      genre: ["Acción", "Ciencia Ficción", "Terror"],
      director: "Dan Trachtenberg",
      cast: ["Amber Midthunder", "Dane DiLiegro"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093626/movies/posters/depredador_tierras_salvajes.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101426/movies/ports/depredador_tierras_salvajes.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/DepredadorTierrasSalvajes.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/DepredadorTierrasSalvajes.mp4",
      cloudinaryVideoId: "movies/videos/DepredadorTierrasSalvajes",
      language: "es",
      tags: ["predator", "acción", "terror", "ciencia-ficción"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Jujutsu Kaisen: Execution",
      description: "Una nueva película del universo Jujutsu Kaisen que continúa los eventos tras el Arco de Shibuya.",
      synopsis: "Yuji Itadori y sus aliados enfrentan el caos desatado por Sukuna, mientras nuevas maldiciones emergen de las sombras.",
      releaseDate: new Date('2025-12-13'),
      duration: 122,
      genre: ["Acción", "Animación", "Fantasía Oscura"],
      director: "Sunghoo Park",
      cast: ["Junya Enoki", "Yuma Uchida", "Asami Seto"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093629/movies/posters/jujtsukaisen.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101430/movies/ports/jujutsu_kaisen.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/movies/videos/JujutsuKaisen.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/movies/videos/JujutsuKaisen.mp4",
      cloudinaryVideoId: "movies/videos/JujutsuKaisen",
      language: "es",
      tags: ["anime", "jujutsu-kaisen", "acción", "fantasía-oscura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Frankenstein (2025)",
      description: "Guillermo del Toro dirige una reinterpretación moderna del clásico de Mary Shelley.",
      synopsis: "Un científico obsesionado con vencer a la muerte crea una criatura que cuestiona los límites de la humanidad y la moral.",
      releaseDate: new Date('2025-10-31'),
      duration: 140,
      genre: ["Drama", "Terror", "Ciencia Ficción"],
      director: "Guillermo del Toro",
      cast: ["Oscar Isaac", "Mia Goth", "Andrew Garfield", "Christoph Waltz"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093627/movies/posters/frankenstein.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101433/movies/ports/frankenstein.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/Frankenstein.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/Frankenstein.mp4",
      cloudinaryVideoId: "movies/videos/Frankenstein",
      language: "es",
      tags: ["terror", "drama", "frankenstein", "guillermo-del-toro"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Kimetsu no Yaiba: Castillo Infinito",
      description: "La batalla final de los cazadores de demonios contra Muzan Kibutsuji en el Castillo Infinito.",
      synopsis: "Tanjiro y los Pilares se enfrentan al enemigo definitivo en una batalla épica que decidirá el destino de la humanidad.",
      releaseDate: new Date('2025-02-21'),
      duration: 130,
      genre: ["Acción", "Aventura", "Animación", "Fantasía"],
      director: "Haruo Sotozaki",
      cast: ["Natsuki Hanae", "Akari Kitō", "Hiro Shimono", "Yoshitsugu Matsuoka"],
      poster: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761093630/movies/posters/kimetsunoyaiba.jpg",
      port: "https://res.cloudinary.com/dlyqtvvxv/image/upload/v1761101435/movies/ports/kimetsu_no_yaiba.png",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/KimetsunoYaiba.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/movies/videos/KimetsunoYaiba.mp4",
      cloudinaryVideoId: "movies/videos/KimetsunoYaiba",
      language: "es",
      tags: ["anime", "acción", "fantasía", "batalla-final"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    }
  ];

/**
 * Connect to MongoDB
 */
async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

/**
 * Seed the database with sample movies
 */
async function seedMovies(): Promise<void> {
  try {
    console.log('🌱 Starting to seed movies...');

    // Clear existing movies (optional - remove this if you want to keep existing data)
    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing movies');

    // Insert sample movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`✅ Successfully inserted ${insertedMovies.length} movies`);

    // Display inserted movies
    console.log('\n📽️ Inserted movies:');
    insertedMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.releaseDate.getFullYear()})`);
      console.log(`   Genre: ${movie.genre.join(', ')}`);
      console.log(`   Duration: ${movie.duration} minutes`);
      console.log(`   Cloudinary ID: ${movie.cloudinaryVideoId}`);
      console.log('');
    });

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    await connectToDatabase();
    await seedMovies();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedMovies, sampleMovies };
