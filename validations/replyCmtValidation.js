import * as Yup from 'yup';
export const replyCmtSchema = Yup.object().shape({
  description: Yup.string(),
});
