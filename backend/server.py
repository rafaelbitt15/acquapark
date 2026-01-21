from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routes
from routes import router as admin_router
from customer_routes import router as customer_router
from ticket_routes import router as ticket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    mongo_url = os.environ['MONGO_URL']
    app.mongodb_client = AsyncIOMotorClient(mongo_url)
    app.db = app.mongodb_client[os.environ['DB_NAME']]
    logging.info("MongoDB connected")
    
    yield
    
    # Shutdown
    app.mongodb_client.close()
    logging.info("MongoDB disconnected")

# Create the main app
app = FastAPI(
    title="Acqua Park API",
    description="API for Acqua Park website management",
    version="1.0.0",
    lifespan=lifespan
)

# Include all routes
app.include_router(admin_router)
app.include_router(customer_router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}