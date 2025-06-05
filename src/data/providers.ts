interface Provider {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: number;
  image: string;
  availability: string;
  education: string;
  languages: string[];
  location: string;
}

export const providers: Provider[] = [
  // Dentists
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Dentist",
    rating: 4.8,
    reviews: 234,
    distance: 2.3,
    image: "https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Tomorrow",
    education: "DDS, University of California",
    languages: ["English", "Mandarin"],
    location: "Downtown Medical Center"
  },
  {
    id: 2,
    name: "Dr. Michael Brown",
    specialty: "Dentist",
    rating: 4.7,
    reviews: 189,
    distance: 3.1,
    image: "https://images.pexels.com/photos/6749773/pexels-photo-6749773.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Friday",
    education: "DMD, Harvard School of Dental Medicine",
    languages: ["English", "Spanish"],
    location: "Smile Dental Clinic"
  },

  // Physiotherapists
  {
    id: 3,
    name: "John Miller",
    specialty: "Physiotherapist",
    rating: 4.9,
    reviews: 312,
    distance: 1.8,
    image: "https://images.pexels.com/photos/4506109/pexels-photo-4506109.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Today",
    education: "DPT, University of Michigan",
    languages: ["English"],
    location: "Active Life Physical Therapy"
  },
  {
    id: 4,
    name: "Dr. Mike Ross",
    specialty: "Physiotherapist",
    rating: 4.6,
    reviews: 178,
    distance: 2.7,
    image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Wednesday",
    education: "PhD in Physical Therapy, NYU",
    languages: ["English", "French"],
    location: "Elite Sports Rehabilitation"
  },

  // Massage Therapists
  {
    id: 5,
    name: "Emma White",
    specialty: "Massage Therapist",
    rating: 4.8,
    reviews: 256,
    distance: 1.5,
    image: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Today",
    education: "Licensed Massage Therapist",
    languages: ["English"],
    location: "Healing Hands Massage Center"
  },
  {
    id: 6,
    name: "David Thompson",
    specialty: "Massage Therapist",
    rating: 4.7,
    reviews: 198,
    distance: 2.9,
    image: "https://images.pexels.com/photos/5327621/pexels-photo-5327621.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Tomorrow",
    education: "Certified Massage Therapist",
    languages: ["English", "Thai"],
    location: "Wellness Massage Studio"
  },

  // Podiatrists
  {
    id: 7,
    name: "Dr. Lisa Park",
    specialty: "Podiatrist",
    rating: 4.9,
    reviews: 287,
    distance: 2.1,
    image: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Thursday",
    education: "DPM, Temple University",
    languages: ["English", "Korean"],
    location: "Foot & Ankle Specialists"
  },
  {
    id: 8,
    name: "Dr. Robert Wilson",
    specialty: "Podiatrist",
    rating: 4.6,
    reviews: 165,
    distance: 3.4,
    image: "https://images.pexels.com/photos/5407237/pexels-photo-5407237.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Monday",
    education: "DPM, California School of Podiatric Medicine",
    languages: ["English"],
    location: "Advanced Foot Care Center"
  },

  // Physicians
  {
    id: 9,
    name: "Dr. James Wilson",
    specialty: "Physician",
    rating: 4.9,
    reviews: 423,
    distance: 1.2,
    image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Tomorrow",
    education: "MD, Johns Hopkins University",
    languages: ["English", "Spanish"],
    location: "Primary Care Associates"
  },
  {
    id: 10,
    name: "Dr. Maria Rodriguez",
    specialty: "Physician",
    rating: 4.8,
    reviews: 356,
    distance: 2.6,
    image: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=150",
    availability: "Next available: Today",
    education: "MD, Stanford University",
    languages: ["English", "Spanish", "Portuguese"],
    location: "Family Health Center"
  }
];