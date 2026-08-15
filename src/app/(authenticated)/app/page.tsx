import { redirect } from "next/navigation";

import { DASHBOARD_HREF } from "@/lib/site";

const appPage = () => redirect(DASHBOARD_HREF);

export default appPage;
