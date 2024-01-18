import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import { router } from '../router/Routes'
import { store } from '../store/configureStore'

const sleep = () => new Promise(resolve => setTimeout(resolve, 300))

axios.defaults.baseURL = import.meta.env.VITE_API_URL

const responseBody = (response: AxiosResponse) => response.data

axios.interceptors.request.use(config => {
  const token = store.getState().account.user?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  async response => {
    if (import.meta.env.DEV) await sleep()
    return response
  },
  (error: AxiosError) => {
    const { data, status } = error.response as AxiosResponse
    switch (status) {
      case 400:
        if (data.errors) {
          const modelStateErrors: string[] = []
          for (const key in data.errors) {
            if (data.errors[key]) {
              modelStateErrors.push(data.errors[key])
            }
          }
          throw modelStateErrors.flat()
        }
        toast.error(data.title)
        break
      case 401:
        toast.error(data.title)
        break
      case 500:
        router.navigate('/server-error', { state: { error: data } })
        break
      default:
        break
    }

    return Promise.reject(error.response)
  }
)

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: object) => axios.post(url, body).then(responseBody),
  put: (url: string, body: object) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody)
}

const Course = {
  list: () => requests.get(`courses`),
  preview: (id: number) => requests.get(`courses/preview/${id}`),
  details: (id: number, params: URLSearchParams) =>
    requests.get(`courses/${id}`, params)
}

const Lesson = {
  update: (id: number, body: object) => requests.put(`userlessons/${id}`, body)
}

const Test = {
  details: (lessonId: number) => requests.get(`tests/lessonId/${lessonId}`)
}

const Account = {
  login: (values: any) => requests.post('account/login', values),
  register: (values: any) => requests.post('account/register', values),
  currentUser: () => requests.get('account/currentUser')
}

const TestErrors = {
  get400Error: () => requests.get('buggy/bad-request'),
  get401Error: () => requests.get('buggy/unauthorised'),
  get404Error: () => requests.get('buggy/not-found'),
  get500Error: () => requests.get('buggy/server-error'),
  getValidationError: () => requests.get('buggy/validation-error')
}

const agent = {
  Course,
  Lesson,
  Test,
  Account,
  TestErrors
}

export default agent
