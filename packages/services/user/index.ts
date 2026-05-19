import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret-token-key-for-jwt-signing-12345";

class UserService {
  public async createUser(fullName: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(usersTable)
      .values({
        fullName,
        email: email.toLowerCase().trim(),
        passwordHash,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to register user");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };
  }

  public async validateUser(email: string, password: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };
  }

  public async getUserById(id: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };
  }

  public generateToken(userId: string): string {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
  }

  public verifyToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      return decoded;
    } catch {
      return null;
    }
  }

  public async getAuthenticationMethods() {
    return [];
  }
}

export default UserService;
