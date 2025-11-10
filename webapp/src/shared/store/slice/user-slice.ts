import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  uuid: string;
  email: string;
  loggedIn: boolean;
}

const initialState: UserState = {
  name: "",
  uuid: "",
  email: "",
  loggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{ full_name: string; uuid: string; email: string }>,
    ) {
      state.name = action.payload.full_name;
      state.uuid = action.payload.uuid;
      state.email = action.payload.email;
      state.loggedIn = true;
    },
    logout(state) {
      state.name = "";
      state.uuid = "";
      state.email = "";
      state.loggedIn = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
