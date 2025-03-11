import * as bcrypt from 'bcrypt';

/**
 * Helper functions for password handling
 */
export class PasswordHelper {
  /**
   * Hash a plain password using bcrypt
   * @param plainPassword The plain password to hash
   * @param saltRounds Number of rounds for salt generation (default is 10)
   * @returns The hashed string
   */
  static async hash(plainPassword: string, saltRounds = 10): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(plainPassword, salt);
  }

  /**
   * Verify a plain password against a hashed password
   * @param plainPassword The plain password to check
   * @param hashedPassword The hashed password to compare against
   * @returns `true` if the password matches, otherwise `false`
   */
  static async verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
