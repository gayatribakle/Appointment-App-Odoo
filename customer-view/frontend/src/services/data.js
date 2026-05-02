export const SERVICES = [
  { id: 1, name: 'General Consultation', provider: 'Dr. Priya Sharma',   duration: 30, price: 200,  category: 'General',      emoji: '🩺', rating: 4.8, reviews: 120 },
  { id: 2, name: 'Dental Checkup',        provider: 'Dr. Arjun Mehta',   duration: 45, price: 300,  category: 'Dental',       emoji: '🦷', rating: 4.7, reviews: 89  },
  { id: 3, name: 'Cardiology Assessment', provider: 'Dr. Neha Singh',    duration: 60, price: 600,  category: 'Cardiology',   emoji: '❤️', rating: 4.9, reviews: 210 },
  { id: 4, name: 'Orthopedic Visit',      provider: 'Dr. Vikas Patel',   duration: 45, price: 400,  category: 'Orthopedics',  emoji: '🦴', rating: 4.6, reviews: 75  },
  { id: 5, name: 'Vision Test',           provider: 'Dr. Ravi Kapoor',   duration: 30, price: 150,  category: 'Ophthalmology',emoji: '👁️', rating: 4.8, reviews: 95  },
  { id: 6, name: 'Pediatric Visit',       provider: 'Dr. Sunita Rao',    duration: 45, price: 250,  category: 'Pediatrics',   emoji: '👶', rating: 5.0, reviews: 180 },
  { id: 7, name: 'Dermatology Consult',   provider: 'Dr. Rakesh Verma', duration: 30, price: 350,  category: 'Dermatology',  emoji: '🧴', rating: 4.7, reviews: 140 },
  { id: 8, name: 'ENT Checkup',           provider: 'Dr. Anil Gupta',   duration: 30, price: 250,  category: 'ENT',          emoji: '👂', rating: 4.9, reviews: 60  },
];

export const PROVIDERS = {
  1: [
    { id:'p1', name:'Dr. Priya Sharma',  specialty:'General Physician', initials:'PS', available: true },
    { id:'p2', name:'Dr. Kavya Reddy',   specialty:'Family Doctor',     initials:'KR', available: true },
  ],
  2: [
    { id:'p3', name:'Dr. Arjun Mehta',   specialty:'Dentist',           initials:'AM', available: true },
    { id:'p4', name:'Dr. Sneha Joshi',   specialty:'Orthodontist',      initials:'SJ', available: false },
  ],
  3: [
    { id:'p5', name:'Dr. Neha Singh',    specialty:'Cardiologist',      initials:'NS', available: true },
    { id:'p6', name:'Dr. Priti Shah',    specialty:'Senior Cardiologist',initials:'PS', available: true },
  ],
  4: [
    { id:'p7', name:'Dr. Vikas Patel',   specialty:'Orthopedic Surgeon', initials:'VP', available: true },
    { id:'p8', name:'Dr. Ananya Das',    specialty:'Sports Medicine',    initials:'AD', available: true },
  ],
  5: [
    { id:'p9', name:'Dr. Ravi Kapoor',   specialty:'Ophthalmologist', initials:'RK', available: true },
  ],
  6: [
    { id:'p10', name:'Dr. Sunita Rao',    specialty:'Pediatrician', initials:'SR', available: true },
  ],
  7: [
    { id:'p11', name:'Dr. Rakesh Verma',  specialty:'Dermatologist', initials:'RV', available: true },
  ],
  8: [
    { id:'p12', name:'Dr. Anil Gupta',    specialty:'ENT Specialist', initials:'AG', available: true },
  ],
};
