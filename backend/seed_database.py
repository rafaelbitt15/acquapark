import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Starting database seeding...")
    
    # 1. Create admin user
    existing_admin = await db.users.find_one({'email': 'bitencourt.rafandrade@gmail.com'})
    if not existing_admin:
        admin_user = {
            'email': 'bitencourt.rafandrade@gmail.com',
            'hashed_password': get_password_hash('Rafa2188'),
            'is_active': True,
            'is_admin': True,
            'created_at': datetime.utcnow()
        }
        await db.users.insert_one(admin_user)
        print("✅ Admin user created")
    else:
        print("ℹ️  Admin user already exists")
    
    # 2. Seed attractions
    attractions_count = await db.attractions.count_documents({})
    if attractions_count == 0:
        attractions = [
            {
                "name": "Kamikaze Radical",
                "description": "Toboágua de alta velocidade com queda de 15 metros. Ideal para os mais corajosos!",
                "image": "https://images.unsplash.com/photo-1646207683942-971653b6f6c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85",
                "category": "Radical",
                "min_height": "1.40m",
                "age_restriction": "Acima de 12 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Tornado Duplo",
                "description": "Dois toboáguas em espiral que garantem muita emoção e velocidade!",
                "image": "https://images.unsplash.com/photo-1642717841683-c0323214617c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwzfHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85",
                "category": "Radical",
                "min_height": "1.30m",
                "age_restriction": "Acima de 10 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Rio Lento",
                "description": "Circuito tranquilo de boia em rio artificial. Relaxe e aproveite a paisagem!",
                "image": "https://images.pexels.com/photos/3209053/pexels-photo-3209053.jpeg",
                "category": "Família",
                "min_height": "Livre",
                "age_restriction": "Todas as idades",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Piscina de Ondas",
                "description": "Sinta a emoção de ondas artificiais em uma piscina gigante!",
                "image": "https://images.pexels.com/photos/8681434/pexels-photo-8681434.jpeg",
                "category": "Família",
                "min_height": "Livre",
                "age_restriction": "Todas as idades",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Escorrega Kids",
                "description": "Toboáguas coloridos especialmente projetados para crianças de 3 a 10 anos.",
                "image": "https://images.unsplash.com/photo-1504512692576-b902854572c8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHw0fHx3YXRlciUyMHNsaWRlfGVufDB8fHx8MTc2ODkwNjE0Nnww&ixlib=rb-4.1.0&q=85",
                "category": "Infantil",
                "min_height": "0.90m",
                "age_restriction": "3 a 10 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Piscina Infantil",
                "description": "Área aquática rasa com jatos d'água e brinquedos interativos.",
                "image": "https://images.pexels.com/photos/32447922/pexels-photo-32447922.jpeg",
                "category": "Infantil",
                "min_height": "Livre",
                "age_restriction": "0 a 8 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Toboágua Família",
                "description": "Toboágua de boia para até 4 pessoas. Diversão garantida para toda a família!",
                "image": "https://images.pexels.com/photos/15322719/pexels-photo-15322719.jpeg",
                "category": "Família",
                "min_height": "1.10m",
                "age_restriction": "Acima de 6 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Space Bowl",
                "description": "Entre no funil gigante e sinta a força centrífuga nessa atração única!",
                "image": "https://images.pexels.com/photos/12049186/pexels-photo-12049186.jpeg",
                "category": "Radical",
                "min_height": "1.40m",
                "age_restriction": "Acima de 12 anos",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.attractions.insert_many(attractions)
        print(f"✅ {len(attractions)} attractions created")
    else:
        print(f"ℹ️  {attractions_count} attractions already exist")
    
    # 3. Seed tickets
    tickets_count = await db.tickets.count_documents({})
    if tickets_count == 0:
        tickets = [
            {
                "ticket_id": "adult",
                "name": "Inteiro",
                "price": 89.90,
                "description": "Acesso completo a todas as atrações do parque",
                "features": [
                    "Acesso ilimitado a todas as atrações",
                    "Uso de vestiários e chuveiros",
                    "Estacionamento incluso"
                ],
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "ticket_id": "child",
                "name": "Meia-Entrada",
                "price": 44.95,
                "description": "Para crianças de 5 a 12 anos e estudantes com carteirinha",
                "features": [
                    "Acesso ilimitado a todas as atrações",
                    "Uso de vestiários e chuveiros",
                    "Estacionamento incluso"
                ],
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "ticket_id": "family",
                "name": "Pacote Família",
                "price": 239.90,
                "description": "Melhor custo-benefício: 2 adultos + 2 crianças",
                "features": [
                    "Acesso para 4 pessoas (2 adultos + 2 crianças)",
                    "Desconto de 30% comparado ao individual",
                    "Uso de vestiários e chuveiros",
                    "Estacionamento incluso"
                ],
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.tickets.insert_many(tickets)
        print(f"✅ {len(tickets)} ticket types created")
    else:
        print(f"ℹ️  {tickets_count} ticket types already exist")
    
    # 4. Seed park info
    park_info_count = await db.park_info.count_documents({})
    if park_info_count == 0:
        park_info = {
            "name": "Acqua Park Prazeres da Serra",
            "tagline": "Diversão e refrescância no coração da Bahia",
            "description": "O Acqua Park Prazeres da Serra é o destino perfeito para toda a família! Localizado na charmosa cidade de Jiquiriçá, oferecemos um dia inteiro de diversão com toboáguas emocionantes, piscinas cristalinas e muito mais.",
            "highlights": [
                "Mais de 10 atrações aquáticas",
                "Área infantil com monitores",
                "Piscina de ondas",
                "Complexo gastronômico",
                "Estacionamento amplo e seguro",
                "Vestiários e armários"
            ],
            "history": "Fundado em 2015, o Acqua Park Prazeres da Serra nasceu do sonho de trazer diversão e lazer para as famílias baianas. Com investimento em infraestrutura de primeira linha e foco na segurança, nos tornamos referência em entretenimento aquático na região.",
            "mission": "Proporcionar momentos inesquecíveis de alegria e diversão em um ambiente seguro e acolhedor para toda a família.",
            "contact": {
                "address": "Fazenda Boqueirão, 987 – Jiquiriçá BA",
                "phone": "+55 75 98138-7765",
                "email": "contato@acquaparkps.com.br",
                "instagram": "https://www.instagram.com/acqua_park01/",
                "whatsapp": "https://wa.me/5575981387765"
            },
            "hours": [
                {"day": "Segunda a Sexta", "hours": "10h às 17h"},
                {"day": "Sábados, Domingos e Feriados", "hours": "9h às 18h"}
            ],
            "updated_at": datetime.utcnow()
        }
        await db.park_info.insert_one(park_info)
        print("✅ Park info created")
    else:
        print("ℹ️  Park info already exists")
    
    # 5. Seed testimonials
    testimonials_count = await db.testimonials.count_documents({})
    if testimonials_count == 0:
        testimonials = [
            {
                "name": "Maria Santos",
                "rating": 5,
                "comment": "Lugar maravilhoso! Meus filhos adoraram as piscinas e os toboáguas. Voltaremos com certeza!",
                "date": "15/01/2025",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "name": "João Oliveira",
                "rating": 5,
                "comment": "Excelente estrutura e muito limpo. Os funcionários são atenciosos e prestativos.",
                "date": "10/01/2025",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Ana Paula Lima",
                "rating": 5,
                "comment": "Passeio perfeito para família! Seguro, divertido e com ótimo custo-benefício.",
                "date": "05/01/2025",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        await db.testimonials.insert_many(testimonials)
        print(f"✅ {len(testimonials)} testimonials created")
    else:
        print(f"ℹ️  {testimonials_count} testimonials already exist")
    
    # 6. Seed FAQs
    faqs_count = await db.faqs.count_documents({})
    if faqs_count == 0:
        faqs = [
            {
                "question": "Crianças pagam entrada?",
                "answer": "Crianças de 0 a 4 anos não pagam. De 5 a 12 anos pagam meia-entrada. Acima de 12 anos pagam inteira.",
                "order": 1,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "question": "Posso levar comida de fora?",
                "answer": "Não permitimos a entrada de alimentos e bebidas, mas temos uma praça de alimentação completa com diversas opções de lanches, refeições e bebidas.",
                "order": 2,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "question": "O parque funciona com chuva?",
                "answer": "Sim! Nossas atrações funcionam normalmente com chuva fraca. Em casos de tempestades ou raios, suspendemos temporariamente as atividades por segurança.",
                "order": 3,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "question": "Preciso levar toalha e boia?",
                "answer": "As boias para as atrações são fornecidas gratuitamente. Toalhas devem ser trazidas pelos visitantes.",
                "order": 4,
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "question": "Há monitores para crianças?",
                "answer": "Sim! Nossas áreas infantis contam com monitores treinados. Porém, crianças devem estar sempre acompanhadas de um responsável.",
                "order": 5,
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        await db.faqs.insert_many(faqs)
        print(f"✅ {len(faqs)} FAQs created")
    else:
        print(f"ℹ️  {faqs_count} FAQs already exist")
    
    print("\n🎉 Database seeding completed!")
    print("\n📧 Admin credentials:")
    print("   Email: bitencourt.rafandrade@gmail.com")
    print("   Password: Rafa2188")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
