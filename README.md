# Introduction

Explore How You can integrate [Lucia-Auth](https://lucia-auth.com/) in your Rust Project.

## What is Lucia-Auth?

Lucia-Auth is a simple and easy to use open source auth library that allows you to add authentication to your application in minutes.

## Folder Structure

- `auth-frontend`: Contains the frontend code for the project.
- `resource_server`: Contains the backend code for the project.

## How to run

- Clone the repository.
- use the .env.example file to create a .env file in the both `auth-frontend` and `resource_server` folder.
- Run the frontend and backend using the following commands:

```bash
cd auth-frontend
npm install
npm start
```

```bash
cd resource_server
cargo run
```

The Frontend will be running on `http://localhost:3000` and the backend will be running on `http://localhost:5600`.
