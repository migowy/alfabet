#!/usr/bin/env python3
import http.server
import socketserver
import sys


try:
    port = int(sys.argv[1])
except Exception:
    port = 8000


Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map['.js'] = 'text/javascript'


server = socketserver.TCPServer(("", port), Handler)
print(f'Serving at {port}. Press ^C to stop.')
server.serve_forever()
