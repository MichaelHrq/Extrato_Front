import * as yup from "yup";

export const schema = yup.object().shape({
  file: yup
    .mixed()
    .required("Selecione um arquivo PDF")
    .test("fileFormat", "Apenas arquivos PDF são permitidos.", (value) => {
      if (!value) return false;
      return value[0] instanceof File && value[0].type === "application/pdf";
    }),
  words: yup
    .array()
    .of(
      yup.object().shape({
        word: yup.string().required("O campo não pode estar vazio").trim(),
      })
    )
    .min(1, "Digite pelo menos 1 palavra"),
});