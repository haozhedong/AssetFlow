import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import Holdings from "./pages/Holdings";
import Transactions from "./pages/Transactions";
import AIInsights from "./pages/AIInsights";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/ai" element={<AIInsights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;