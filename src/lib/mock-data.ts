import logoAsset from "@/assets/zombierex-logo.png.asset.json";
import bike1 from "@/assets/post-bike-1.jpg";
import car1 from "@/assets/post-car-1.jpg";
import eventRide from "@/assets/event-ride.jpg";
import partCarb from "@/assets/part-carb.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

export const brand = {
  logo: logoAsset.url,
  name: "ZOMBIEREX",
  tagline: "Ride. Rev. Resurrect.",
};

export type User = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  verified?: boolean;
  location: string;
};

export const users: User[] = [
  { id: "u1", handle: "@ghost_rider", name: "Marcus Vale", avatar: avatar1, verified: true, location: "Los Angeles, CA" },
  { id: "u2", handle: "@rev_queen", name: "Nadia Kross", avatar: avatar2, verified: true, location: "Berlin, DE" },
  { id: "u3", handle: "@wrench_daddy", name: "Otis Grim", avatar: avatar3, location: "Austin, TX" },
];

export type Vehicle = {
  id: string;
  name: string;
  type: "Motorcycle" | "Car";
  year: number;
  hp: number;
  cover: string;
  ownerId: string;
  mods: string[];
};

export const vehicles: Vehicle[] = [
  { id: "v1", name: "Nightshade MT-09", type: "Motorcycle", year: 2024, hp: 117, cover: bike1, ownerId: "u1", mods: ["Akrapovic full exhaust", "Ohlins fork cartridges", "Green LED rim tape"] },
  { id: "v2", name: "Widow GT86", type: "Car", year: 2023, hp: 340, cover: car1, ownerId: "u2", mods: ["Rocket Bunny widebody", "Turbo kit", "Custom underglow"] },
];

export type Post = {
  id: string;
  user: User;
  vehicle?: Vehicle;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  tags: string[];
};

export const posts: Post[] = [
  {
    id: "p1",
    user: users[0],
    vehicle: vehicles[0],
    image: bike1,
    caption: "Night therapy. Fresh green tape on the wheels — undead approved. 🧟",
    likes: 2841, comments: 128, timeAgo: "2h",
    tags: ["#nakedbike", "#nightride", "#zombierex"],
  },
  {
    id: "p2",
    user: users[1],
    vehicle: vehicles[1],
    image: car1,
    caption: "Widebody fully wrapped. Berlin meet on Saturday — who's rolling?",
    likes: 5210, comments: 342, timeAgo: "6h",
    tags: ["#widebody", "#jdm", "#meet"],
  },
  {
    id: "p3",
    user: users[2],
    image: partCarb,
    caption: "Rebuilt this 40mm carb from a '78 CB. She's alive again.",
    likes: 987, comments: 54, timeAgo: "1d",
    tags: ["#restoration", "#wrenchlife"],
  },
];

export type EventItem = {
  id: string;
  title: string;
  kind: "Ride" | "Meet" | "Rally" | "Race";
  date: string;
  time: string;
  location: string;
  distance: string;
  attending: number;
  cover: string;
  club: string;
};

export const events: EventItem[] = [
  { id: "e1", title: "Canyon Devils Night Ride", kind: "Ride", date: "SAT · NOV 22", time: "20:00", location: "Angeles Crest, CA", distance: "12 mi away", attending: 84, cover: eventRide, club: "Undead MC" },
  { id: "e2", title: "Berlin JDM Meetup vol. 07", kind: "Meet", date: "SUN · NOV 23", time: "14:00", location: "Tempelhof, Berlin", distance: "3.5 mi away", attending: 312, cover: car1, club: "REX Berlin" },
  { id: "e3", title: "Grave Digger Rally", kind: "Rally", date: "FRI · DEC 05", time: "09:00", location: "Death Valley, NV", distance: "220 mi away", attending: 1207, cover: bike1, club: "ZOMBIEREX Official" },
];

export type Listing = {
  id: string;
  title: string;
  price: string;
  condition: "New" | "Used" | "Refurbished";
  image: string;
  location: string;
  seller: User;
  category: "Vehicle" | "Parts" | "Gear";
};

export const listings: Listing[] = [
  { id: "l1", title: "2021 Kawasaki Z900 · Blacked out", price: "$8,400", condition: "Used", image: bike1, location: "Los Angeles", seller: users[0], category: "Vehicle" },
  { id: "l2", title: "Rocket Bunny widebody kit — GT86", price: "$2,150", condition: "New", image: car1, location: "Berlin", seller: users[1], category: "Parts" },
  { id: "l3", title: "Rebuilt 40mm PWK carburetor", price: "$180", condition: "Refurbished", image: partCarb, location: "Austin", seller: users[2], category: "Parts" },
  { id: "l4", title: "Shoei RF-1400 · Matte black, size M", price: "$420", condition: "Used", image: avatar1, location: "San Diego", seller: users[0], category: "Gear" },
];

export type Club = {
  id: string;
  name: string;
  members: number;
  city: string;
  cover: string;
  tag: string;
};

export const clubs: Club[] = [
  { id: "c1", name: "Undead MC", members: 1420, city: "Los Angeles", cover: bike1, tag: "Sportbike" },
  { id: "c2", name: "REX Berlin", members: 890, city: "Berlin", cover: car1, tag: "JDM" },
  { id: "c3", name: "Grave Diggers", members: 3210, city: "Nationwide", cover: eventRide, tag: "Cruisers" },
];

export type Chat = {
  id: string;
  user: User;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  online?: boolean;
};

export const chats: Chat[] = [
  { id: "ch1", user: users[1], lastMessage: "Bring the widebody Saturday 🖤", timeAgo: "2m", unread: 2, online: true },
  { id: "ch2", user: users[0], lastMessage: "Voice message · 0:24", timeAgo: "1h", unread: 0, online: true },
  { id: "ch3", user: users[2], lastMessage: "Carb's ready when you are.", timeAgo: "yesterday", unread: 0 },
];

export const stories = users.map((u, i) => ({ id: `s${i}`, user: u, live: i === 0 }));

export const me: User = {
  id: "me",
  handle: "@rider_x",
  name: "You",
  avatar: avatar1,
  location: "Somewhere fast",
};

export const myVehicles: Vehicle[] = [vehicles[0]];
