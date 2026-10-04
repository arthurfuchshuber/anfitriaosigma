import { useAuth } from "@/contexts/AuthContext";
import CloserHome from "./closer/Home";
import ManagerPanel from "./manager/Painel";

/** /intranet/metas: cada papel cai na sua tela inicial. */
const MetasHome = () => (useAuth().isManager ? <ManagerPanel /> : <CloserHome />);
export default MetasHome;
