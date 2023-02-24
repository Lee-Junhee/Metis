import { z } from "zod";
import { MatchQuestionType } from "@prisma/client";
import { MatchPromptType } from "@prisma/client";
import { inputs } from "../../components/scouting/filter/dynamic-input";
import { Answer } from "../../types/form-types";
import { entityId, assertAdmin } from "../middleware/is-admin";
import { router } from "../trpc";
import { LEVEL } from "../../types/misc-types";
import { authProcedure } from "../middleware/auth";

export const matchRouter = router({
  /**
   * Creates a new Match Form, given the the user is a Team Admin.
   *
   * Takes in a team ID.
   */
  createForm: assertAdmin(LEVEL.TEAM)
    .input(entityId.extend({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchForm.create({
        data: {
          teamId: input.entityId,
          name: input.name,
        },
      });
    }),

  /**
   * Deletes a Match Form, given the the user is a Team Admin.
   *
   * Takes in a Match Form ID.
   */
  deleteForm: assertAdmin(LEVEL.MATCH_FORM)
    .input(entityId)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchForm.delete({
        where: { id: input.entityId },
      });
    }),

  /**
   * Creates a new Match Form Category, given the the user is a Team Admin.
   *
   * Takes in a Match Form ID.
   */
  createCategory: assertAdmin(LEVEL.MATCH_FORM)
    .input(entityId.extend({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormCategory.create({
        data: {
          matchFormId: input.entityId,
          name: input.name,
        },
      });
    }),

  /**
   * Deletes a  Match Form Category, given the the user is a Team Admin.
   *
   * Takes in a Match Category ID.
   */
  deleteCategory: assertAdmin(LEVEL.MATCH_CATEGORY)
    .input(entityId)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormCategory.delete({
        where: { id: input.entityId },
      });
    }),

  addQuestion: assertAdmin(LEVEL.MATCH_CATEGORY)
    .input(
      entityId.extend({
        prompt: z.string(),
        questionType: z.nativeEnum(MatchQuestionType),
        promptType: z.nativeEnum(MatchPromptType),
        options: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormQuestion.create({
        data: {
          matchCategoryId: input.entityId,
          prompt: input.prompt,
          questionType: input.questionType,
          promptType: input.promptType,
          options: input.options,
        },
      });
    }),

  deleteQuestion: assertAdmin(LEVEL.MATCH_QUESTION)
    .input(entityId)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormQuestion.delete({
        where: { id: input.entityId },
      });
    }),

  addResponse: authProcedure
    .input(
      z.object({
        teamId: z.string(),
        compId: z.string(),
        formId: z.string(),
        prescout: z.boolean(),
        video: z.string(),
        answers: z
          .object({
            questionId: z.string(),
            slot1: z.string().optional(),
            slot2: z.string().optional(),
            slot3: z.string().array().optional(),
          })
          .array(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormResponse.create({
        data: {
          userId: ctx.session.user.id,
          teamId: input.teamId,
          compId: input.compId,
          formId: input.formId,
          prescout: input.prescout,
          video: input.video,
          answers: {
            create: input.answers,
          },
        },
      });
    }),

  deleteResponse: assertAdmin(LEVEL.MATCH_RESPONSE)
    .input(entityId)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.matchFormResponse.delete({
        where: { id: input.entityId },
      });
    }),

  getByTeam: authProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.matchForm.findMany({
        where: { teamId: input.teamId },
        include: {
          categories: {
            include: {
              questions: true,
            },
          },
        },
      });
    }),

  getById: authProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.matchForm.findUnique({
        where: { id: input.id },
        include: {
          categories: {
            include: {
              questions: true,
            },
          },
        },
      });
    }),
});

