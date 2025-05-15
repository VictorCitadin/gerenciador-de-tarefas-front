import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  TableColumnsType,
} from "antd";
import { useForm } from "antd/es/form/Form";
import axios from "axios";
import { useEffect, useState } from "react";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const appStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
  minHeight: "30vh",
  alignItems: "center",
  gap: "2em",
};

function Categorias() {
  const [id, setId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();

  const handleEdit = (id: number) => {
    showModal();
    carregarCategoria(id);
    setId(id);
  };

  const handleDelete = (id: number) => {
    excluirCategorias(id);
  };

  const handleOk = () => {
    if (id) {
      editarCategorias(id);
      return;
    }

    adicionarCategoria();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setId(undefined);
  };

  const [categorias, setCategorias] = useState([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    mostrarCategorias();
  }, []);

  const columns: TableColumnsType<DataType> = [
    { title: "Nome", dataIndex: "nome" },
    {
      title: "Status",
      dataIndex: "ativo",
      render: (value) => (value ? "Ativo" : "Inativo"),
    },
    {
      title: "",
      dataIndex: "id",
      key: "x",
      render: (id) => (
        <Space>
          <EditTwoTone onClick={() => handleEdit(id)} />
          <DeleteTwoTone onClick={() => handleDelete(id)} />
        </Space>
      ),
      width: "8em",
    },
  ];

  async function adicionarCategoria() {
    const values = form.getFieldsValue();
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/categorias/criar", values);
      fecharModal();
      mostrarCategorias();
      message.success("Categoria salva com sucesso.");
    } catch (error) {
      message.error("Erro ao adicionar categoria.");
      console.error("Erro ao adicionar categoria: ", error);
    } finally {
      setLoading(false);
    }
  }

  async function mostrarCategorias() {
    setLoading(true);

    try {
      const response = await axios.get("http://localhost:8000/api/categorias");
      setCategorias(response.data);
      console.log(response);
    } catch (error) {
      message.error("Erro ao mostrar as categorias.");
      console.error("Erro ao carregar categoria:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarCategoria(id: number) {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/categorias/carregar/${id}`
      );
      console.log(data);
      form.setFieldsValue(data);
    } catch (error) {
      message.error("Erro ao carregar as categorias.");
      console.error("Erro ao adicionar categoria:", error);
    }
  }

  async function excluirCategorias(id: number) {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/categorias/deletar/${id}`
      );
      mostrarCategorias();
      console.log("Tarefa excluida com sucesso:", response.data);
    } catch (error) {
      message.error("Erro ao excluir a categoria.");
      console.error("Erro ao adicionar categoria:", error);
    }
  }

  async function editarCategorias(id: number) {
    const values = form.getFieldsValue();
    try {
      const response = await axios.put(
        `http://localhost:8000/api/categorias/${id}`,
        values
      );

      fecharModal();
      mostrarCategorias();
      message.success("Categoria salva com sucesso.");
      setId(undefined);
      console.log("Tarefa editada com sucesso:", response.data);
    } catch (error) {
      message.error("Erro ao editar a categoria.");
      console.error("Erro ao editar tarefa:", error);
    }
  }

  return (
    <div style={appStyle}>
      <Modal
        title="Adicionar categoria"
        open={isModalOpen}
        onOk={() => handleOk()}
        okButtonProps={{ loading }}
        okText="Salvar"
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={adicionarCategoria}
          form={form}
          preserve={false}
          initialValues={{ ativo: true }}
        >
          <Form.Item label="Nome" name="nome">
            <Input
              placeholder="Nome da categoria"
              style={{ justifyContent: "center" }}
            />
          </Form.Item>
          <Form.Item label="Status" name="ativo" valuePropName="checked">
            <Checkbox>Ativo</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Flex gap="middle" vertical style={{ width: "100%" }}>
        <Flex align="center" gap="middle">
          <Button type="primary" onClick={showModal} loading={loading}>
            Adicionar categoria
          </Button>
        </Flex>
        <Table<DataType>
          loading={loading}
          columns={columns}
          dataSource={categorias}
          scroll={{ y: "50vh" }}
          pagination={false}
        />
      </Flex>
    </div>
  );
}

export default Categorias;
