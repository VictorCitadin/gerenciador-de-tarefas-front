import { DeleteTwoTone, EditTwoTone, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputRef,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  TableColumnsType,
  TableColumnType,
  Tag,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { FilterDropdownProps } from "antd/es/table/interface";
import { TableProps } from "antd/lib";
import axios from "axios";
import dayjs from "dayjs";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";

type OnChange = NonNullable<TableProps<Tarefas>["onChange"]>;
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

interface Tarefas {
  id: number;
  nome: string;
  descricao: string;
  prazo: Date;
  categoria_id: number;
}

interface Categoria {
  id: number;
  nome: string;
  ativo: boolean;
}

interface Option {
  value: string | number;
  label: string | ReactNode;
  children?: Option[];
}

const { TextArea } = Input;

const appStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
  minHeight: "30vh",
  alignItems: "center",
  gap: "2em",
};

interface Filters {
  nome?: string[] | string;
  descricao?: string[] | string;
  status?: string[];
}

function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tarefas, setTarefas] = useState<Tarefas[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = useForm();
  const [id, setId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleChange: OnChange = (_, filters, sorter) => {
    setFilters(filters);
    setSortedInfo(sorter as Sorts);
  };

  useEffect(() => {
    mostrarCategorias();
  }, []);

  useEffect(() => {
    mostrarTarefas();
  }, [filters]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (id) {
      editarTarefas(id);
      return;
    }

    adicionarTarefa();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (id: number) => {
    showModal();
    carregarTarefa(id);
    setId(id);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const getColumnSearchProps = (
    dataIndex: string
  ): TableColumnType<Tarefas> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Pesquisa ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Pesquisar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Fechar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: TableColumnsType<Tarefas> = [
    {
      title: "Nome",
      dataIndex: "nome",
      width: "20em",
      ...getColumnSearchProps("nome"),
    },
    {
      title: "Descrição",
      dataIndex: "descricao",
      ellipsis: true,
      ...getColumnSearchProps("descricao"),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "12em",
      filters: [
        { text: "Pendente", value: "pendente" },
        { text: "Andamento", value: "andamento" },
        { text: "Realizada", value: "realizada" },
        { text: "Atrasada", value: "atrasada" },
      ],
      render: (status) => getTag(status),
    },
    { title: "Categoria", dataIndex: "nome_categoria", width: "12em" },
    {
      title: "Prazo",
      dataIndex: "prazo",
      width: "8em",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.prazo).valueOf() - dayjs(b.prazo).valueOf(),
      sortOrder: sortedInfo.columnKey === "prazo" ? sortedInfo.order : null,
      key: "prazo",
    },
    {
      title: "",
      dataIndex: "id",
      width: "7em",
      render: (id) => (
        <Space>
          <EditTwoTone onClick={() => handleEdit(id)} />
          <Popconfirm
            onConfirm={() => excluirTarefas(id)}
            title="Apagar tarefa"
            description="Tem certeza que deseja apagar?"
            okText="Sim"
            cancelText="Não"
          >
            <DeleteTwoTone />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const adicionarTarefa = async () => {
    const values = form.getFieldsValue();
    setLoading(true);

    try {
      values.prazo = values.prazo.format("YYYY-MM-DD");
      await axios.post("http://localhost:8000/api/tarefas/criar", values);
      mostrarTarefas();
      fecharModal();
      message.success("Tarefa salva com sucesso.");
    } catch (error) {
      message.error("Erro ao adicionar tarefa.");
      console.error("Erro ao adicionar tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  async function mostrarTarefas() {
    setLoading(true);

    try {
      if (filters.nome?.length) {
        filters.nome = filters.nome[0];
      }

      if (filters.descricao?.length) {
        filters.descricao = filters.descricao[0];
      }

      const response = await axios.get("http://localhost:8000/api/tarefas", {
        params: filters,
      });
      setTarefas(response.data);
    } catch (error) {
      message.error("Erro ao mostrar tarefa.");
      console.error("Erro ao carregar tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function mostrarCategorias() {
    try {
      const response = await axios.get("http://localhost:8000/api/categorias");
      setCategorias(response.data);
    } catch (error) {
      message.error("Erro ao mostrar categoria.");
      console.error("Erro ao carregar tarefa:", error);
    }
  }

  async function editarTarefas(id: number) {
    const values = form.getFieldsValue();
    try {
      values.prazo = values.prazo.format("YYYY-MM-DD");
      await axios.put(`http://localhost:8000/api/tarefas/${id}`, values);
      fecharModal();
      mostrarTarefas();
      setId(undefined);
      message.success("Tarefa salva com sucesso.");
    } catch (error) {
      message.error("Erro ao editar tarefa.");
      console.error("Erro ao editar tarefa:", error);
    }
  }

  async function excluirTarefas(id: number) {
    setLoading(true);

    try {
      await axios.delete(`http://localhost:8000/api/tarefas/deletar/${id}`);
      mostrarTarefas();
      message.success("Tarefa excluida com sucesso.");
    } catch (error) {
      message.error("Erro ao excluir tarefa.");
      console.error("Erro ao excluir tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarTarefa(id: number) {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/tarefas/carregar/${id}`
      );
      data.prazo = dayjs(data.prazo);
      form.setFieldsValue(data);
    } catch (error) {
      message.error("Erro ao carregar tarefa.");
      console.error("Erro ao adicionar categoria:", error);
    }
  }

  const getTag = (status: string) => {
    switch (status) {
      case "pendente":
        return <Tag color="yellow">Pendente</Tag>;
      case "andamento":
        return <Tag color="blue">Andamento</Tag>;
      case "realizada":
        return <Tag color="green">Realizada</Tag>;
      case "atrasada":
        return <Tag color="red">Atrasada</Tag>;
      default:
        return "";
    }
  };

  const statusOptions: Option[] = [
    {
      label: getTag("pendente"),
      value: "pendente",
    },
    {
      label: getTag("andamento"),
      value: "andamento",
    },
    {
      label: getTag("realizada"),
      value: "realizada",
    },
    {
      label: getTag("atrasada"),
      value: "atrasada",
    },
  ];

  return (
    <div style={appStyle}>
      <Modal
        title="Adicionar tarefa"
        open={isModalOpen}
        onOk={() => handleOk()}
        okButtonProps={{ loading }}
        okText="Salvar"
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={adicionarTarefa}
          form={form}
          initialValues={{ prazo: dayjs() }}
          preserve={false}
        >
          <Form.Item label="Prazo" name="prazo">
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Nome" name="nome">
            <Input
              placeholder="Nome da tarefa"
              style={{ justifyContent: "center" }}
            />
          </Form.Item>
          <Form.Item label="Desscrição" name="descricao">
            <TextArea
              placeholder="Descrição"
              rows={3}
              style={{ justifyContent: "center" }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select style={{ width: "100%" }} options={statusOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoria_id" label="Categoria">
                <Select
                  style={{ width: "100%" }}
                  options={categorias.map((categoria) => ({
                    value: categoria.id,
                    label: categoria.nome,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Flex gap="middle" vertical style={{ width: "100%" }}>
        <Flex align="center" gap="middle">
          <Button type="primary" onClick={showModal} loading={loading}>
            Adicionar tarefa
          </Button>
        </Flex>
        <Table<Tarefas>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={tarefas}
          scroll={{ y: "50vh" }}
          pagination={false}
          onChange={handleChange}
        />
      </Flex>
    </div>
  );
}

export default Home;
