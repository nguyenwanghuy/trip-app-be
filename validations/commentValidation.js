import * as Yup from 'yup';
export const commentSchema = Yup.object().shape({
  description: Yup.string(),
});
