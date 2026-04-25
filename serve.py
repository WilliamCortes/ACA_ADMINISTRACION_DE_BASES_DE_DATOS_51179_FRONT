"""
Servidor HTTP minimalista para el frontend.
Uso: python serve.py
Luego abre: http://localhost:3000
"""
import http.server, socketserver

PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silencia logs por defecto

print(f"Frontend en http://localhost:{PORT}  (Ctrl+C para detener)")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
