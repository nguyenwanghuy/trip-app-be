import * as Yup from 'yup';
export const registerSchema = Yup.object().shape({
    fullname: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().email("Email does not exist").required(),
    password: Yup.string().min(6).required(),
})