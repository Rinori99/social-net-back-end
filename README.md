## Project Name

SocialNet (Backend)

The backend of the SocialNet social network web application, using Node.js with Typescript and PostgreSQL database.

## Project Status

Currently, the project contains a basic set of features and is open for extension.

## Installation and Setup Instructions

Clone down this repository. You will need `node`, `npm`, and `postgres` installed globally on your machine.

Create a database named `social`.
```python
create database social;
```

**Note:** You have to change the database user and password values in `database/connection.ts` file according to your settings:
```python
user: 'HERE GOES THE USER',
password: 'HERE GOES THE PASSWORD',
```

Execute the SQL script in `database/script.sql` to have the necessary tables created.

Installation:

`npm install`

To build the project:

`npm run build`

To Start Server:

`npm start`

## Demo
![socialnet_demo](https://user-images.githubusercontent.com/42043751/137647233-b3a74548-f60c-4bf2-8481-0c8957c75d15.gif)


## Author(s)
- Rinor Hajrizi
