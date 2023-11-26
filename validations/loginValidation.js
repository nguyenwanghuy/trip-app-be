import * as Yup from 'yup';
export const loginSchema = Yup.object().shape({
    username: Yup.string().required(),
    password: Yup.string().min(6).required(),
})