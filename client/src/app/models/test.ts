export interface Test {
  id: number
  question: string
  type: string
  imgUrl: string
  options: Option[]
}

export interface Option {
  id: number
  testId: number
  text: string
  imgUrl: string
  isAnswer: boolean
}

export interface UserStatistic {
  isScoreHigherThanAverage: boolean
  isUserInTopPercent: boolean
}