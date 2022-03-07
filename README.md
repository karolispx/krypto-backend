## Description
This repository contains all code for the backend of Krypto project.

Live Application URL: https://krypto-project.online/
API URL: https://final-project-krypto.herokuapp.com/

Karolis Pliauskys 20058120

## Local Environment Setup
- Configure `node` and `npm` on the computer: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Install and configure MongoDB on the computer: https://www.mongodb.com/try/download/community
- Clone this repository locally: `git clone git@github.com:karolispx/krypto-backend.git && cd krypto-backend`
- Install dependencies: `npm install`
- Adjust environment variables in the `.env` file.
- Run the application: `npm run dev`

## Testing
This repository contains a folder called `postman`. This folder contains all collections and environments (local, production) needed for testing API endpoints using postman.

Postman can be downloaded here: https://www.postman.com/

Simply import all of the postman setup files from `postman` folder into your workspace locally, adjust API URL in the environment if you have used a different port to start the local development environment and you should be able to test all of the API endpoints. 