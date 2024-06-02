// creating the user interface

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

// why are we using interface?
// because we want to define the structure of the user object. This will help us to type check the user object and get intellisense support in the editor.
