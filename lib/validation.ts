import { z } from 'zod';

// Vote validation schema
export const voteSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  choice: z.enum(['girl', 'boy']),
  // Extended predictions
  birthDate: z.string().optional(),
  birthTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm requis').optional().or(z.literal('')),
  weight: z.number().min(500).max(10000).optional(),
  height: z.number().min(20).max(100).optional(),
  hairColor: z.string().max(50).optional().or(z.literal('')),
  eyeColor: z.string().max(50).optional().or(z.literal(''))
});

// Config validation schema
export const configSchema = z.object({
  babyName: z.string().max(100).optional(),
  parentNames: z.string().max(200).optional(),
  girlIcon: z.string().max(50).optional(),
  boyIcon: z.string().max(50).optional(),
  girlColor: z.string().max(20).optional(),
  boyColor: z.string().max(20).optional(),
  birthListLink: z.string().url('URL invalide').optional().or(z.literal('')),
  // Estimated due date (date du terme)
  dueDate: z.string().optional().or(z.literal('')),
  revealDate: z.string().optional(),
  isRevealed: z.boolean().optional(),
  actualGender: z.enum(['girl', 'boy']).nullable().optional(),
  // Actual birth details
  actualBirthDate: z.string().optional(),
  actualBirthTime: z.string().optional(),
  actualWeight: z.number().optional(),
  actualHeight: z.number().optional(),
  actualHairColor: z.string().max(50).optional(),
  actualEyeColor: z.string().max(50).optional()
});

// Auth validation schema
export const loginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis')
});

// Type exports
export type VoteInput = z.infer<typeof voteSchema>;
export type ConfigInput = z.infer<typeof configSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
