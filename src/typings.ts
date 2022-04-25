export interface Todo {
  id: number;
  title: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  age: number;
  avatarUrl: string;
  email: string;
}
export interface Team {
  id: string;
  name: string;
  department: string;
  /**
   * User IDs
   */
  members: string[];
}
export interface Project {
  id: string;
  name: string;
  goalStatement: string;
  /**
   * Team ID
   */
  team: string;
}
