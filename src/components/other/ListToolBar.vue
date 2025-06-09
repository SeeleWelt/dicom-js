<template>
  <div class="selectable-list">
    <!-- 标题 -->
    <div v-if="title" class="list-title">{{ title }}</div>

    <!-- 列表项 -->
    <div
      v-for="(item, index) in values"
      :key="index"
      class="list-item"
      :class="{ selected: item === selectedValue }"
      @click="selectItem(item)"
    >
      <span class="item-text">{{ item }}</span>
      <span v-if="item === selectedValue" class="checkmark">✔️</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // 列表标题
    title: {
      type: String,
      default: "",
    },
    // 默认选中的值
    defaultValueString: {
      type: String,
      default: "",
    },
    // 列表数据数组
    values: {
      type: Array,
      required: true,
    },
    // 选中值变化时的回调函数
    onSelectedValueChange: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      selectedValue: this.defaultValueString // 当前选中的值
    };
  },
  methods: {
    selectItem(item) {
      // 更新选中的值
      this.selectedValue = item

      // 触发回调函数
      this.onSelectedValueChange(item);
    },
  },
};
</script>

<style scoped>
.selectable-list {
  max-width: 300px;
  max-height: 400px;
  z-index: 1000;      /* 设置一个较高的 z-index 值，可以不让其他元素覆盖这么类型 */
}

.list-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  background-color: rgba(255,255,255,1);
}

.list-item.selected {
  background-color: #e0f7fa;
  color: #00796b;
}

.item-text {
  flex: 1;
}

.checkmark {
  margin-left: 8px;
}
</style>