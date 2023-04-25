import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/backend/utils/prisma";
import { getOptionsForVote } from "@/utils/getRandomPokemon";

export const appRouter = trpc
  .router()
  .query("get-pokemon-pair", {
    async resolve() {
      const pokemonCount = await prisma.pokemon.count();
      const skipOne = Math.floor(Math.random() * pokemonCount - 1);
      const skipTwo = Math.floor(Math.random() * pokemonCount - 1);
      const pokemonOne = await prisma.pokemon.findFirst({
        take: 1,
        skip: skipOne,
      });
      const pokemonTwo = await prisma.pokemon.findFirst({
        take: 1,
        skip: skipTwo,
      });
      if (!pokemonOne || !pokemonTwo) {
        throw new Error("Failed to find two pokemon");
      }

      return { firstPokemon: pokemonOne, secondPokemon: pokemonTwo };
    },
  })
  .mutation("cast-vote", {
    input: z.object({
      votedFor: z.number(),
      votedAgainst: z.number(),
    }),
    async resolve({ input }) {
      const voteInDb = await prisma.vote.create({
        data: {
          votedAgainstId: input.votedAgainst,
          votedForId: input.votedFor,
        },
      });
      return { success: true, vote: voteInDb };
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
