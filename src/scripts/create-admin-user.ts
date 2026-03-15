import { createAdminUser, findAdminUserWithPasswordByUsername } from "@/lib/db/admin-auth";
import { hashPassword } from "@/lib/password";
import { AdminRole } from "@/lib/types";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const username = readArg("--username");
  const password = readArg("--password");
  const role = (readArg("--role") ?? "admin") as AdminRole;

  if (!username || !password) {
    throw new Error("Usage: npm run admin:create -- --username <name> --password <password> [--role admin]");
  }

  const existing = await findAdminUserWithPasswordByUsername(username);
  if (existing) {
    throw new Error(`Admin user '${username}' already exists.`);
  }

  const user = await createAdminUser({
    username,
    passwordHash: hashPassword(password),
    role
  });

  console.log(JSON.stringify({ id: user.id, username: user.username, role: user.role }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
