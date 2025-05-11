import * as yup from 'yup'

export const courseValidationSchema = yup.object({
  title: yup.string().required(),
  priceFull: yup.number().required().moreThan(0),
  priceMonthly: yup.number().required().moreThan(0),
  description: yup.string().required()
})

export const sectionValidationSchema = yup.object({
  title: yup.string().required(),
  description: yup.string()
})

const FILE_SIZE_LIMIT = 100000000 // 100MB
const SUPPORTED_FORMATS = [
  'video/mp4'
]

const videoSchema = yup
  .mixed()
  .test('fileSize', 'File too large', (file: any) => {
    return !file || (file && file.size <= FILE_SIZE_LIMIT)
  })
  .test('fileFormat', 'Unsupported Format', (file: any) => {
    if (!file) return true
    // const extension = file.path.split('.').pop()?.toLowerCase()
    // return file.type ? SUPPORTED_FORMATS.includes(file.type) : extension === 'asf'
    return SUPPORTED_FORMATS.includes(file.type)
  })
  .notRequired()

export const lessonValidationSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
  theory: videoSchema,
  practice: videoSchema
})
