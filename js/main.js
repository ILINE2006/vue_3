Vue.component('kanban-card', {
  props: {
    card: {
      type: Object,
      required: true
    },
    columnId: {
      type: Number,
      required: true
    }
  },
  template: `
    <div class="kanban-card" :class="{ overdue: card.isOverdue, 'on-time': !card.isOverdue && columnId === 4 }">
      <h3>{{ card.title }}</h3>
      <p class="description">{{ card.description }}</p>
      <p class="dates">Дэдлайн: {{ card.deadline }}</p>
      <p class="dates">Создано: {{ card.createdAt }}</p>
      <p v-if="card.updatedAt" class="dates">Обновлено: {{ card.updatedAt }}</p>
      <p v-if="card.returnReason" class="return-reason">Причина возврата: {{ card.returnReason }}</p>
      <div class="card-actions">
        <button v-if="columnId <= 3" @click="$emit('edit-card', card.id)" class="btn btn-small btn-secondary">Редактировать</button>
        <button v-if="columnId === 1" @click="$emit('delete-card', card.id)" class="btn btn-small btn-danger">Удалить</button>
        <button v-if="columnId === 1" @click="$emit('move-card', card.id, columnId, columnId + 1)" class="btn btn-small btn-primary">В работу</button>
        <button v-if="columnId === 2" @click="$emit('move-card', card.id, columnId, columnId + 1)" class="btn btn-small btn-primary">В тестирование</button>
        <button v-if="columnId === 3" @click="$emit('move-card', card.id, columnId, columnId + 1)" class="btn btn-small btn-success">Выполнено</button>
        <button v-if="columnId === 3" @click="$emit('return-card', card.id)" class="btn btn-small btn-warning">Вернуть</button>
      </div>
    </div>
  `
})

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
      <kanban-card 
        v-for="card in column.cards" 
        :key="card.id"
        :card="card"
        :column-id="column.id"
        @edit-card="$emit('edit-card', $event)"
        @delete-card="$emit('delete-card', $event)"
        @move-card="(id, from, to) => $emit('move-card', id, from, to)"
        @return-card="$emit('return-card', $event)">
      </kanban-card>
      <button v-if="column.id === 1" @click="$emit('create-card', column.id)" class="btn btn-primary">
        + Создать задачу
      </button>
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
  },
  mounted() {
    const saved = localStorage.getItem('kanbanBoard')
    if (saved) {
      this.columns = JSON.parse(saved)
    }
  },
  watch: {
    columns: {
      handler(newVal) {
        localStorage.setItem('kanbanBoard', JSON.stringify(newVal))
      },
      deep: true
    }
  },
  methods: {
    createCard(columnId) {
      const title = prompt('Название задачи:')
      const description = prompt('Описание:')
      const deadline = prompt('Дэдлайн (YYYY-MM-DD):')
      
      if (title && deadline) {
        const column = this.columns.find(c => c.id === columnId)
        column.cards.push({
          id: Date.now(),
          title: title,
          description: description || '',
          deadline: deadline,
          createdAt: new Date().toLocaleString(),
          updatedAt: null,
          status: 'planned',
          isOverdue: false,
          returnReason: null
        })
      }
    },
    editCard(cardId) {
      for (let column of this.columns) {
        const card = column.cards.find(c => c.id === cardId)
        if (card) {
          const title = prompt('Название задачи:', card.title)
          const description = prompt('Описание:', card.description)
          const deadline = prompt('Дэдлайн:', card.deadline)
          
          if (title) {
            card.title = title
            card.description = description || ''
            card.deadline = deadline
            card.updatedAt = new Date().toLocaleString()
          }
          break
        }
      }
    },
    deleteCard(cardId) {
      if (confirm('Удалить задачу?')) {
        for (let column of this.columns) {
          const cardIndex = column.cards.findIndex(c => c.id === cardId)
          if (cardIndex !== -1) {
            column.cards.splice(cardIndex, 1)
            break
          }
        }
      }
    },
    moveCard(cardId, fromColumnId, toColumnId) {
      const fromColumn = this.columns.find(c => c.id === fromColumnId)
      const toColumn = this.columns.find(c => c.id === toColumnId)
      const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId)
      const card = fromColumn.cards.splice(cardIndex, 1)[0]
      
      card.updatedAt = new Date().toLocaleString()
      
      if (toColumnId === 4) {
        const deadline = new Date(card.deadline)
        const now = new Date()
        card.isOverdue = deadline < now
        card.status = card.isOverdue ? 'overdue' : 'completed'
      }
      
      toColumn.cards.push(card)
    },
    returnCard(cardId) {
      const reason = prompt('Причина возврата:')
      if (reason) {
        for (let column of this.columns) {
          const card = column.cards.find(c => c.id === cardId)
          if (card && column.id === 3) {
            card.returnReason = reason
            card.updatedAt = new Date().toLocaleString()
            const column2 = this.columns.find(c => c.id === 2)
            column.cards.splice(column.cards.indexOf(card), 1)
            column2.cards.push(card)
            break
          }
        }
      }
    }
  }
})
