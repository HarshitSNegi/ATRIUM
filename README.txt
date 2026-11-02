NoteSync AI - setup (Windows)

1. Install Node.js LTS from https://nodejs.org (once).
2. Get a free key at https://aistudio.google.com/apikey
3. Open the file named ".env" in Notepad and replace PASTE_YOUR_KEY_HERE with your key.
   (No quotes, no spaces.)  Save.
4. Double-click start.bat   (or in a terminal here: npm install, then npm start)
5. Use ONLY http://localhost:3000 in Chrome/Edge. Never open index.html directly.
   Keep the black terminal window open while using the app.

Folder must look like:
  notesync-ai\
    package.json  server.js  .env  start.bat
    public\index.html
