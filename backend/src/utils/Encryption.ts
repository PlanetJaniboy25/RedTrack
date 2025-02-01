import bcrypt from 'bcrypt';

async function hashPassword(password: string) : Promise<String> {
  return await bcrypt.hash(password, 10);
}

async function compareHashedPasswords(password1 : string, password2 : string) : Promise<Boolean> {
  return await bcrypt.compare(password1, password2);
}

export { hashPassword, compareHashedPasswords };