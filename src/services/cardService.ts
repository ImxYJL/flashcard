import { supabase } from "@/lib/supabase/client";
import { grade } from "@/lib/leitner";
import type { Card, Category } from "@/types/card";

/** DB row (snake_case) → 도메인 Card (camelCase) 매핑 */
type CardRow = {
  id: string;
  before: string;
  phrase: string;
  after: string;
  category: Category;
  tags: string[];
  box: number;
  next_review: string;
  created_at: string;
  last_reviewed_at: string | null;
};

const toCard = (row: CardRow): Card => ({
  id: row.id,
  before: row.before,
  phrase: row.phrase,
  after: row.after,
  category: row.category,
  tags: row.tags,
  box: row.box,
  nextReview: row.next_review,
  createdAt: row.created_at,
  lastReviewedAt: row.last_reviewed_at,
});

export type CreateCardReq = {
  before: string;
  phrase: string;
  after: string;
  category: Category;
  tags?: string[];
};

export const createCard = async (input: CreateCardReq): Promise<Card> => {
  const { data, error } = await supabase
    .from("cards")
    .insert({
      before: input.before,
      phrase: input.phrase,
      after: input.after,
      category: input.category,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  return toCard(data as CardRow);
};

export const getCards = async (): Promise<Card[]> => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as CardRow[]).map(toCard);
};

export const gradeCard = async (card: Card, knew: boolean): Promise<Card> => {
  const graded = grade(
    {
      box: card.box,
      nextReview: Date.parse(card.nextReview),
      lastReviewed: card.lastReviewedAt ? Date.parse(card.lastReviewedAt) : null,
    },
    knew,
  );

  const { data, error } = await supabase
    .from("cards")
    .update({
      box: graded.box,
      next_review: new Date(graded.nextReview).toISOString(),
      last_reviewed_at: new Date(graded.lastReviewed!).toISOString(),
    })
    .eq("id", card.id)
    .select()
    .single();

  if (error) throw error;
  return toCard(data as CardRow);
};

export type UpdateCardReq = {
  id: string;
  before: string;
  phrase: string;
  after: string;
  category: Category;
};

export const updateCard = async (input: UpdateCardReq): Promise<Card> => {
  const { data, error } = await supabase
    .from("cards")
    .update({
      before: input.before,
      phrase: input.phrase,
      after: input.after,
      category: input.category,
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;
  return toCard(data as CardRow);
};

export const deleteCard = async (id: string): Promise<void> => {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
};
