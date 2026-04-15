const { z } = require('zod');
const { strongPasswordSchema } = require('./password-policy');

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(50, { message: 'Username must be at most 50 characters' })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message: 'Username may only contain letters, numbers, dot, underscore and hyphen',
      }),
    email: z.string().trim().email({ message: 'Invalid email address' }),
    password: strongPasswordSchema,
    password_confirm: z.string(),
    full_name: z.string().optional(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })
  .transform(({ password_confirm: _pc, ...rest }) => rest);

/** Body giữ field `email` để tương thích client; giá trị có thể là email hoặc username. */
const loginSchema = z.object({
  email: z.string().trim().min(2, { message: 'Login is required' }).max(255),
  password: z.string().min(1, { message: 'Password is required' }),
});

const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(100).optional(),
  current_password: z.string().optional(),
  /** Đổi mật khẩu: để trống hoặc bỏ field = không đổi; có giá trị thì phải đủ mạnh. */
  new_password: z.union([z.literal(''), strongPasswordSchema]).optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  locale: z.enum(['vi', 'es', 'en']).optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  new_password: strongPasswordSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
