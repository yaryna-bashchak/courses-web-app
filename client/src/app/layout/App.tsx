import { useEffect, useState } from "react";
import { Lesson } from "../models/lesson";
import ListOfLessons from "../../features/listOfLessons/ListOfLessons";

function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/lessons')
      .then(response => response.json())
      .then(data => setLessons(data))
  }, [])

  function addLesson() {
    setLessons(prevState => [...prevState,
      {
        id: prevState.length + 1,
        title: 'Тема ' + (prevState.length + 1),
        description: 'На уроці ви дізнаєтеся про те і те.',
        urlTheory: "",
        urlPractice: "string",
        number: prevState.length + 1,
        importance: 1,
        isCompleted: false,
        keywords: [
          {
            id: 6,
            word: "кут"
          },
        ],
      }])
  }

  return (
    <>
      <h1>План ZNO-шника</h1>
      <ListOfLessons lessons={lessons} addLesson={addLesson} />
    </>
  );
}

export default App;
