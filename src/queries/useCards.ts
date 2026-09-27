"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  getCards,
  type CreateCardReq,
} from "@/services/cardService";
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
