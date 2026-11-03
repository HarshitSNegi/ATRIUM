Every student has gaps. Most find them in the exam hall.

Atrium finds them first. A teacher uploads their notes; AI turns them into flashcards, and the teacher approves every card. Each answer a student gives updates a live, concept-by concept map of what they’ve mastered. 
From it, Atrium builds a personal revision path for weakest concepts first that works on any phone, even offline. Attendance is effortless too: students glance at a camera, the teacher confirms the list, and a missed class automatically adds that day’s concepts to the student’s path. Opt-in, always.

Atrium: Find the gaps. Personalize the revision.

ATRIUM - setup (Windows)

1. Install Node.js LTS from https://nodejs.org (once).
2. Get a free key at https://aistudio.google.com/apikey
3. Open the file named ".env" in Notepad and replace PASTE_YOUR_KEY_HERE with your key.
   (No quotes, no spaces.)  Save.
4. Double-click start.bat   (or in a terminal here: npm install, then npm start)
5. Use ONLY http://localhost:3000 in Chrome/Edge. Never open index.html directly.
   Keep the black terminal window open while using the app.

Folder must look like:
  Atrium\
    package.json  server.js  .env  start.bat
    public\index.html


EDIT: face attendance (FA)

A python GUI integrated attendance system using face recognition to take attendance.

In this python project, I have made an attendance system which takes attendance by using face recognition technique. I have also intergrated it with GUI (Graphical user interface) so it can be easy to use by anyone. GUI for this project is also made on python using tkinter.

TECHNOLOGY USED:

tkinter for whole GUI
OpenCV for taking images and face recognition (cv2.face.LBPHFaceRecognizer_create())
CSV, Numpy, Pandas, datetime etc. for other purposes.
FEATURES:

Easy to use with interactive GUI support.
Password protection for new person registration.
Creates/Updates CSV file for details of students on registration.
Creates a new CSV file everyday for attendance and marks attendance with proper date and time.
Displays live attendance updates for the day on the main screen in tabular format with Id, name, date and time.
For more information:
https://machinelearningprojects.net/face-recognition-based-attendance-system/
