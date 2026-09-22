export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  description: string;
  highlightSong: string;
  topTracks: string[];
  link: string;
  linkText: string;
}

export interface FavoriteTrack {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: string;
  genre?: string;
}

export const FAVORITE_ARTISTS: Artist[] = [
  {
    id: "xxxtentacion",
    name: "XXXTENTACION",
    genre: "Emo Rap / SoundCloud Era",
    image: "/artists/xxxtentacion.jpg",
    description:
      "Dari Florida, suaranya jadi bagian penting dari gelombang emo-rap tahun 2017. Liriknya campur rasa sakit, kemarahan, dan kerentanan yang jarang ada di rap mainstream.",
    highlightSong: "Fuck Love",
    topTracks: ["Fuck Love", "SAD!", "Jocelyn Flores", "Changes"],
    link: "https://www.xxxtentacion.com",
    linkText: "xxxtentacion.com",
  },
  {
    id: "juicewrld",
    name: "Juice WRLD",
    genre: "Emo Rap / Melodic Trap",
    image: "/artists/juicewrld.jpg",
    description:
      "Fasih ngerap dan nge-sing dengan nada yang sama naturalnya. Sibuk luuahan emosi soal cinta, obat, dan mental health yang bikin banyak orang ngerasa dipahami.",
    highlightSong: "Lucid Dreams",
    topTracks: ["Lucid Dreams", "All Girls Are the Same", "Wasted", "Lean Wit Me"],
    link: "https://juicewrld999.com",
    linkText: "juicewrld999.com",
  },
  {
    id: "kanyewest",
    name: "Kanye West",
    genre: "Hip-Hop / Producer Visionary",
    image: "/artists/kanyewest.jpg",
    description:
      "Lebih dari rapper: dia produser yang menggeser arah hip-hop berkali-kali. Dari chipmunk soul sampai gospel, urusan gaya dan eksperimen bunyi dia paling berani.",
    highlightSong: "True Love",
    topTracks: ["True Love", "Stronger", "Heartless", "POWER"],
    link: "https://www.kanyewest.com",
    linkText: "kanyewest.com",
  },
  {
    id: "biggiesmalls",
    name: "The Notorious B.I.G.",
    genre: "East Coast / Golden Era",
    image: "/artists/biggiesmalls.jpg",
    description:
      "Biggie bawa flow santai tapi penuh karakter yang jadi standar rap East Coast 90-an. Cara dia bercerita soal jalanan dan Jakarta-nya hidup itu beda sendiri.",
    highlightSong: "Juicy",
    topTracks: ["Juicy", "Big Poppa", "Hypnotize", "Mo Money Mo Problems"],
    link: "https://www.notoriousbig.com",
    linkText: "notoriousbig.com",
  },
  {
    id: "eazye",
    name: "Eazy-E",
    genre: "West Coast / Gangsta Rap",
    image: "/artists/eazye.jpg",
    description:
      "Salah satu perintis gangsta rap dari Compton. Suara khas dan gaya berceritanya yang nggak basa-basi bikin Eazy-E jadi legenda yang nggak lekang zaman.",
    highlightSong: "Boyz-n-the-Hood",
    topTracks: ["Boyz-n-the-Hood", "Eazy-Duz-It", "Real Muthaphuckkin G's", "Ruthless Villain"],
    link: "https://en.wikipedia.org/wiki/Eazy-E",
    linkText: "Eazy-E • Wikipedia",
  },
  {
    id: "tupac",
    name: "2Pac",
    genre: "West Coast / Conscious Rap",
    image: "/artists/tupac.jpg",
    description:
      "Penyair, aktor, dan ikon budaya. 2Pac dikenal karena rap yang emosional, sosial, dan politis sekaligus; juga salah satu pembawa bakat paling cemerlang di hip-hop.",
    highlightSong: "Changes",
    topTracks: ["Changes", "Dear Mama", "California Love", "Hail Mary"],
    link: "https://en.wikipedia.org/wiki/Tupac_Shakur",
    linkText: "2Pac • Wikipedia",
  },
  {
    id: "hindia",
    name: "Hindia",
    genre: "Indie Pop / Alternative",
    image: "/artists/hindia.jpg",
    description:
      "Musisi dan penulis lirik asal Jakarta. Tulisannya tajam, introspektif, dan jujur soal hidup di generasi sekarang — cocok banget buat teman begadang.",
    highlightSong: "everything u are",
    topTracks: ["everything u are", "Secukupnya", "Evaluasi", "Membasuh"],
    link: "https://www.instagram.com/wordfangs",
    linkText: "@wordfangs",
  },
];

export const FAVORITE_TRACKS: FavoriteTrack[] = [
  {
    id: "track-1",
    title: "Fuck Love",
    artist: "XXXTENTACION ft. Trippie Redd",
    album: "?",
    duration: "2:27",
    genre: "Emo Rap",
  },
  {
    id: "track-2",
    title: "True Love",
    artist: "Kanye West & XXXTENTACION",
    album: "Donda 2",
    duration: "2:40",
    genre: "Hip-Hop",
  },
  {
    id: "track-3",
    title: "Take Note",
    artist: "Juice WRLD",
    duration: "2:29",
    genre: "Emo Rap",
  },
  {
    id: "track-4",
    title: "We Know How We Do It",
    artist: "Curated Local Favorites",
    album: "Satu Frekuensi",
    duration: "3:00",
    genre: "Hip-Hop",
  },
  {
    id: "track-5",
    title: "Boyz-n-the-Hood",
    artist: "Eazy-E",
    album: "Eazy-Duz-It",
    duration: "5:35",
    genre: "West Coast",
  },
  {
    id: "track-6",
    title: "everything u are",
    artist: "Hindia",
    album: "Doves, '25 on Blank Canvas",
    duration: "3:56",
    genre: "Indie Pop",
  },
  {
    id: "track-7",
    title: "Changes",
    artist: "2Pac",
    album: "Still I Rise",
    duration: "4:30",
    genre: "Hip-Hop",
  },
];