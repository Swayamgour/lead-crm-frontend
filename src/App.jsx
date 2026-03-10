


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"
// import Dashboard from "./pages/Dashboard"
import MainLayout from "./components/MainLayout";
import AddLead from "./pages/Leads/AddLeads";
import LeadView from "./pages/Leads/LeadView";
import AddExecutive from "./pages/salesExcuting/AddExecutive";
import ViewExecutives from "./pages/salesExcuting/ViewExecutives";
import LeadPipeline from "./pages/Leads/LeadPipeline";
import FollowUps from "./pages/Leads/FollowUps";
import Dashboard from "./pages/Leads/Dashboard";
import LeadTimeline from "./pages/Leads/LeadTimeline";
import { Toaster } from 'react-hot-toast';
import AssignLeadView from "./pages/salesExcuting/AssignLeadView";
import ProtectRoute from "./components/ProtectRoute";


function App() {
  return (
    <BrowserRouter>
      <Toaster />

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route element={<ProtectRoute />}>
          <Route element={<MainLayout />}>




            <Route path="/" element={<Dashboard />} />

            <Route path="/Leads" element={<LeadView />} />
            <Route path="/addLeads" element={<AddLead />} />

            <Route path="/addExecutive" element={<AddExecutive />} />
            <Route path="/ViewExecutives" element={<ViewExecutives />} />

            <Route path="/LeadPipeline" element={<LeadPipeline />} />
            <Route path="/followUps" element={<FollowUps />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/LeadTimeline" element={<LeadTimeline />} />
            <Route path="/AssignLeadView/:id" element={<AssignLeadView />} />

          </Route>

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;