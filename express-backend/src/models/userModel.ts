import client from '../config/database';

interface User {
  id: number;
  name: string;
  email: string;
}

export class UserModel {
  static async create(name: string, email: string): Promise<User> {
    const result = await client.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await client.query("SELECT * FROM users");
    return result.rows;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, name: string, email: string): Promise<User | null> {
    const result = await client.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<User | null> {
    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  }
} 