


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"
// import Dashboard from "./pages/Dashboard"
import MainLayout from "./components/MainLayout";
// import AddLead from "./pages/Leads/AddLeads";
// import LeadView from "./pages/Leads/LeadView";
// import AddExecutive from "./pages/salesExcuting/AddExecutive";
// import ViewExecutives from "./pages/salesExcuting/ViewExecutives";
// import LeadPipeline from "./pages/Leads/LeadPipeline";
// import FollowUps from "./pages/Leads/FollowUps";
// import Dashboard from "./pages/Leads/Dashboard";
// import LeadTimeline from "./pages/Leads/LeadTimeline";
import { Toaster } from 'react-hot-toast';
import CategoryManager from "./pages/CategoryManager";
import Products from "./pages/Products";
import Banners from "./pages/Banners";



function App() {

  // const { data } = useGetProfileQuery()


  return (
    <BrowserRouter>

      <Toaster
        // position="ce"
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />

      <Routes>

        <Route path="/login" element={<Login />} />
        {/* <Route element={<ProtectRoute />}> */}
          <Route element={<MainLayout />}>
          <Route path="/Category" element={<CategoryManager />} />
          <Route path="/Products" element={<Products />} />
          <Route path="/" element={<Banners />} />



          </Route>

        {/* </Route> */}

      </Routes>

    </BrowserRouter>
  );
}

export default App;