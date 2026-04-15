const { z } = require('zod');

const startAttemptSchema = z.object({
  quiz_id: z.number().int().positive(),
});

const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.number().int().positive()),
  /** Giây từ lúc mở đề trên UI (client); server chỉ chấp nhận nếu gần TIMESTAMPDIFF. */
  elapsed_seconds: z.number().int().min(0).max(86400).optional(),
});

const checkQuestionSchema = z.object({
  question_id: z.number().int().positive(),
  answer_id: z.number().int().positive(),
});

module.exports = {
  startAttemptSchema,
  submitAttemptSchema,
  checkQuestionSchema,
};
