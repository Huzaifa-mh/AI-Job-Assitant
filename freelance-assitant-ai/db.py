import pymssql
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    conn = pymssql.connect(
        server=os.getenv('DB_SERVER'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')    
    )
    return conn