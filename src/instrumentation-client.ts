import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      advancedOptions: { checkLevel: "basic" },
      method: "POST",
      path: "/contact",
    },
  ],
});
