import * as Yup from 'yup';
export const postSchema = Yup.object().shape({
  content: Yup.string().required(),
  description: Yup.string().required(),
  image: Yup.array().required(),
});
