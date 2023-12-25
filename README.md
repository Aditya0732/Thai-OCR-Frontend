Overview :

Thai ID Card OCR utilizes Optical Character Recognition (OCR) to extract information from images of Thai national ID cards. The application consists of a frontend developed in React.js and a backend built with Node.js, Express.js, and MongoDB. The Google Cloud Vision API is integrated for OCR functionality.


Dependencies used :-
Frontend:
React.js
axios
Tailwind CSS


Backend:
Node.js
Express.js
mongoose
axios
multer
cors
@google-cloud/vision
dotenv


Database:
MongoDB

Setup Instructions :-

Install dependencies:
npm install

frontend :
npm start

Backend :
npm start

Architecture Overview
Thai ID Card OCR follows a client-server architecture:

Frontend:

Developed using React.js.
Communicates with the backend via API requests.
Backend:

Built with Node.js and Express.js.
Handles server-side logic, communicates with the database, and integrates with the Google Cloud Vision API for OCR.
Database:

MongoDB is used to store and retrieve ID card information.