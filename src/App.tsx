import { ConfigProvider, Typography } from "antd";
import ptBR from "antd/locale/pt_BR";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import LayoutOfficial from "./LayoutOfficial";
import "./reset.css";
import Categorias from "./pages/Categorias";
import EasterEgg from "./pages/EasterEgg";

function App() {
  return (
    <ConfigProvider locale={ptBR}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LayoutOfficial />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/vitinho"
              element={<Typography.Title>Oii!</Typography.Title>}
            />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/easteregg" element={<EasterEgg />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
