export interface Room {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  per: string;
  size: string;
  guests: number;
  bed: string;
  images: string[];
  description: string;
  amenities: string[];
  featured: boolean;
  rating: number;
  reviews: number;
}

export const rooms: Room[] = [
  {
    id: "presidential-suite",
    name: "Presidential Suite",
    tagline: "Ultimate luxury with panoramic city views",
    price: 1299,
    currency: "$",
    per: "night",
    size: "120 m²",
    guests: 4,
    bed: "King + Queen",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    description: "Experience unparalleled luxury in our Presidential Suite. Featuring a private terrace, marble bathroom with soaking tub, separate living room, and 24/7 butler service.",
    amenities: ["Ocean View", "Butler Service", "Jacuzzi", "Smart Home", "Mini Bar", "WiFi"],
    featured: true,
    rating: 4.9,
    reviews: 128
  },
  {
    id: "deluxe-king",
    name: "Deluxe King Room",
    tagline: "Modern comfort with premium amenities",
    price: 459,
    currency: "$",
    per: "night",
    size: "45 m²",
    guests: 2,
    bed: "King Size",
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"
    ],
    description: "Spacious deluxe room with floor-to-ceiling windows, premium bedding, and a rain shower. Perfect for business or leisure travelers.",
    amenities: ["City View", "Rain Shower", "Work Desk", "Smart TV", "WiFi", "Coffee Machine"],
    featured: false,
    rating: 4.7,
    reviews: 342
  },
  {
    id: "ocean-villa",
    name: "Oceanfront Villa",
    tagline: "Private beach access with infinity pool",
    price: 899,
    currency: "$",
    per: "night",
    size: "85 m²",
    guests: 3,
    bed: "King Size",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
    ],
    description: "Direct ocean access from your private deck. Includes infinity plunge pool, outdoor shower, and complimentary sunset cocktail service.",
    amenities: ["Private Pool", "Beach Access", "Outdoor Shower", "Bar", "Smart Home", "WiFi"],
    featured: true,
    rating: 4.8,
    reviews: 89
  },
  {
    id: "garden-suite",
    name: "Garden Suite",
    tagline: "Tranquil retreat surrounded by tropical gardens",
    price: 599,
    currency: "$",
    per: "night",
    size: "65 m²",
    guests: 2,
    bed: "Queen Size",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80"
    ],
    description: "Wake up to birdsong in this garden-level suite. Features a private patio, botanical shower, and organic bath amenities.",
    amenities: ["Garden View", "Patio", "Botanical Bath", "Organic Amenities", "WiFi", "Yoga Mat"],
    featured: false,
    rating: 4.6,
    reviews: 156
  },
  {
    id: "sky-loft",
    name: "Sky Loft",
    tagline: "Contemporary design on the top floor",
    price: 749,
    currency: "$",
    per: "night",
    size: "70 m²",
    guests: 2,
    bed: "King Size",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
    ],
    description: "Industrial-chic loft with double-height ceilings, designer furniture, and a rooftop jacuzzi with 360° views.",
    amenities: ["Rooftop Access", "Jacuzzi", "Designer Furniture", "Smart Home", "WiFi", "Sound System"],
    featured: true,
    rating: 4.8,
    reviews: 203
  },
  {
    id: "family-suite",
    name: "Family Suite",
    tagline: "Spacious comfort for the whole family",
    price: 679,
    currency: "$",
    per: "night",
    size: "90 m²",
    guests: 5,
    bed: "2 Queen + Sofa",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
    ],
    description: "Two connected bedrooms with a shared play area. Includes kids' welcome pack, gaming console, and child-proof balcony.",
    amenities: ["Connecting Rooms", "Kids Area", "Gaming Console", "Balcony", "WiFi", "Kitchenette"],
    featured: false,
    rating: 4.7,
    reviews: 267
  }
];

export const categories = ["All", "Featured", "Ocean View", "Suite", "Family"];

export const allAmenities = [
  "Ocean View", "Butler Service", "Jacuzzi", "Smart Home", "Mini Bar", "WiFi",
  "City View", "Rain Shower", "Work Desk", "Smart TV", "Coffee Machine",
  "Private Pool", "Beach Access", "Outdoor Shower", "Bar", "Garden View",
  "Patio", "Botanical Bath", "Organic Amenities", "Yoga Mat", "Rooftop Access",
  "Designer Furniture", "Sound System", "Connecting Rooms", "Kids Area",
  "Gaming Console", "Balcony", "Kitchenette"
];