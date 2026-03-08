Vue.component('kanban-column', {
  props: {
    column: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="kanban-column">
      <h2>{{ column.name }}</h2>
      <p>Задач: {{ column.cards.length }}</p>
    </div>
  `
})

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