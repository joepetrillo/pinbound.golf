import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Action error:", error.message);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});
