import { trpc, useQuery } from "../../../hooks/trpc";
import React, { useRef, useState } from "react";
import { AiOutlineConsoleSql, AiOutlineSearch } from "react-icons/ai";
import { Tab } from "@headlessui/react";
import type { Query } from "../../../types/filter-types";
export const Filter: React.FC<{ teamNum: number }> = ({ teamNum }) => {

  const teamNumber = useRef<HTMLInputElement>(null);
  const eventName = useRef<HTMLInputElement>(null);

  const [entryAttribute, setEntryAttribute] = useState();
  const [input, setInput] = useState<Query>({});

  const { invalidateQueries } = trpc.useContext();
  const { data: entryData } = useQuery(["entry.get-by-filter", input]);

  const searchEntry = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    
    // query["entryTeamNumber"] = 2265;
    // console.log(query)
    setInput({...input, "entryTeamNumber": 2265})
    invalidateQueries("entry.get-by-filter");

  };

  return (
    <>
      <div className="flex flex-col items-center mb-4 shadow-sm justfiy-center">
        <form className="flex w-full mb-6 " onSubmit={searchEntry}>
          <div className="grid grid-cols-2">
            <select className="w-full h-full p-2 border-r-4 rounded-l-lg shadow-md outline-none" >
              <option value="entryTeamNumber">Team</option>
              <option value="eventName">Event</option>
            </select>
            <input
              className="w-full p-2 shadow-md outline-none"
              ref={eventName}
              autoComplete="off"
            />
          </div>
          <button
            className="px-3 py-2 text-xl text-white rounded-r-lg shadow-md bg-cyan-500"
            type="submit"
          >
            +
          </button> 
        </form>
        {/* <div className="flex flex-wrap mb-4">
        {Object.keys(query).map((key, i) => (
          <div key={i} className="p-2 text-sm text-white bg-red-400 rounded-lg">
            {key}: {query[key as keyof typeof query]}
          </div>
        ))}
      </div> */}
        <div className="grid w-full grid-cols-1 ">
          {entryData?.map((entry, i) => (
            <div
              className="py-2 mb-6 border shadow-xl rounded-xl bg-slate-50"
              key={i}
            >
              <div className="grid grid-cols-2 px-5 py-4">
                <div>
                  <h1 className="text-sm">
                    {entry?.matchType} {entry?.matchNumber}
                  </h1>
                  <h1>{entry?.compName}</h1>
                  <h1 className="text-xl">Team {entry?.entryTeamNumber}</h1>
                </div>
                <div className="flex flex-col text-right">
                  <div>
                    <b>{entry.autoHighShotsMade + entry.autoLowShotsMade}</b>{" "}
                    total auto goals
                  </div>
                  <div>
                    <b>
                      {entry.teleopHighShotsMade + entry.teleopLowShotsMade}
                    </b>{" "}
                    total teleop goals
                  </div>
                  <div>
                    {entry.climbEnd - entry.climbStart === 0
                      ? "No climb"
                      : entry.climbStart - entry.climbEnd + " second climb"}
                  </div>
                  <div>{entry.climbRung} Rung</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
