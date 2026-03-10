Vue.component('task-form', {
  props: {
    mode: {
      type: String,
      required: true
    },
    card: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      title: '',
      description: '',
      deadline: '',
      error: ''
    }
  },

  mounted() {
    if (this.mode === 'edit' && this.card) {
      this.title = this.card.title
      this.description = this.card.description || ''
      this.deadline = this.card.deadline
    }
  },

  template: `
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h3>{{ mode === 'create' ? 'Создать задачу' : 'Редактировать задачу' }}</h3>
        
        <p v-if="error" class="error-message">{{ error }}</p>
        
        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Название:</label>
            <input type="text" v-model="title" placeholder="Введите название">
          </div>
          
          <div class="form-group">
            <label>Описание:</label>
            <textarea v-model="description" rows="3" placeholder="Необязательно"></textarea>
          </div>
          
          <div class="form-group">
            <label>Дэдлайн (ГГГГ-ММ-ДД):</label>
            <input type="text" v-model="deadline" placeholder="2026-01-15">
          </div>
          
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-primary">
              {{ mode === 'create' ? 'Создать' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,

  methods: {
    submit() {
      this.error = ''
      
      if (!this.title.trim()) {
        this.error = 'Введите название задачи'
        return
      }
      
      if (!this.deadline.trim()) {
        this.error = 'Введите дэдлайн'
        return
      }
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(this.deadline)) {
        this.error = 'Формат: ГГГГ-ММ-ДД (например, 2026-01-15)'
        return
      }
      
      const date = new Date(this.deadline)
      if (isNaN(date.getTime())) {
        this.error = 'Некорректная дата'
        return
      }
      
      this.$emit('submit', {
        title: this.title.trim(),
        description: this.description.trim(),
        deadline: this.deadline
      })
      
      this.title = ''
      this.description = ''
      this.deadline = ''
    }
  }
})

Vue.component('return-form', {
  props: {
    card: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      reason: '',
      error: ''
    }
  },

  template: `
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h3>Вернуть задачу в работу</h3>
        <p class="card-title">{{ card.title }}</p>
        
        <p v-if="error" class="error-message">{{ error }}</p>
        
        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Причина возврата:</label>
            <textarea v-model="reason" rows="4" placeholder="Опишите причину..."></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">Отмена</button>
            <button type="submit" class="btn btn-warning">Вернуть</button>
          </div>
        </form>
      </div>
    </div>
  `,

  methods: {
    submit() {
      this.error = ''
      
      if (!this.reason.trim()) {
        this.error = 'Укажите причину возврата'
        return
      }
      
      this.$emit('submit-return', {
        cardId: this.card.id,
        reason: this.reason.trim()
      })
      
      this.reason = ''
    }
  }
})

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
    ],
    showForm: false,
    modalMode: 'create',
    selectedCard: null,
    selectedColumnId: null,
    showReturnForm: false,
    cardForReturn: null
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
    openCreateModal(columnId) {
      this.modalMode = 'create'
      this.selectedCard = null
      this.selectedColumnId = columnId
      this.showForm = true
    },
    openEditModal(cardId) {
      for (let column of this.columns) {
        const card = column.cards.find(c => c.id === cardId)
        if (card) {
          this.modalMode = 'edit'
          this.selectedCard = card
          this.selectedColumnId = column.id
          this.showForm = true
          break
        }
      }
    },
    closeForm() {
      this.showForm = false
      this.selectedCard = null
      this.selectedColumnId = null
    },
    handleFormSubmit(formData) {
      if (this.modalMode === 'create') {
        const column = this.columns.find(c => c.id === this.selectedColumnId)
        column.cards.push({
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          createdAt: new Date().toLocaleString(),
          updatedAt: null,
          status: 'planned',
          isOverdue: false,
          returnReason: null
        })
      } else if (this.modalMode === 'edit') {
        for (let column of this.columns) {
          const card = column.cards.find(c => c.id === this.selectedCard.id)
          if (card) {
            card.title = formData.title
            card.description = formData.description
            card.deadline = formData.deadline
            card.updatedAt = new Date().toLocaleString()
            break
          }
        }
      }
      this.closeForm()
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
    
    openReturnModal(cardId) {
      for (let column of this.columns) {
        const card = column.cards.find(c => c.id === cardId)
        if (card) {
          this.cardForReturn = card
          this.showReturnForm = true
          break
        }
      }
    },
    closeReturnForm() {
      this.showReturnForm = false
      this.cardForReturn = null
    },
    handleReturnSubmit(data) {
      for (let column of this.columns) {
        if (column.id === 3) {
          const card = column.cards.find(c => c.id === data.cardId)
          if (card) {
            card.returnReason = data.reason
            card.updatedAt = new Date().toLocaleString()
            const targetColumn = this.columns.find(c => c.id === 2)
            column.cards.splice(column.cards.indexOf(card), 1)
            targetColumn.cards.push(card)
            break
          }
        }
      }
      this.closeReturnForm()
    }
  }
})