import { Footer } from "antd/es/layout/layout";
import { Link, Outlet } from "react-router";

function TesteLayout() {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">Tarefas</Link>
        </li>
        <li>
          <Link to="/categorias">Categorias</Link>
        </li>
        <li>
          <Link to="/vitinho">Vitinho</Link>
        </li>
      </ul>

      <Outlet />

      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Vitinho
      </Footer>
    </div>
  );
}

export default TesteLayout;
