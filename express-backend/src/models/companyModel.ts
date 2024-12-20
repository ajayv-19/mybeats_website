import client from '../config/database';

interface Company {
  id: number;
  email: string;
  // Add other company fields from your RLS table
}

export class CompanyModel {
  static async findByEmail(email: string): Promise<Company | null> {
    const result = await client.query(
      `SELECT * FROM "public"."RLS" WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  // Add other company-related database operations as needed
}