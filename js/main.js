let app = new Vue({
  el: '#app',
  data: {
    columns: [
      { id: 1, name: 'Запланированные задачи', cards: [] },
      { id: 2, name: 'Задачи в работе', cards: [] },
      { id: 3, name: 'Тестирование', cards: [] },
      { id: 4, name: 'Выполненные задачи', cards: [] }
    ]
  }
})