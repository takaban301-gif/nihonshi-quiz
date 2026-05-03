import { useState } from 'react'
import './App.css'
import QuestionCard from './components/QuestionCard'
import questions from './data/questions.json'

function App() {
  const [currentIndex, setCurrentIndex] = useState(
    () => Math.floor(Math.random() * questions.length)
  )

  function handleNext() {
    // ランダムに次の問題を選ぶ（同じ問題が連続しないよう配慮）
    let next
    do {
      next = Math.floor(Math.random() * questions.length)
    } while (questions.length > 1 && next === currentIndex)
    setCurrentIndex(next)
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">日本史問題演習</h1>
        <p className="app-subtitle">大学受験対策</p>
      </header>

      <p className="question-counter">問題 {currentIndex + 1} / {questions.length}</p>

      <QuestionCard
        key={currentIndex}
        question={currentQuestion}
        onNext={handleNext}
      />
    </div>
  )
}

export default App
