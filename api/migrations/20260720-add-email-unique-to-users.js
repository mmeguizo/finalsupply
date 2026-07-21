// Migration: Add unique index on User.email
// Prerequisite: Run a read-only duplicate report first:
//   SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
// Resolve duplicates before applying this migration.

export async function up(query) {
  const indexes = await query.showIndex('users');
  const hasEmailUnique = indexes.some(
    (i) => i.unique && i.fields.some((f) => f.attribute === 'email')
  );
  if (hasEmailUnique) {
    return;
  }

  await query.addIndex('users', ['email'], {
    name: 'users_email_unique',
    unique: true,
  });
}

export async function down(query) {
  const indexes = await query.showIndex('users');
  const emailUnique = indexes.find(
    (i) => i.unique && i.fields.some((f) => f.attribute === 'email')
  );
  if (emailUnique) {
    await query.removeIndex('users', emailUnique.name);
  }
}
