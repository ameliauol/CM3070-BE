# User Setup Guide

Prerequisites:
* Have NodeJS installed.
* Have GitHub installed
* Have VSCode installed.

.env File Requirements:\
DATABASE_URL=<Your own postrgesql database url>\
JWT_SECRET=<Any value, used to encrypt and sign tokens for user auths>\
ADMIN_SECRET_KEY=<Any key you want, used to overwrite user auth in API routes>\

Steps:
1. Use "git clone https://github.com/ameliauol/CM3070-BE" to clone the backend code to your local device.
2. Open the repository in VSCode.
3. Create your.env file with the requirements listed above. Ensure this file is in the main project directory.
4. In VSCode, open a Terminal and perform "npm i".
5. Then, perform "npm run dev".
6. Proceed to the front end application setup. It can be found at https://github.com/ameliauol/CM3070-FE .
