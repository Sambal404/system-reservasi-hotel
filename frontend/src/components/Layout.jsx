import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

function Layout (){
    return(
      <div className="min-h-screen bg-[#F8F9FA] flex">
        <SideBar/>
        <div className="flex-1 ml-[16.666667%] flex flex-col">
            <TopBar/>
            <main className="p-6 mt-16">
                <Outlet/>
            </main>
        </div>
      </div>
    );
}

export default Layout;