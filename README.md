# Karam Bot - LabLab Hackathon Project
This is the repo for the main chatbot AI functionality. 

### The Project's Other Repos
- API & Admin Panel https://github.com/a777med/lablab-strapi
- Dashboard frontend https://github.com/AdibZouiten/hackathon-frontend

### Technology
Karam is an AI-driven chatbot agent designed exclusively for the travel industry, enhancing hotel guest experience by providing instant responses 24/7. Tailored to each hotel’s unique offerings, Karam efficiently handles room service orders, ordering food and general inquiries. Its multilingual capabilities cater to a global audience, making communication seamless. It can also understand voice notes in all languages.  For hotel management, Karam is an invaluable asset that streamlines operations, reduces costs, and elevates the level of customer satisfaction through its intelligent and personable service. 

#### It can be fed data from: 
- The hotel website and PDF documents using Pincone Vector Store
- Our own backend, where the hotel admin can enter food and services menu & pricing.
  
**Also, the admin can receive the orders coming from Karam, which will be stored in a database. The orders and reported issues are all going to be stored in an SQL database.**

# How to use
- Clone this repository
- `npm install`
- `npx turbo run build lint format` to run build scripts quickly in parallel
- `npm start` to run your program
