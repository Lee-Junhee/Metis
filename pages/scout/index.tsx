import type { InferGetServerSidePropsType, NextPage } from "next";
import React, { useEffect } from "react";
import Protected from "@components/auth/protected";
import { MatchInfo } from "@components/ui/form/match-info";
import { useState, useRef } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { setPreScoutAtom, setSelectedCompAtom } from "@server/atoms";
import EntryForm from "@components/ui/form/entry-form";
import { Answer } from "types/form-types";
import { trpc } from "@util/trpc/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSidePropsContext } from "next";
import { appRouter } from "@server/routers/_app";
import { createContextInner } from "@server/context";
import type { Team, User, MatchForm, TeamUser } from "@prisma/client";

type FetchedTeam = Team & { members: TeamUser[]; matchScouts: MatchForm[] };

export default function Scout(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();

  const [selectedTeam, setSelectedTeam] = useState<FetchedTeam | undefined>();
  const [form, setForm] = useState<string>();

  useEffect(() => {
    if (props.teams.length !== 0) {
      const initTeam = props.teams[0];
      setSelectedTeam(initTeam.team as FetchedTeam);
      if (initTeam.team.matchScouts.length !== 0) {
        setForm(initTeam?.team.matchScouts[0].id);
      }
    }
  }, [setSelectedTeam]);

  // const { data: matchForms, isLoading } = trpc.match.getByTeam.useQuery({
  //   teamId: selectedTeam?.id as string,
  // });

  let matchForms = selectedTeam?.matchScouts;

  const submitResponse = trpc.match.addResponse.useMutation();

  const [selectedComp] = useAtom(setSelectedCompAtom);

  const defendedRef = useRef<HTMLInputElement>(null);
  const defendedByRef = useRef<HTMLInputElement>(null);

  const [defended, setDefended] = useState<number[]>([]);
  const [defendedBy, setDefendedBy] = useState<number[]>([]);
  const [prescout, setPrescout] = useAtom(setPreScoutAtom);

  // make submit method and pass into entry form component
  const submitForm = async (answers: Answer[]) => {
    await submitResponse.mutateAsync({
      teamId: selectedTeam?.id as string,
      compId: selectedComp?.id as string,
      formId: form as string,
      prescout: prescout,
      video: "yea",
      answers: answers,
    });
  };


  return (
    <Protected>
      <div className="min-h-screen py-16 md:px-4 xl:px-36 2xl:px-52 dark:text-white">
        <h1 className="2xl:text-red-600 xl:text-cyan-400">weee</h1>
        <div className="flex items-center justify-start xl:px-4 2xl:px-12">
          {matchForms?.length !== 0 || selectedTeam !== undefined ? (
            <select
              className="h-full p-2 mb-4 border-r-4 rounded-lg shadow-md outline-none dark:text-white dark:bg-zinc-900 dark:border-zinc-700"
              onChange={(e: React.SyntheticEvent) =>
                setForm((e.target as HTMLSelectElement).value)
              }
            >
              {matchForms?.map((matchForm, i) => (
                <option value={matchForm.id} key={i}>
                  {matchForm.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className="xl:px-4 2xl:px-12">
          <MatchInfo />
          <div className="flex flex-col">
            {/* For some reason, list of teams is rendered as undefined initially. This is a disgusting workaround  */}
            {props?.teams.filter(
              (t) => t.team.id === (selectedTeam?.id as string)
            )[0] !== undefined ? (
              <EntryForm
                form={
                  props?.teams
                    .filter(
                      (t) => t.team.id === (selectedTeam?.id as string)
                    )[0]
                    .team.matchScouts?.filter((f) => f?.id === form)?.[0]
                }
                submitResponse={submitForm}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Protected>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({
      session: await getSession(context),
    }),
  });

  let teams = await ssg.team.getByUser.fetch();

  teams.forEach((e) =>
    e.team.members.forEach((m) => {
      m.user.created = String(m.user.created);
      m.user.emailVerified = String(m.user.emailVerified);
    })
  );

  return {
    props: {
      teams: teams,
    },
  };
}
