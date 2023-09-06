import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Container, Form, Spinner, Stack } from "react-bootstrap";
import { CgClose } from "react-icons/cg";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { schema } from "@/schema/pdf";
import { useState } from "react";
import { saveAs } from "file-saver";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({ resolver: yupResolver(schema) });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  function adicionar() {
    append({ word: "" });
  }

  function remover(index) {
    remove(index);
  }

  async function submit(data) {
    setLoading(true);
    try {
      const response = await axios({
        method: "post",
        url: "http://127.0.0.1:8080/pdf2excel",
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
        responseType: 'blob'
      })
      if (response.status === 200 && response.data instanceof Blob) {
        const data = await response.data.arrayBuffer();
        downloadExcelFile(data);
      } else {
        console.error('Erro ao obter o arquivo Excel');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const downloadExcelFile = (data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, 'excel_file.xlsx');
  };

  return (
    <Container className="d-flex justify-content-center">
      <Form
        className="mt-5"
        style={{ width: "100%", maxWidth: "700px" }}
        onSubmit={handleSubmit(submit)}
      >
        <Form.Group className="mb-5" controlId="inputFile">
          <Form.Label>Selecione seu arquivo:</Form.Label>
          <Form.Control accept=".pdf" type="file" {...register("file")} />
          <Form.Text className="text-danger">
            {errors.file && <span>{errors.file.message}</span>}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-5" controlId="inputWords">
          <Stack direction="horizontal" gap={3}>
            <Form.Label className="m-0">
              Digite as palavras que serão filtradas:
            </Form.Label>
            <Button
              className="border-0  ms-auto"
              onClick={adicionar}
              ariant="primary"
            >
              <IoMdAdd size={20} />
            </Button>
          </Stack>

          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <Form.Group className="mt-3 d-flex gap-1" controlId="inputWord">
                  <Form.Control
                    type="text"
                    {...register(`words[${index}].word`)}
                  />
                  <Button
                    variant="outline-danger"
                    className="border-0"
                    onClick={()=>remover(index)}
                  >
                    <CgClose fill="3rem" />
                  </Button>
                </Form.Group>
                <Form.Text className="text-danger">
                  {errors.words?.[index]?.word && (
                    <span>{errors.words?.[index]?.word.message}</span>
                  )}
                </Form.Text>
              </div>
            );
          })}

          <Form.Text className="text-danger">
            {errors?.words?.message && <span>{errors?.words?.message}</span>}
          </Form.Text>
        </Form.Group>

        <div className="d-flex justify-content-center gap-2">
          <Button style={{ width: "100px" }} type="submit">
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
