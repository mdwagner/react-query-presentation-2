import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import type { User, Team, Project } from "../typings";

async function fetchUsers() {
  const response = await fetch("/users");
  if (!response.ok) {
    throw new Error("Something went wrong");
  }
  return await response.json();
}
async function fetchTeams() {
  const response = await fetch("/teams");
  if (!response.ok) {
    throw new Error("Something went wrong");
  }
  return await response.json();
}
async function fetchProjects() {
  const response = await fetch("/projects");
  if (!response.ok) {
    throw new Error("Something went wrong");
  }
  return await response.json();
}

function ReactQueryAdvanced() {
  const usersQuery = useQuery<User[], Error>(["users"], fetchUsers);
  const teamsQuery = useQuery<Team[], Error>(["teams"], fetchTeams);
  const projectsQuery = useQuery<Project[], Error>(["projects"], fetchProjects);

  return (
    <div className="grid grid-cols-3 gap-x-1 mx-4">
      <div>
        <ul className="list-disc space-y-2">
          {usersQuery.data?.map((user) => (
            <li key={user.id}>
              <ul>
                <li>First Name: {user.firstName}</li>
                <li>Last Name: {user.lastName}</li>
                <li>Username: {user.userName}</li>
                <li>Email: {user.email}</li>
                <li>Age: {user.age}</li>
              </ul>
            </li>
          ))}
          {usersQuery.isLoading ? (
            <div className="font-bold">Loading...</div>
          ) : null}
        </ul>
      </div>
      <div>
        <ul className="list-disc space-y-2">
          {teamsQuery.data?.map((team) => (
            <li key={team.id}>
              <ul>
                <li>Team Name: {team.name}</li>
                <li>Department: {team.department}</li>
              </ul>
            </li>
          ))}

          {teamsQuery.isLoading ? (
            <div className="font-bold">Loading...</div>
          ) : null}
        </ul>
      </div>
      <div>
        <ul className="list-disc space-y-2">
          {projectsQuery.data?.map((project) => (
            <li key={project.id}>
              <ul>
                <li>Project Name: {project.name}</li>
                <li>
                  Goal: <span className="italic">{project.goalStatement}</span>
                </li>
              </ul>
            </li>
          ))}

          {projectsQuery.isLoading ? (
            <div className="font-bold">Loading...</div>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function ReactQueryAdvancedRoot() {
  const [queryClient] = useState(new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryAdvanced />
    </QueryClientProvider>
  );
}

export default ReactQueryAdvancedRoot;
