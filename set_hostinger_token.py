"""Enregistre le token API Hostinger dans la configuration MCP de Claude Code, sans l'afficher.

Usage (dans un terminal ouvert dans ce dossier) :
    python set_hostinger_token.py
"""
import getpass
import json
import os
import shutil
import sys
import time

CONFIG = os.path.expanduser("~/.claude.json")
PROJECT = r"C:\Users\guill\Desktop\servers-main"
DEFAULTS = {
    "hostinger-hosting": "hostinger-hosting-mcp",
    "hostinger-domains": "hostinger-domains-mcp",
    "hostinger-dns": "hostinger-dns-mcp",
}

token = getpass.getpass("Colle ton token API Hostinger (la saisie est masquee), puis Entree : ").strip()
if not token:
    sys.exit("Aucun token saisi, rien n'a ete modifie.")

with open(CONFIG, encoding="utf-8") as f:
    data = json.load(f)

project = data.setdefault("projects", {}).setdefault(PROJECT, {})
servers = project.get("mcpServers")
if not isinstance(servers, dict):
    servers = {}
    project["mcpServers"] = servers
for name, binary in DEFAULTS.items():
    servers.setdefault(name, {"type": "stdio", "command": "npx.cmd", "args": ["--package=@hostinger/mcp@latest", binary], "env": {}})

updated = []
for name, server in servers.items():
    if name.startswith("hostinger"):
        server.setdefault("env", {})["HOSTINGER_API_TOKEN"] = token
        updated.append(name)

backup = CONFIG + ".bak-token-" + time.strftime("%Y%m%d-%H%M%S")
shutil.copy(CONFIG, backup)
with open(CONFIG, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Token enregistre pour : %s (sauvegarde : %s)." % (", ".join(updated), os.path.basename(backup)))
print("Ouvre maintenant une NOUVELLE conversation dans ce dossier et ecris : deploie le site.")
