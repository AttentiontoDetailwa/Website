"""Static server for local preview only. Sends no-store on everything so
editing a stylesheet and reloading actually shows the edit."""
import os, functools, http.server, socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PORT = int(os.environ.get("PORT", "4188"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, key, value):
        if key.lower() == "last-modified":
            return
        super().send_header(key, value)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=ROOT)) as httpd:
    print(f"serving {ROOT} on http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
