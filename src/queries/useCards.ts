"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  gradeCard,
  getCards,
  type CreateCardReq,
} from "@/services/cardService";
import type { Card } from "@/types/card";
import { queryKeys } from "./queryKeys";

export const useCards = () =>
  useQuery({ queryKey: queryKeys.cards, queryFn: getCards });

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCardReq) => createCard(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cards }),
  });
};

export const useGradeCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ card, knew }: { card: Card; knew: boolean }) =>
      gradeCard(card, knew),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cards }),
  });
};
