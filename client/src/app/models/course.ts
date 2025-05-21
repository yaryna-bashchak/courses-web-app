import { Lesson, LessonPreview } from "./lesson"

export interface Course {
  id: number
  title: string
  description: string
  priceFull: number
  priceMonthly: number
  isActive: boolean
  createdBy: string
  sections: Section[]
}

export interface Section {
  id: number
  courseId: number
  number: number
  title: string
  description: string
  isAvailable: boolean
  lessons: Lesson[]
}

export interface CoursePreview {
  id: number
  title: string
  description: string
  duration: number
  priceFull: number
  priceMonthly: number
  sections: SectionPreview[]
}

export interface SectionPreview {
  id: number
  courseId: number
  number: number
  title: string
  description: string
  isAvailable: number
  lessons: LessonPreview[]
}

export interface LessonParams {
  maxImportance: number;
  onlyUncompleted: boolean;
  searchTerm?: string;
}