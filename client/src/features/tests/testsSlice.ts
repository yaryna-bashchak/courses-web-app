import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'
import { Test } from '../../app/models/test'
import agent from '../../app/api/agent'
import { RootState } from '../../app/store/configureStore'

interface TestsState {
  lessonId: number
  status: string
}

const testsAdapter = createEntityAdapter<Test>()

export const fetchTestsAsync = createAsyncThunk<Test[], number>(
  'tests/fetchTestsAsync',
  async (lessonId, thunkAPI) => {
    try {
      return await agent.Test.details(lessonId)
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.data })
    }
  }
)

export const testsSlice = createSlice({
  name: 'tests',
  initialState: testsAdapter.getInitialState<TestsState>({
    lessonId: 0,
    status: 'idle'
  }),
  reducers: {
    clearTests: state => {
      state.entities = {}
      state.ids = []
      state.lessonId = 0
    },
    setQuestion: (state, action) => {
      testsAdapter.upsertOne(state, action.payload)
    },
    removeQuestion: (state, action) => {
      testsAdapter.removeOne(state, action.payload)
    },
    setOption: (state, action) => {
      const option = action.payload
      const test = state.entities[option.testId]

      if (test) {
        const existingOptionIndex = test.options.findIndex(
          t => t.id === option.id
        )

        if (existingOptionIndex !== -1) {
          test.options[existingOptionIndex] = option
        } else {
          test.options.push(option)
        }
      }
    },
    removeOption: (state, action) => {
      const { id } = action.payload
      const testsArray = Object.values(state.entities);

      const test = testsArray.find(
        t => t?.options.some(o => o.id === id)
      );

      if (test) {
        test.options.filter(option => option.id !== id)
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTestsAsync.pending, state => {
      state.status = 'pendingFetchTests'
    })
    builder.addCase(fetchTestsAsync.fulfilled, (state, action) => {
      if (action.payload) {
        testsAdapter.setAll(state, action.payload)
        state.lessonId = action.meta.arg
      }
      state.status = 'idle'
    })
    builder.addCase(fetchTestsAsync.rejected, (state, action) => {
      console.log(action.payload)
      state.status = 'idle'
    })
  }
})

export const testSelectors = testsAdapter.getSelectors(
  (state: RootState) => state.tests
)

export const { 
  clearTests,
  setQuestion,
  removeQuestion,
  setOption,
  removeOption,
} = testsSlice.actions
