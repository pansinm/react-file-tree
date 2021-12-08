import { Reducer, ReducerAction } from "react";
import { TreeNode } from "./type";

export type State = {
  root?: TreeNode;
};

type OpenAction = {
  type: "ResetRoot";
  payload: TreeNode | undefined;
};

type Action = OpenAction;

export const initialState: State = {
  root: undefined,
};

export const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "ResetRoot":
      return {
        root: action.payload,
      };
    default:
      return initialState;
  }
};
