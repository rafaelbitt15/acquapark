// Mock data for Acqua Park Prazeres da Serra

export const parkInfo = {
  name: 'Acqua Park Prazeres da Serra',
  tagline: 'Diversão e refrescância no coração da Bahia',
  description: 'O Acqua Park Prazeres da Serra é o destino perfeito para toda a família! Localizado na charmosa cidade de Jiquiriçá, oferecemos um dia inteiro de diversão com toboáguas emocionantes, piscinas cristalinas e muito mais.',
  highlights: [
    'Mais de 10 atrações aquáticas',
    'Área infantil com monitores',
    'Piscina de ondas',
    'Complexo gastronômico',
    'Estacionamento amplo e seguro',
    'Vestiários e armários'
  ],
  history: 'Fundado em 2015, o Acqua Park Prazeres da Serra nasceu do sonho de trazer diversão e lazer para as famílias baianas. Com investimento em infraestrutura de primeira linha e foco na segurança, nos tornamos referência em entretenimento aquático na região.',
  mission: 'Proporcionar momentos inesquecíveis de alegria e diversão em um ambiente seguro e acolhedor para toda a família.',
  contact: {
    address: 'Fazenda Boqueirão, 987 – Jiquiriçá BA',
    phone: '+55 75 98138-7765',
    email: 'contato@acquaparkps.com.br',
    instagram: 'https://www.instagram.com/acqua_park01/',
    whatsapp: 'https://wa.me/5575981387765'
  },
  hours: [
    { day: 'Segunda a Sexta', hours: '10h às 17h' },
    { day: 'Sábados, Domingos e Feriados', hours: '9h às 18h' }
  ]
};

export const attractions = [
  {
    id: 1,
    name: 'Kamikaze Radical',
    description: 'Toboágua de alta velocidade com queda de 15 metros. Ideal para os mais corajosos!',
    image: 'https://images.unsplash.com/photo-1646207683942-971653b6f6c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85',
    category: 'Radical',
    minHeight: '1.40m',
    ageRestriction: 'Acima de 12 anos'
  },
  {
    id: 2,
    name: 'Tornado Duplo',
    description: 'Dois toboáguas em espiral que garantem muita emoção e velocidade!',
    image: 'https://images.unsplash.com/photo-1642717841683-c0323214617c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwzfHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85',
    category: 'Radical',
    minHeight: '1.30m',
    ageRestriction: 'Acima de 10 anos'
  },
  {
    id: 3,
    name: 'Rio Lento',
    description: 'Circuito tranquilo de boia em rio artificial. Relaxe e aproveite a paisagem!',
    image: 'https://images.pexels.com/photos/3209053/pexels-photo-3209053.jpeg',
    category: 'Família',
    minHeight: 'Livre',
    ageRestriction: 'Todas as idades'
  },
  {
    id: 4,
    name: 'Piscina de Ondas',
    description: 'Sinta a emoção de ondas artificiais em uma piscina gigante!',
    image: 'https://images.pexels.com/photos/8681434/pexels-photo-8681434.jpeg',
    category: 'Família',
    minHeight: 'Livre',
    ageRestriction: 'Todas as idades'
  },
  {
    id: 5,
    name: 'Escorrega Kids',
    description: 'Toboáguas coloridos especialmente projetados para crianças de 3 a 10 anos.',
    image: 'https://images.unsplash.com/photo-1504512692576-b902854572c8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHw0fHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85',
    category: 'Infantil',
    minHeight: '0.90m',
    ageRestriction: '3 a 10 anos'
  },
  {
    id: 6,
    name: 'Piscina Infantil',
    description: 'Área aquática rasa com jatos d\'água e brinquedos interativos.',
    image: 'https://images.pexels.com/photos/32447922/pexels-photo-32447922.jpeg',
    category: 'Infantil',
    minHeight: 'Livre',
    ageRestriction: '0 a 8 anos'
  },
  {
    id: 7,
    name: 'Toboágua Família',
    description: 'Toboágua de boia para até 4 pessoas. Diversão garantida para toda a família!',
    image: 'https://images.pexels.com/photos/15322719/pexels-photo-15322719.jpeg',
    category: 'Família',
    minHeight: '1.10m',
    ageRestriction: 'Acima de 6 anos'
  },
  {
    id: 8,
    name: 'Space Bowl',
    description: 'Entre no funil gigante e sinta a força centrífuga nessa atração única!',
    image: 'https://images.pexels.com/photos/12049186/pexels-photo-12049186.jpeg',
    category: 'Radical',
    minHeight: '1.40m',
    ageRestriction: 'Acima de 12 anos'
  }
];

export const tickets = [
  {
    id: 'adult',
    name: 'Inteiro',
    price: 89.90,
    description: 'Acesso completo a todas as atrações do parque',
    icon: '👨‍👩‍👧‍👦',
    features: [
      'Acesso ilimitado a todas as atrações',
      'Uso de vestiários e chuveiros',
      'Estacionamento incluso'
    ]
  },
  {
    id: 'child',
    name: 'Meia-Entrada',
    price: 44.95,
    description: 'Para crianças de 5 a 12 anos e estudantes com carteirinha',
    icon: '👧',
    features: [
      'Acesso ilimitado a todas as atrações',
      'Uso de vestiários e chuveiros',
      'Estacionamento incluso'
    ]
  },
  {
    id: 'family',
    name: 'Pacote Família',
    price: 239.90,
    description: 'Melhor custo-benefício: 2 adultos + 2 crianças',
    icon: '👨‍👩‍👧‍👦',
    features: [
      'Acesso para 4 pessoas (2 adultos + 2 crianças)',
      'Desconto de 30% comparado ao individual',
      'Uso de vestiários e chuveiros',
      'Estacionamento incluso'
    ]
  }
];

export const faqs = [
  {
    question: 'Crianças pagam entrada?',
    answer: 'Crianças de 0 a 4 anos não pagam. De 5 a 12 anos pagam meia-entrada. Acima de 12 anos pagam inteira.'
  },
  {
    question: 'Posso levar comida de fora?',
    answer: 'Não permitimos a entrada de alimentos e bebidas, mas temos uma praça de alimentação completa com diversas opções de lanches, refeições e bebidas.'
  },
  {
    question: 'O parque funciona com chuva?',
    answer: 'Sim! Nossas atrações funcionam normalmente com chuva fraca. Em casos de tempestades ou raios, suspendemos temporariamente as atividades por segurança.'
  },
  {
    question: 'Preciso levar toalha e boia?',
    answer: 'As boias para as atrações são fornecidas gratuitamente. Toalhas devem ser trazidas pelos visitantes.'
  },
  {
    question: 'Há monitores para crianças?',
    answer: 'Sim! Nossas áreas infantis contam com monitores treinados. Porém, crianças devem estar sempre acompanhadas de um responsável.'
  }
];

export const testimonials = [
  {
    name: 'Maria Santos',
    rating: 5,
    comment: 'Lugar maravilhoso! Meus filhos adoraram as piscinas e os toboáguas. Voltaremos com certeza!',
    date: '15/01/2025'
  },
  {
    name: 'João Oliveira',
    rating: 5,
    comment: 'Excelente estrutura e muito limpo. Os funcionários são atenciosos e prestativos.',
    date: '10/01/2025'
  },
  {
    name: 'Ana Paula Lima',
    rating: 5,
    comment: 'Passeio perfeito para família! Seguro, divertido e com ótimo custo-benefício.',
    date: '05/01/2025'
  }
];

// Mock function to simulate ticket purchase
export const mockPurchaseTicket = (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderId = `ORDER-${Date.now()}`;
      resolve({
        success: true,
        orderId,
        message: 'Compra realizada com sucesso! (Demo - sem pagamento real)',
        data: formData
      });
    }, 1500);
  });
};

// Mock function to simulate contact form submission
export const mockSendContact = (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Mensagem enviada com sucesso! Responderemos em breve.'
      });
    }, 1000);
  });
};