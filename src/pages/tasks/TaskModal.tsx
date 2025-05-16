import { Col, DatePicker, Form, Input, Modal, Row, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface Filters {
  nome?: string[] | string;
  descricao?: string[] | string;
  status?: string[];
}

function TaskModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    mostrarTarefas();
  }, [filters]);

  const handleChange: OnChange = (_, filters, sorter) => {
    setFilters(filters);
    setSortedInfo(sorter as Sorts);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => {
    if (id) {
      editarTarefas(id);
      return;
    }

    adicionarTarefa();
  };

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

  return (
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
                options={Categorias.map((categoria) => ({
                  value: categoria.id,
                  label: categoria.nome,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default TaskModal;
