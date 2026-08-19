"""
QuickNotes - Flask application
Professionalized: load secrets from environment, hash passwords,
and small input validation before publishing to a public repo.
"""

import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3


load_dotenv()  # load .env when present (local development)

app = Flask(__name__)

# Use environment-provided secret in production. .env.example provides guidance.
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "please_change_me")

# Allow DATABASE override via environment for deployments
DATABASE = os.environ.get("DATABASE", "Quicknotes.db")


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()



@app.route("/")
def home():
    return render_template("index.html")



@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        # Basic validation
        if not username or not email or not password:
            return "Missing fields", 400

        # Hash the password before storing
        hashed = generate_password_hash(password)

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO users(username,email,password)
                VALUES(?,?,?)
                """,
                (username, email, hashed)
            )
            conn.commit()
        except sqlite3.IntegrityError:
            # Email already exists
            conn.close()
            return "Email already registered", 409
        finally:
            conn.close()

        return redirect(url_for("login"))


    return render_template("register.html")



@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get("email")
        password = request.form.get("password")


        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM users 
            WHERE email=?
            """,
            (email,)
        )

        user = cursor.fetchone()
        conn.close()

        # Verify password hash
        if user and check_password_hash(user["password"], password):
            session.clear()
            session["user_id"] = user["id"]
            return redirect(url_for("notes"))

        return "Invalid credentials", 401


    return render_template("login.html")



@app.route("/notes", methods=["GET", "POST"])
def notes():

    # Require login
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("login"))

    if request.method == "POST":
        title = request.form.get("title")
        content = request.form.get("content")

        if not title or not content:
            return "Missing note title or content", 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO notes(title, content, user_id)
            VALUES(?,?,?)
            """,
            (title, content, user_id)
        )

        conn.commit()
        conn.close()

        return redirect(url_for("notes"))

    conn = get_db_connection()
    cursor = conn.cursor()

    # Only fetch notes for the logged-in user
    cursor.execute("SELECT * FROM notes WHERE user_id=?", (user_id,))
    notes = cursor.fetchall()

    conn.close()

    return render_template("notes.html", notes=notes)




@app.route("/delete/<int:id>", methods=["POST"])
def delete_note(id):
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("login"))

    conn = get_db_connection()
    cursor = conn.cursor()

    # Ensure the logged-in user owns the note before deleting
    cursor.execute("SELECT user_id FROM notes WHERE id=?", (id,))
    owner = cursor.fetchone()
    if not owner or owner["user_id"] != user_id:
        conn.close()
        return "Not authorized", 403

    cursor.execute(
        """
        DELETE FROM notes 
        WHERE id=?
        """,
        (id,)
    )

    conn.commit()
    conn.close()

    return redirect(url_for("notes"))


@app.route("/logout")
def logout():
    """Clear the session and redirect to home."""
    session.clear()
    return redirect(url_for("home"))





if __name__ == "__main__":

    create_tables()

    # Use environment variable to control debug mode in development
    debug_mode = os.environ.get("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug_mode)