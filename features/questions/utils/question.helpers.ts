export function isDuplicateQuestion(existing: any, incoming: any) {
  return (
    existing.question_text.trim().toLowerCase() === incoming.question_text.trim().toLowerCase() &&
    existing.option_a.trim().toLowerCase() === incoming.option_a.trim().toLowerCase() &&
    existing.option_b.trim().toLowerCase() === incoming.option_b.trim().toLowerCase() &&
    existing.option_c.trim().toLowerCase() === incoming.option_c.trim().toLowerCase() &&
    existing.option_d.trim().toLowerCase() === incoming.option_d.trim().toLowerCase() &&
    existing.correct_option === incoming.correct_option
  );
}
