import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = process.env.WISHES_DATA_PATH || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "wishes.json");

const INITIAL_WISHES = [
  {
    "id": 1,
    "name": "Sarah Mansaray",
    "role": "Senior Geologist, NMA",
    "initials": "SM",
    "wish": "Happy Birthday, Minister Mattai! Thank you for your visionary leadership in transforming our geological surveys. Wishing you a year of breakthroughs!",
    "color": "#00f2fe"
  },
  {
    "id": 2,
    "name": "David Kamara",
    "role": "Managing Director, INTEGEMS",
    "initials": "DK",
    "wish": "To our founder, mentor, and CEO: wishing you a fantastic birthday! Your dedication to environmental research continues to inspire all of us daily.",
    "color": "#ff007f"
  },
  {
    "id": 3,
    "name": "Fatmata Sesay",
    "role": "Policy Advisor, Ministry of Mines",
    "initials": "FS",
    "wish": "Wishing a very Happy Birthday to an exceptional leader. Your guidance on the Mines and Minerals Act has paved a new path for Sierra Leone.",
    "color": "#4facfe"
  },
  {
    "id": 4,
    "name": "Dr. Joseph Turay",
    "role": "GIS Specialist",
    "initials": "JT",
    "wish": "Happy Birthday, Chief! Hoping your day is as spectacular as a 3D LiDAR scan! Thank you for always pushing the boundaries of GIS.",
    "color": "#00ffcc"
  },
  {
    "id": 5,
    "name": "Aminata Kargbo",
    "role": "Communications Director",
    "initials": "AK",
    "wish": "Happy Birthday to a brilliant geoscientist and leader. Your passion for community development shines in everything you do. Enjoy your day, sir!",
    "color": "#ffc837"
  },
  {
    "id": 6,
    "name": "Michael Bangura",
    "role": "Mineral Economist",
    "initials": "MB",
    "wish": "Warmest birthday wishes, Minister! Your expertise and leadership keep us moving towards a sustainable and transparent mining future.",
    "color": "#b100ff"
  },
  {
    "id": 1782996052979,
    "name": "Mohamed Kamara",
    "role": "ICT Consultant",
    "initials": "MK",
    "wish": "Happy Birthday Julius Mattai",
    "color": "#c5a880"
  }
];

// Helper to ensure path exists and load wishes
async function getWishes() {
  try {
    const dirPath = path.dirname(dataFilePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    try {
      await fs.access(dataFilePath);
    } catch {
      await fs.writeFile(dataFilePath, JSON.stringify(INITIAL_WISHES, null, 2), "utf-8");
    }

    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading/initializing wishes:", error);
    return INITIAL_WISHES;
  }
}

export async function GET() {
  try {
    const wishes = await getWishes();
    return NextResponse.json(wishes);
  } catch (error) {
    console.error("GET wishes error:", error);
    return NextResponse.json({ error: "Failed to read wishes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, wish, color } = body;

    if (!name || !wish) {
      return NextResponse.json({ error: "Name and wish are required fields." }, { status: 400 });
    }

    const wishes = await getWishes();

    // Generate initials from name (e.g., "John Doe" -> "JD")
    const initials = name
      .trim()
      .split(/\s+/)
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newWish = {
      id: Date.now(),
      name: name.trim(),
      role: (role || "Team Member").trim(),
      initials: initials || "?",
      wish: wish.trim(),
      color: color || "#00f2fe",
    };

    wishes.push(newWish);
    
    // Ensure dir path exists before writing
    const dirPath = path.dirname(dataFilePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(wishes, null, 2), "utf-8");

    return NextResponse.json(newWish);
  } catch (error) {
    console.error("POST wishes error:", error);
    return NextResponse.json({ error: "Failed to save wish" }, { status: 500 });
  }
}

