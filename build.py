"""
Script de build para Vercel.
Lee API_BASE desde las variables de entorno y genera js/config.js.
"""
import os

api_base = os.environ.get('API_BASE', 'http://localhost:8000/api')

with open('js/config.js', 'w') as f:
    f.write(f"export const API_BASE = '{api_base}';\n")

print(f"js/config.js generado con API_BASE={api_base}")
