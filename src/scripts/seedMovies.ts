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
      title: "Mortal Kombat 2",
      description: "Tras la primera entrega, los guerreros de Earthrealm, ahora con el campeón Johnny Cage, se preparan para el verdadero torneo de Mortal Kombat",
      synopsis: "Tras la primera entrega, los guerreros de Earthrealm, ahora con el campeón Johnny Cage, se preparan para el verdadero torneo de Mortal Kombat",
      releaseDate: new Date('2025-10-24'),
      duration: 130,
      genre: ["Acción", "Fantasía", "Artes Marciales"],
      director: "Simon McQuoid",
      cast: ["Lewis Tan", "Karl Urban", "Hiroyuki Sanada", "Tati Gabrielle"],
      poster: "imagen/mortal kombat 2.jpg",
      port: "imagen/mortal kombat 2.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675010/MORTAL_KOMBAT_2_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_ns6i1g.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675010/MORTAL_KOMBAT_2_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_ns6i1g.mp4",
      cloudinaryVideoId: "MORTAL_KOMBAT_2_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_ns6i1g",
      language: "es",
      tags: ["mortal-kombat", "fantasía", "acción", "artes-marciales"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Tron Ares",
      description: "La historia sigue a Ares, un programa de inteligencia artificial extremadamente avanzado, que es enviado desde el mundo digital al mundo real en una misión arriesgada.",
      synopsis: "La historia sigue a Ares, un programa de inteligencia artificial extremadamente avanzado, que es enviado desde el mundo digital al mundo real en una misión arriesgada. Su llegada supone el primer contacto entre la humanidad y la IA, lo que desafía los límites tecnológicos y éticos existentes.",
      releaseDate: new Date('2025-10-10'),
      duration: 130,
      genre: ["Ciencia Ficción"],
      director: "Joachim Rønning",
      cast: ["Jared Leto", "Evan Peters", "Greta Lee"],
      poster: "images\\pelis P\\tron ares.jpg",
      port: "images\\pelis P\\tron ares.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675001/Tron__Ares___Tr%C3%A1iler_oficial___Doblado_dksfhb.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675001/Tron__Ares___Tr%C3%A1iler_oficial___Doblado_dksfhb.mp4",
      cloudinaryVideoId: "Tron__Ares___Tr%C3%A1iler_oficial___Doblado_dksfhb",
      language: "es",
      tags: ["tron", "ciencia-ficción", "inteligencia-artificial"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Avatar - El Camino Del Agua",
      description: "Después de vivir en paz con su familia en Pandora, Jake y Neytiri deben huir cuando las fuerzas humanas regresan para continuar su misión de explotación",
      synopsis: "Después de vivir en paz con su familia en Pandora, Jake y Neytiri deben huir cuando las fuerzas humanas, representadas por la RDA y lideradas por el reencarnado coronel Quaritch en un avatar, regresan para continuar su misión de explotación",
      releaseDate: new Date('2022-12-16'),
      duration: 192,
      genre: ["Ciencia Ficción", "Acción", "Aventura"],
      director: "James Cameron",
      cast: ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver", "Kate Winslet"],
      poster: "images\\pelis P\\avatar el camino del agua.jpg",
      port: "images\\pelis P\\avatar el camino del agua.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675000/videoplayback_p15xzq.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760675000/videoplayback_p15xzq.mp4",
      cloudinaryVideoId: "videoplayback_p15xzq",
      language: "es",
      tags: ["avatar", "ciencia-ficción", "pandora", "aventura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "PRIMATE",
      description: "La trama sigue a Lucy, quien regresa a casa para reencontrarse con su familia y su mascota chimpancé Ben. Durante una fiesta en la piscina, Ben contrae la rabia, lo que lo convierte en una amenaza agresiva.",
      synopsis: "La trama sigue a Lucy, quien regresa a casa para reencontrarse con su familia y su mascota chimpancé Ben. Durante una fiesta en la piscina, Ben contrae la rabia, lo que lo convierte en una amenaza agresiva. Los jóvenes, liderados por Lucy, se atrincheran en la piscina mientras intentan idear una estrategia para sobrevivir al chimpancé furioso",
      releaseDate: new Date('2026-03-20'),
      duration: 118,
      genre: ["Slasher", "Suspense", "Terror"],
      director: "Rupert Wyatt",
      cast: ["Idris Elba", "Naomie Harris"],
      poster: "images\\pelis P\\primate.jpg",
      port: "images\\pelis P\\primate.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674999/PRIMATE_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2026_Terror_caeew7.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674999/PRIMATE_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2026_Terror_caeew7.mp4",
      cloudinaryVideoId: "PRIMATE_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2026_Terror_caeew7",
      language: "es",
      tags: ["terror", "slasher", "suspense", "chimpancé"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Jujutsu Kaisen - Ejecucion",
      description: "Tras los acontecimientos de shibuya, diez colonias en Japón se transforman en nidos de maldiciones en un plan orquestado por Noritoshi Kamo, el hechicero más perverso de la historia.",
      synopsis: "Tras los acontecimientos de shibuya, diez colonias en Japón se transforman en nidos de maldiciones en un plan orquestado por Noritoshi Kamo, el hechicero más perverso de la historia. Con el inicio del mortal Culling Game, el hechicero de Grado Especial Yuta Okkotsu es asignado para ejecutar a Yuji por sus presuntos crímenes.",
      releaseDate: new Date('2025-12-13'),
      duration: 122,
      genre: ["Acción", "Fantasía", "Horror Sobrenatural"],
      director: "Sunghoo Park",
      cast: ["Junya Enoki", "Yuma Uchida", "Asami Seto"],
      poster: "images\\pelis P\\jujutsu kaisen.jpg",
      port: "images\\pelis P\\jujutsu kaisen.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/JUJUTSU_KAISEN__Ejecuci%C3%B3n___TR%C3%81ILER_OFICIAL_rfztyf.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/JUJUTSU_KAISEN__Ejecuci%C3%B3n___TR%C3%81ILER_OFICIAL_rfztyf.mp4",
      cloudinaryVideoId: "JUJUTSU_KAISEN__Ejecuci%C3%B3n___TR%C3%81ILER_OFICIAL_rfztyf",
      language: "es",
      tags: ["anime", "jujutsu-kaisen", "acción", "fantasía-oscura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "El caballero de los siete reinos",
      description: "Ser Duncan el Alto, un caballero ingenuo pero valiente, y su joven escudero, Egg, quienes viajan por Poniente un siglo antes de Juego de Tronos.",
      synopsis: "Ser Duncan el Alto, un caballero ingenuo pero valiente, y su joven escudero, Egg, quienes viajan por Poniente un siglo antes de Juego de Tronos. La historia explora su amistad mientras se enfrentan a destinos, enemigos y hazañas peligrosas durante una época de paz relativa bajo el reinado Targaryen",
      releaseDate: new Date('2025-02-21'),
      duration: 130,
      genre: ["Fantasía Heroica", "Drama", "Aventura"],
      director: "Haruo Sotozaki",
      cast: ["Natsuki Hanae", "Akari Kitō", "Hiro Shimono", "Yoshitsugu Matsuoka"],
      poster: "images\\pelis P\\el caballero de los siete reinos",
      port: "images\\pelis P\\el caballero de los siete reinos",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/EL_CABALLERO_DE_LOS_SIETE_REINOS_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_xwjzzo.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674998/EL_CABALLERO_DE_LOS_SIETE_REINOS_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_xwjzzo.mp4",
      cloudinaryVideoId: "EL_CABALLERO_DE_LOS_SIETE_REINOS_Tr%C3%A1iler_Espa%C3%B1ol_Latino_2025_xwjzzo",
      language: "es",
      tags: ["game-of-thrones", "fantasía", "drama", "aventura"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Depredador - Tierras Salvajes",
      description: "La nueva entrega de la franquicia DEPREDADOR está ambientada en un futuro distante, en un planeta remoto, donde un joven depredador desterrado por su clan encuentra una aliada inesperada.",
      synopsis: "La nueva entrega de la franquicia DEPREDADOR está ambientada en un futuro distante, en un planeta remoto, donde un joven depredador (Dimitrius Schuster-Koloamatangi), desterrado por su clan, encuentra una aliada inesperada en Thia (Elle Fanning) y emprende un peligroso viaje en busca de un digno oponente.",
      releaseDate: new Date('2026-08-14'),
      duration: 125,
      genre: ["Ciencia Ficción", "Terror", "Acción", "Aventura"],
      director: "Dan Trachtenberg",
      cast: ["Amber Midthunder", "Dane DiLiegro"],
      poster: "images\\pelis P\\depredador tierras salvajes.jpg",
      port: "images\\pelis P\\depredador tierras salvajes.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/DEPREDADOR__TIERRAS_SALVAJES_Tr%C3%A1iler_3_Espa%C3%B1ol_Latino_2025_zigmux.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/DEPREDADOR__TIERRAS_SALVAJES_Tr%C3%A1iler_3_Espa%C3%B1ol_Latino_2025_zigmux.mp4",
      cloudinaryVideoId: "DEPREDADOR__TIERRAS_SALVAJES_Tr%C3%A1iler_3_Espa%C3%B1ol_Latino_2025_zigmux",
      language: "es",
      tags: ["predator", "acción", "terror", "ciencia-ficción"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Frankenstein (2025)",
      description: "La historia universal cuenta cómo la obsesión de un doctor por revivir a los muertos y darles la vida de manera científica hace que, sorprendentemente, nazca el monstruo Frankenstein.",
      synopsis: "La historia universal cuenta cómo la obsesión de un doctor por revivir a los muertos y darles la vida de manera científica hace que, sorprendentemente, nazca el monstruo Frankenstein. Después de indagar y emplear su valioso tiempo en documentarse y estudiar si su plan podría tener buenos resultados, sabe que debe adquirir miembros del cuerpo de muertos.",
      releaseDate: new Date('2025-10-31'),
      duration: 140,
      genre: ["Terror", "Drama", "Ciencia Ficción"],
      director: "Guillermo del Toro",
      cast: ["Oscar Isaac", "Mia Goth", "Andrew Garfield", "Christoph Waltz"],
      poster: "images\\pelis P\\frankenstein.jpg",
      port: "images\\pelis P\\frankenstein.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/Frankenstein___Guillermo_del_Toro___Official_Trailer___Netflix_oahh3j.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/Frankenstein___Guillermo_del_Toro___Official_Trailer___Netflix_oahh3j.mp4",
      cloudinaryVideoId: "Frankenstein___Guillermo_del_Toro___Official_Trailer___Netflix_oahh3j",
      language: "es",
      tags: ["terror", "drama", "frankenstein", "guillermo-del-toro"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Demon Slayer Kimetsu no Yaiba The Movie: Infinity Castle",
      description: "El Cuerpo de Cazadores de Demonios se enfrenta a los Doce Kizuki restantes antes de enfrentarse a Muzan en el Castillo del Infinito para derrotarlo de una vez por todas.",
      synopsis: "El Cuerpo de Cazadores de Demonios se enfrenta a los Doce Kizuki restantes antes de enfrentarse a Muzan en el Castillo del Infinito para derrotarlo de una vez por todas.",
      releaseDate: new Date('2025-02-21'),
      duration: 130,
      genre: ["Acción", "Aventura", "Fantasía Oscura", "Drama", "Animación"],
      director: "Haruo Sotozaki",
      cast: ["Natsuki Hanae", "Akari Kitō", "Hiro Shimono", "Yoshitsugu Matsuoka"],
      poster: "images\\pelis P\\kimetsu no yaiba",
      port: "images\\pelis P\\kimetsu no yaiba",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/Demon_Slayer__Kimetsu_no_Yaiba_Castillo_Infinito_-_Tr%C3%A1iler_Oficial_cynkvy.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760674997/Demon_Slayer__Kimetsu_no_Yaiba_Castillo_Infinito_-_Tr%C3%A1iler_Oficial_cynkvy.mp4",
      cloudinaryVideoId: "Demon_Slayer__Kimetsu_no_Yaiba_Castillo_Infinito_-_Tr%C3%A1iler_Oficial_cynkvy",
      language: "es",
      tags: ["anime", "acción", "fantasía", "batalla-final"],
      isActive: true,
      views: 0,
      rating: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    },
    {
      title: "Superman",
      description: "Lex Luthor orquestra un plan para terminar con Superman de una vez por todas. ¿Podrán la intrépida periodista Lois Lane y el compañero de cuatro patas de Superman, Krypto, ayudarlo antes de que sea demasiado tarde?",
      synopsis: "Lex Luthor orquestra un plan para terminar con Superman de una vez por todas. ¿Podrán la intrépida periodista Lois Lane y el compañero de cuatro patas de Superman, Krypto, ayudarlo antes de que sea demasiado tarde?",
      releaseDate: new Date('2025-07-11'),
      duration: 150,
      genre: ["Acción", "Aventura", "Fantasía", "Ciencia Ficción"],
      director: "James Gunn",
      cast: ["David Corenswet", "Rachel Brosnahan", "Nicholas Hoult"],
      poster: "images\\pelis P\\superman.jpg",
      port: "images\\pelis P\\superman.jpg",
      trailer: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760673516/Superman___Tr%C3%A1iler_Oficial___Doblado_xqwa1x.mp4",
      videoUrl: "https://res.cloudinary.com/dlyqtvvxv/video/upload/v1760673516/Superman___Tr%C3%A1iler_Oficial___Doblado_xqwa1x.mp4",
      cloudinaryVideoId: "Superman___Tr%C3%A1iler_Oficial___Doblado_xqwa1x",
      language: "es",
      tags: ["dc", "superhéroe", "acción", "aventura"],
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

    await Movie.deleteMany({});
    console.log('🗑️ Cleared existing movies');

    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`✅ Successfully inserted ${insertedMovies.length} movies`);

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

if (require.main === module) {
  main();
}

export { seedMovies, sampleMovies };
