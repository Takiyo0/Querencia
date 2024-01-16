# Querencia Site
> ⚠️ This repository is only for archiving purposes. This site is for internal use only and is not meant to be used by the public. Copyright 2023 @Takiyo \
> Using this code, for any purpose, is not allowed without the permission of the owner.

> I have removed pretty much all the sensitive data, so you can't run this code. This is only for archiving purposes. If you want the full code, please contact me (only the chosen one can get the full code).

Welcome to the Querencia site repository. This is the source code for the Querencia site, which was online from August to November. Mainly used for Querencia's information and to register for the event.

This repository has 2 folders: `server` and `webpage`. The `server` folder contains the source code for the backend, and the `webpage` folder contains the source code for the frontend. The main language used is Typescript, and the main framework used is React.js (Typescript).

## Server
The server is a Node.js server, using Express.js as the framework. It uses MongoDB as the database, and Mongoose as the ODM. It also uses Passport.js for Google authentication.
how to run:
```js
cd server
npm install
npm fullBuild
```
this will compile the typescript files, and webpage, and run the server. The server will be running on port 3001

## Webpage
The webpage is a React.js (Typescript) application. It uses React Router for routing and Material UI for styling (form). All the images are stored in `cdn` server, you can get the images by contacting Takiyo.

## Documentation
### Server
The base path for the REST API is `/api`. All the endpoints are located in `server/src/Routes/Rest/*.ts` and are listed below:

|Category|  Path            |Method  | Description      |
|------- |------------------|--------|------------------|
| admin | /admin/registration/list | GET | List all received registrations. Only some important data are returned  |
| admin | /admin/registration/:id | GET | Get a specific registrations, this includes raw data |
| admin | /admin/registration/:id/approve | POST | Approve a registration  |
| admin | /admin/registration/:id/reject | POST | Reject a registration  |
| admin | /admin/sponsor/:name | POST | Create a new sponsor to show on the main page |
| admin | /admin/sponsor/:id | PATCH | Edit a specific sponsor |
| admin | /admin/sponsor/:id | DELETE | Delete a sponsor |
| admin | /admin/sponsor/list | GET | Get all sponsors |
| admin | /admin/stats | GET | Get registration statistics for dashboard |
| admin | /admin/list-admins | GET | List all admins that are allowed to access the dashboard |
| analytics | /analytics/cheer | POST | Send an anonymous analytics data |
| analytics | /analytics/sponsor-video | POST | Send an anonymous analytics when user watched a sponsor video |
| analytics | /analytics/cheer | GET | Get all analytics |
| auth | /auth/google | GET | Redirect to accounts.google.com for login |
| auth | /auth/google/callback | GET | Callback from accounts.google.com after login |
| auth | /auth/user | GET | Get current logged in user |
| auth | /auth/logout | GET | Logout |
| competition | /competition/list | GET | Get all competitions list |
| competition | /competition/get/:id | GET | Get specific competition |
| competition | /competition/flush | POST | Flush the cache and fetch from gSheet |
| file | /file/upload | POST | Upload a file to be uploaded to cdn server |
| file | /file/download | GET | Download a file |
| file | /file/compress | GET | Compress a file |
| register | /register/ | POST | Register a competition |
| register | /register/:id/finish | GET | Check if the user finished the registration (completed all the file reqs) |
| register | /register/:id/finish | POST | Post the missing file requirements to a specific register |
| register | /register/get/:id/ticket | GET | Get ticket image |
| register | /register/open | GET | Check if the registration is currently open |
| register | /register/open/competition | GET | Get all open competitions |
| register | /register/open/:id | POST | Mark a specific competition as receiving response or not |
| register | /register/open | POST | Open the registration |
| register | /register/close | POST | Close the registration |
| sponsor | /sponsor/get-all-data | GET | Get all sponsor statistics data for admin |
| user | /user/set-admin | POST | Add or remove an admin |
| user | /user/bulk-set-admin | POST | Bulk add/remove admins |
| user | /user/version | GET | Get current server's version |

#### How it works?
- for competitions, it uses Google Sheets as the data source. It will fetch the data from Google Sheets, save it to the database, and cache it. This is done to reduce the number of requests to Google Sheets.
- for files, it will be uploaded to the cdn server, and the link will be saved to the database. Cloudflare will automatically cache the image on their server. I use [ChibiSafe](https://github.com/chibisafe/chibisafe) because it's simple and easy.
- I use [Mailgun](https://www.mailgun.com/) for sending emails. It has a great API and works well. I use it literally for everything, from sending emails to registration status.
- I use a token system for registration. This will ensure that the user is the one who registered, and not someone else. The token is generated randomly and is sent to the user's email. The token is also used to check if the user has finished the registration or not.