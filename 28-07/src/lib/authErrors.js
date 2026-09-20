// Traduce los mensajes de error de Supabase Auth a mensajes claros en español.
export function getAuthErrorMessage(error) {
  const msg = (error?.message || '').toLowerCase()

  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('email not confirmed')) return 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'
  if (msg.includes('user already registered') || msg.includes('already registered')) return 'Ese correo ya está registrado. Intenta iniciar sesión.'
  if (msg.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) return 'El correo electrónico no es válido.'
  if (msg.includes('token has expired') || msg.includes('expired')) return 'El enlace expiró. Solicita uno nuevo.'
  if (msg.includes('invalid token') || msg.includes('otp')) return 'El enlace no es válido o ya fue utilizado.'
  if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (msg.includes('session') && msg.includes('missing')) return 'Tu sesión expiró. Vuelve a iniciar sesión.'

  return error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
}
