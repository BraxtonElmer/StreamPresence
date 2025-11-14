# anime_presence.py
import os
import time
import json
from threading import Lock
from flask import Flask, request, jsonify
from pypresence import Presence
from pypresence.exceptions import PipeClosed
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
PORT = int(os.getenv("FLASK_PORT", 8731))
HOST = os.getenv("FLASK_HOST", "127.0.0.1")
LARGE_IMAGE_KEY = os.getenv("LARGE_IMAGE_KEY", "")

# Load config file
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.json")
try:
    with open(CONFIG_PATH, 'r') as f:
        config = json.load(f)
        UPDATE_INTERVAL = config.get("update_interval", 5)
except (FileNotFoundError, json.JSONDecodeError) as e:
    print(f"Warning: Could not load config.json, using default update interval of 5 seconds")
    UPDATE_INTERVAL = 5

print(f"Update interval set to {UPDATE_INTERVAL} seconds")

if not CLIENT_ID:
    raise ValueError("DISCORD_CLIENT_ID not found in .env file. Please create a .env file with your Discord Application Client ID.")

app = Flask(__name__)
rpc = Presence(CLIENT_ID)
connected = False
lock = Lock()
last_update_time = 0
preserved_start_time = None

def ensure_connected():
    global connected, rpc
    with lock:
        try:
            if not connected:
                rpc.connect()
                connected = True
        except Exception as e:
            print(f"Connection attempt failed: {e}")
            connected = False
            raise

def reconnect():
    global connected, rpc
    with lock:
        try:
            # Close existing connection if any
            if connected:
                try:
                    rpc.close()
                except:
                    pass
            connected = False
            
            # Create new RPC instance and connect
            rpc = Presence(CLIENT_ID)
            rpc.connect()
            connected = True
            print("Successfully reconnected to Discord")
        except Exception as e:
            print(f"Reconnection failed: {e}")
            connected = False
            raise

def fmt(sec):
  sec = max(0, int(sec)); m, s = divmod(sec, 60)
  return f"{m:02d}:{s:02d}"

@app.route("/update", methods=["POST"])
def update():
    d = request.get_json(force=True)
    title   = str(d.get("title","Anime"))[:128]
    episode = str(d.get("episode","Episode"))[:64]
    cur     = float(d.get("current") or 0)
    dur     = float(d.get("duration") or 0)
    url     = d.get("pageUrl")
    paused  = bool(d.get("paused", False))
    poster  = d.get("posterUrl")  # Get the poster image URL

    # Initialize preserved start timestamp once per session
    global preserved_start_time
    if preserved_start_time is None:
        preserved_start_time = time.time()
    
    state = f"{episode} — {fmt(cur)}" + (f" / {fmt(dur)}" if dur > 0 else "")
    
    # Use poster URL if available, otherwise fall back to static image key
    large_img = poster if poster else LARGE_IMAGE_KEY
    
    payload = {
        "details": title,
        "state": state,
        "large_image": large_img,
        "large_text": title,  # Show anime title on hover
    }
    
    # Always include start time for continuous elapsed timer
    if preserved_start_time is not None:
        payload["start"] = int(preserved_start_time)
    
    # Only add buttons if URL exists
    if url:
        payload["buttons"] = [{"label": "Open episode", "url": url}]
    
    # Rate limiting check
    global last_update_time
    current_time = time.time()
    time_since_last = current_time - last_update_time
    
    if time_since_last < UPDATE_INTERVAL:
        # Skip update but return success
        return jsonify({"ok": True, "skipped": True, "reason": f"Rate limited: {UPDATE_INTERVAL - time_since_last:.1f}s remaining"})
    
    try:
        ensure_connected()
        rpc.update(**payload)
        last_update_time = current_time
        return jsonify({"ok": True})
    except PipeClosed:
        print("Pipe closed, attempting to reconnect...")
        try:
            reconnect()
            rpc.update(**payload)
            return jsonify({"ok": True, "reconnected": True})
        except Exception as e:
            print(f"Failed to reconnect and update: {e}")
            return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        print(f"Error updating presence: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/clear", methods=["POST"])
def clear():
    global preserved_start_time
    try:
        ensure_connected()
        rpc.clear()
        preserved_start_time = None
        return jsonify({"ok": True})
    except PipeClosed:
        print("Pipe closed, attempting to reconnect...")
        try:
            reconnect()
            rpc.clear()
            return jsonify({"ok": True, "reconnected": True})
        except Exception as e:
            print(f"Failed to reconnect and clear: {e}")
            return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        print(f"Error clearing presence: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == "__main__":
    try:
        ensure_connected()
        print(f"Discord Rich Presence Server running on {HOST}:{PORT}")
        print(f"Watching for activity from browser extension...")
        app.run(HOST, PORT)
    except KeyboardInterrupt:
        print("\nShutting down...")
        if connected:
            try:
                rpc.close()
            except:
                pass
    except Exception as e:
        print(f"Failed to start: {e}")
        raise
