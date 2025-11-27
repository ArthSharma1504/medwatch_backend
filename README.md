# MedWatch Backend
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/ArthSharma1504/medwatch)

This repository contains the backend service for MedWatch, a medication management and reminder application. It is built with Node.js, Express, and MySQL, providing a RESTful API for user authentication, medication tracking, and reminder management.

## Features

*   **User Authentication**: Secure registration and login for doctors using JWT (JSON Web Tokens).
*   **Medication Management**: Full CRUD (Create, Read, Update, Delete) functionality for managing patient medications.
*   **Reminders**: Full CRUD functionality for setting and managing medication reminders.
*   **Protected Routes**: Middleware to ensure that only authenticated users can access sensitive endpoints.

## Tech Stack

*   **Runtime Environment**: Node.js
*   **Framework**: Express.js
*   **Database**: MySQL
*   **Authentication**: JSON Web Tokens (jsonwebtoken)
*   **Password Hashing**: bcrypt.js
*   **Other Libraries**: `cors`, `dotenv`, `mysql2`

## Prerequisites

*   Node.js (v14 or higher)
*   npm
*   A running MySQL instance

## Setup and Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/arthsharma1504/medwatch.git
    cd medwatch
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up the database:**
    *   Connect to your MySQL server.
    *   Create the database and tables using the provided SQL script. You can execute the commands found in the `sql.txt` file.

    ```sql
    create database medwatch;
    use medwatch;

    CREATE TABLE doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'doctor'
    );

    CREATE TABLE people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        rfid VARCHAR(100) UNIQUE,
        disease_status ENUM('healthy','suspected','positive') DEFAULT 'healthy'
    );

    CREATE TABLE rfid_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rfid VARCHAR(100),
        location VARCHAR(100),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rfid VARCHAR(100),
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE medications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        disease varchar(200),
        dosage VARCHAR(255) NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

4.  **Create a `.env` file:**
    Create a `.env` file in the root directory and add the following environment variables:
    ```env
    PORT=5000
    DB_HOST=your_mysql_host
    DB_USER=your_mysql_user
    DB_PASS=your_mysql_password
    DB_NAME=medwatch
    JWT_SECRET=your_jwt_secret_key
    ```

5.  **Start the server:**
    ```sh
    node server.js
    ```
    For development, you can use `nodemon`:
    ```sh
    npx nodemon server.js
    ```
    The server will be running on `http://localhost:5000`.

## API Endpoints

All protected routes require an `Authorization` header with the JWT token.

### Authentication (`/auth`)

| Method | Endpoint         | Description                   |
| :----- | :--------------- | :---------------------------- |
| `POST` | `/auth/register` | Registers a new doctor.       |
| `POST` | `/auth/login`    | Logs in a doctor and returns a JWT. |

**Request Body for `/register`:**
```json
{
  "name": "Dr. John Doe",
  "email": "john.doe@example.com",
  "password": "yourpassword123"
}
```

**Request Body for `/login`:**
```json
{
  "email": "john.doe@example.com",
  "password": "yourpassword123"
}
```

---

### Medications (`/medications`)

These routes are protected and require authentication.

| Method   | Endpoint          | Description                        |
| :------- | :---------------- | :--------------------------------- |
| `POST`   | `/medications`    | Adds a new medication.             |
| `GET`    | `/medications`    | Retrieves all medications for the user. |
| `PUT`    | `/medications/:id`| Updates a specific medication.    |
| `DELETE` | `/medications/:id`| Deletes a specific medication.     |

**Request Body for `POST` and `PUT`:**
```json
{
  "name": "Ibuprofen",
  "disease": "Headache",
  "dosage": "200mg",
  "frequency": "Twice a day",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07"
}
```

---

### Reminders (`/reminders`)

These routes are protected and require authentication.

| Method   | Endpoint       | Description                     |
| :------- | :------------- | :------------------------------ |
| `POST`   | `/reminders`   | Adds a new reminder.            |
| `GET`    | `/reminders`   | Retrieves all reminders for the user. |
| `PUT`    | `/reminders/:id` | Updates a specific reminder.    |
| `DELETE` | `/reminders/:id` | Deletes a specific reminder.    |

**Request Body for `POST` and `PUT`:**
```json
{
  "medication_id": 1,
  "reminder_time": "2024-01-01T09:00:00"
}