"""
Servidor HTTP minimalista para el frontend.
Lee API_BASE desde .env y lo inyecta en /js/config.js.
Uso: python serve.py
Luego abre: http://localhost:3000
"""
import http.server, socketserver, os

PORT = 3000

# Cargar .env
_env = {}
if os.path.exists('.env'):
    with open('.env') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                _env[key.strip()] = val.strip()

API_BASE = _env.get('API_BASE', 'http://localhost:8000/api')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path in ('/js/config.js', '/js/config.js?'):
            content = f"export const API_BASE = '{API_BASE}';\n".encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        else:
            super().do_GET()

print(f"Frontend en http://localhost:{PORT}  (Ctrl+C para detener)")
print(f"API_BASE  = {API_BASE}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
