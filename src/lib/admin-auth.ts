const ADMIN_EMAILS = ['danny@tipperlink.com', 'dannycawdell@gmail.com']

export function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email)
}
